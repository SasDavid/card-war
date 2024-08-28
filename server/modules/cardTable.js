export let listTable = [];

export let serverListLoad = [];

let indexServer = 0;


class CardTable {

    constructor(){}

    static create = ({ socket, title, user }) => {

       const ExistServer = listTable.find(element => element.title == title);
       if(ExistServer) return "El servidor ya existe";

        socket.join(title)

        const objeto = {
            title,
            sockets : [socket],
            cards: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].sort(()=> Math.random() - 0.5),
            selectedCards : 0,
            selectedCardNum : [null, null],
            cardNum : [null, null],
            status : "processing",
            punts : [0, 0],
            turn : undefined,
            identification: [user],
            time: 20,
            relojStatus: "off",
            timeOut: undefined,
            ready: [false, false],
            playing: false,
            cardPar: [],
            joined: "1 / 2",
            serverStatus: "Waiting...",
            idServer: indexServer
        }

        listTable.push(objeto);
        indexServer++;
        
    }

    static resetHeader = ({ table, allSockets })=>{

        const count = table.identification[1] == null ? 0 : 1;

        table.time = 20;
        table.relojStatus = "off"
        this.cronometro({ table, allSockets });

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

                    // Otra tirada de cartas
                    if(table.punts[0] < 10 && table.punts[1] < 10) {
                        table.status = "start";
                        table.time = 20;
                        allSockets.to(table.title).emit("resetTime", table.time);
                        table.relojStatus = "on"
                        this.cronometro({ table, allSockets });
                    }

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
                    }

                    // EMPATE
                    if(table.punts[0] == 10 && table.punts[1] == 10){
                        allSockets.to(table.title).emit("turn", "Draw");
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

    static desconexion = ({ id, allSockets }) => {

        console.log("Alguien se ha desconectado con la id: ", id)

        const roomIndex = listTable.findIndex(element => 
            element.sockets[0].id == id || element.sockets[1].id == id);
            
        // No pertenece a ninguna room
        if(roomIndex == -1) return

        const table = listTable[roomIndex];
        const index = table.sockets[0].id == id ? 0 : 1;

        // Si se salió el 0 y el 1 no está, deten la ejecución
        //Eliminar room
        if(index == 0 && table.sockets[1] == null) {

            listTable = listTable.filter(element => element.title != table.title)
            serverListLoad = serverListLoad.filter(element => element.room != table.title)
            indexServer--;
            return;

        }
            
        table.sockets[index == 0 ? 1 : 0].emit("infoServer", "¡Tu oponente ha abandonado la sala!")
        serverListLoad[table.idServer].joined = "1 / 2";
        serverListLoad[table.idServer].serverStatus = "Waiting...";
        

        // Intercambiar de la posicion 1 a la 0 si es el 0 el que se salió
        if(index == 0){
            table.sockets[0] = table.sockets[1];
            table.identification[0] = table.identification[1]
        }

        table.sockets[1] = null;
        table.identification[1] = null;

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

    static imReady = ({ user, allSockets })=>{

        const roomIndex = listTable.findIndex(element =>
            element.identification[0] == user || element.identification[1] == user
        )
        const table = listTable[roomIndex];

        if(table.playing) return;

        const index = table.ready[0] == false ? 0 : 1;
        table.ready[index] = true
        if(table.ready[index == 0 ? 1 : 0] == false) {
            table.sockets[index].emit("infoServer", "Waiting opponent...")
            table.sockets[index].emit("sound-info", "/sounds/ready.mp3")
        } else {
            allSockets.to(table.title).emit("infoServer", "Get ready for fight")
            allSockets.to(table.title).emit("sound-info", "/sounds/start.mp3")
            this.resetHeader({ table, allSockets })
            table.playing = true
            setTimeout(()=>{
                allSockets.to(table.title).emit("infoServer", "¡Fight!")
                allSockets.to(table.title).emit("sound-info", "/sounds/start-2.mp3")
                this.assignTurn({ table, allSockets });
            }, 12000)
        }

    }

    static join = ({ socket, room, user }) => {

       const ExistServer = listTable.find(element => element.title == room);
       if(!ExistServer) return "No hay servidor para jugar"

        for (let i = 0; i < listTable.length; i++) {
            if(listTable[i].title.includes(room)){
                socket.join(room);
                const index = listTable[i].sockets[0] == null ? 0 : 1;
                listTable[i].sockets[index] = socket;
                listTable[i].identification[index] = user;
                serverListLoad[listTable[i].idServer].joined = "2 / 2";
                serverListLoad[listTable[i].idServer].serverStatus = "Fight";
            }
        }

    }
}




export default CardTable