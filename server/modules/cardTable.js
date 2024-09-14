export let listTable = [];

export let serverListLoad = [];

export let indexServer = 0;


class CardTable {

    constructor(){}

    static create = ({ title, user }) => {

       const ExistServer = listTable.find(element => element.title == title);
       if(ExistServer) return "El servidor ya existe";

        //socket.join(title)

        const objeto = {
            title,
            sockets : [],
            cards: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].sort(()=> Math.random() - 0.5),
            selectedCards : 0,
            selectedCardNum : [null, null],
            cardNum : [null, null],
            status : "processing",
            punts : [0, 0],
            turn : undefined,
            identification: [],
            time: 20,
            relojStatus: "off",
            timeOut: undefined,
            ready: [false, false],
            playing: false,
            cardPar: [],
            joined: "1 / 2",
            serverStatus: "Waiting...",
            idServer: indexServer,
        }

        listTable.push(objeto);
        indexServer++;
        
    }

    static resetHeader = ({ table, allSockets })=>{

        const count = table.identification[1] == null ? 0 : 1;

        table.time = 20;
        table.relojStatus = "off"
        this.cronometro({ table, allSockets });

        table.identification = [];

        table.ready[0] = false
        table.ready[1] = false
        table.punts[0] = 0;
        table.punts[1] = 0;

        table.cardNum[0] = null;
        table.cardNum[1] = null;

        table.selectedCards = 0;

        table.cardPar = []

        table.cards = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].sort(()=> Math.random() - 0.5);
        table.playing = false

        table.status = "processing";

        if(count == 0) {
            table.sockets[0].emit("resetTime", table.time);
            table.sockets[0].emit("resetCard")
            table.sockets[0].emit("resetPunts")
            table.sockets[0].emit("turn", "???");
        } else {
            allSockets.to(table.title).emit("resetTime", table.time);
            allSockets.to(table.title).emit("resetCard")
            allSockets.to(table.title).emit("resetPunts")
            allSockets.to(table.title).emit("turn", "???");
        }

    }

    static click = ({ card, roomTitle, socket, allSockets }) => {

        const roomIndex = listTable.findIndex(element => element.title == roomTitle);
        const table = listTable[roomIndex];

        if(socket.id != table.turn || table.status == "processing") return;
        
        if(table.sockets[0].id == socket.id || table.sockets[1].id == socket.id){
 
            const cardSelected = table.cards[card];
            table.cardNum[table.selectedCards] = card;

            // Esa carta ya tiene par resuelta (First Card)
            if(table.cardPar.find(element => element == card)) return;

            // Se repitió exactamente la misma carta (Second Card)
            if(table.cardNum[0] == table.cardNum[1]) return

            allSockets.to(table.title).emit("cardSelected", { card, type: cardSelected });
            table.selectedCardNum[table.selectedCards] = cardSelected;


            if(table.selectedCards == 1){

                table.selectedCards = 0;

                table.status = "processing";

                // Desactivar el cronometro anterior
                table.relojStatus = "off"
                this.cronometro({ table, allSockets });

                //THE CARDS LOOK ALIKE
                if(table.selectedCardNum[0] == table.selectedCardNum[1]){

                    // Elevar punto al socket
                    socket.emit("upPunts", {cardOne: table.cardNum[0], cardTwo: table.cardNum[1]});

                    // Sincronizar punto del socket
                    const puntsOther = socket.id == table.sockets[0].id ? 0 : 1;
                    table.sockets[puntsOther == 0 ? 1 : 0].emit("upPuntsHeShe", {cardOne: table.cardNum[0], cardTwo: table.cardNum[1]});
                    table.punts[puntsOther] = table.punts[puntsOther] += 2;

                    // A WINNER AND A DEFEATED
                    if(table.punts[0] > 10 || table.punts[1] > 10){
                        const indexWinner = table.punts[0] > 10 ? 0 : 1
                        table.sockets[indexWinner].emit("turn", "Winner")
                        table.sockets[indexWinner].emit("sound-info", "/sounds/winner.mp3")
                        table.sockets[indexWinner == 0 ? 1 : 0].emit("turn", "Defeat")
                        table.sockets[indexWinner == 0 ? 1 : 0].emit("sound-info", "/sounds/defeated.mp3")

                        table.ready[0] = false
                        table.ready[1] = false
                        table.playing = false

                        table.identification = [];
                        //table.sockets = [] 
                        return;
                    }

                    // EMPATE
                    if(table.punts[0] == 10 && table.punts[1] == 10){
                        allSockets.to(table.title).emit("turn", "Draw");
                    } 

                    // Otra tirada de cartas
                    if(table.punts[0] < 12 && table.punts[1] < 12) {
                        table.status = "start";
                        table.time = 20;
                        allSockets.to(table.title).emit("resetTime", table.time);
                        table.relojStatus = "on"
                        this.cronometro({ table, allSockets });
                    }


                    
                    table.cardPar.push(table.cardNum[0], table.cardNum[1]);

                } else {
                    // THE CARDS DON'T LOOK ALIKE
                    setTimeout(()=>{
                        allSockets.to(table.title).emit("spinCard", {cardOne: table.cardNum[0], cardTwo: table.cardNum[1]});   
                        table.status = "start";
                        this.assignTurn({ table, allSockets });
                        table.cardNum[1] = null;
                    }, 1000)

                    socket.emit("sound-info", "/sounds/bad.mp3")
                    table.time = 20;
                    allSockets.to(table.title).emit("resetTime", table.time);  
                }

            } else {
                socket.emit("sound-info", "/sounds/selected-card.mp3")
                table.selectedCards += 1;
            }
        }
    }

    static desconexion = ({ user, socket, allSockets }) => {

        //return;

        //Solo tendra validez si anda dentro de una room

        console.log("Alguien se ha desconectado con la id: ", socket.id)

        const roomIndex = listTable.findIndex(element => {
            if(element.sockets.length > 0){
                return element.sockets.some(item => item.id == socket.id) 
            }
        })
            
        // No pertenece a ninguna room
        if(roomIndex == -1) {
            console.log("No pertenezco a ninguna sala")
            return;
        }

        console.log("Me desconecte y pertenecia a la room " + listTable[roomIndex].title)

        const table = listTable[roomIndex];
        const index = table.sockets[0].id == socket.id ? 0 : 1;

        // Si se salió el 0 y el 1 no está, deten la ejecución
        //Eliminar room
        if(index == 0 && table.sockets[1] == null) {

            listTable = listTable.filter(element => element.title != table.title)
            serverListLoad = serverListLoad.filter(element => element.room != table.title)
            indexServer--;
            console.log("borra server")
            return;

        }
            
        table.sockets[index == 0 ? 1 : 0].emit("infoServer", "Ready?")
        serverListLoad[table.idServer].joined = "1";
        serverListLoad[table.idServer].serverStatus = "Waiting...";
        

        // Si se salió el 0 y el 1 si está, cambiar la posición del 1 para el 0
        if(index == 0){
            table.sockets[0] = table.sockets[1];
            table.identification[0] = table.identification[1]
        }

        // Quitar la posicion 1 independientemente de quien se salió
        //table.sockets[1] = null;
        //table.identification[1] = null;

        table.sockets.pop();
        table.identification.pop();

        this.resetHeader({ table })

    }

    static cronometro = ({ table, allSockets })=>{

        if(table.relojStatus == "off") {
            clearTimeout(table.timeOut)
            return;
        }

        table.timeOut = setTimeout(()=>{
            table.time -= 1;
            table.sockets[0].emit("downTime")
            table.sockets[1].emit("downTime")

            if(table.time == 0) {

                const index = table.turn == table.sockets[0].id ? 0 : 1

                if(index == 0) {
                    table.sockets[0].emit("turn", "TimeOut")
                    table.sockets[1].emit("turn", "VictoryForTime")
                    this.resetHeader({ table, allSockets })
                } else {
                    table.sockets[1].emit("turn", "TimeOut")
                    table.sockets[0].emit("turn", "VictoryForTime")
                    this.resetHeader({ table, allSockets })
                }

            } else {
                this.cronometro({ table, allSockets })
            }
        }, 1000)
    }


    static assignTurn = ({ table, allSockets })=> {

        const turnIndex = table.status == "processing" ? 
        Math.random() < 0.5 ? 0 : 1 : table.turn == table.sockets[0].id ? 1 : 0;

        const otherIndex = 1 - turnIndex;
        table.sockets[turnIndex].emit("turn", "Me");
        table.sockets[otherIndex].emit("turn", "He/She");
        table.turn = table.sockets[turnIndex].id;

        table.relojStatus = "on";
        this.cronometro({ table, allSockets }) //on cronometro
        table.status = "start"
        
    }

    static imReady = ({ title, user, socket, allSockets })=>{

        const existServer = listTable.find(element => element.title == title);

        if(existServer.identification != undefined) {

            //Ya estaba listo
            const notReady = existServer.identification.every(element => element != user)
            //const notReady = true
            if(!notReady) return;

        }

        if(existServer.playing) return;

        //Ahora estoy listo
        existServer.identification.push(user)
        //existServer.sockets.push(socket);
        socket.join(title)

        if(existServer.identification.length == 2){
            allSockets.to(title).emit("infoServer", "Get ready for fight")
            allSockets.to("kami").emit("sound-info", "/sounds/start.mp3")
            this.resetHeader({ table: existServer, allSockets })
            existServer.playing = true
            setTimeout(()=>{
                allSockets.to(title).emit("infoServer", "¡Fight!")
                allSockets.to(title).emit("sound-info", "/sounds/start-2.mp3")
                this.assignTurn({ table: existServer, allSockets });
            }, 12000)
        } else {
            socket.emit("infoServer", "Waiting for opponent")
            socket.emit("sound-info", "/sounds/ready.mp3")
        }

        return;

        if(table.playing) return;

        

    }

    static join = ({ title, user }) => {

        const existServer = listTable.find(element => element.title == title);
        if(!existServer) return

        //ExistServer.identification.push(user)

        for (let i = 0; i < listTable.length; i++) {
            if(listTable[i].title.includes(title)){
                //socket.join(room);
                //const index = listTable[i].sockets[0] == null ? 0 : 1;
                //listTable[i].sockets[index] = socket;
                //listTable[i].identification[index] = user;

                //El index es el id
                //serverListLoad[listTable[i].idServer].joined = "2 / 2";
                //serverListLoad[listTable[i].idServer].serverStatus = "Fight";
            }
        }
    }

    static joinRoom = ({ title, socket })=>{

        const room = listTable.find(element => element.title == title);
        if(room){
            socket.join(title)
            room.sockets.push(socket)
            console.log("Unido a la room " + title)
        }

    }
}




export default CardTable