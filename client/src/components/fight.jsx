import { useEffect, useContext, useState } from "react";
import "../styles/fight.css"
import { MyContext } from "./variablesGlobal";

const Fight = ()=>{

    //const [playAgain, setPlayAgain] = useState(false)

    const [infoServer, setInfoServer] = useState("...")

    const { socket, room, imgBlob } = useContext(MyContext)

    function resetCard () {
        const cardTable = document.querySelectorAll(".card-table__img");
        cardTable.forEach(element => {
            
            element.classList.remove("winner", "defeated")
            element.setAttribute("src", "../cards.png")
            
        })
    }

    useEffect(()=>{

        const cardTable = document.querySelectorAll(".card-table__img");
        for (let i = 0; i < cardTable.length; i++) {
            cardTable[i].order = i;
        }

        socket.on("resetCard", ()=>{
            resetCard();
        })

        socket.on("cardSelected", ({card, type}) => {
           // console.log("La carta seleccionada es:", card, type)
            //cardTable[card].setAttribute("src", "../card-types/" + type + ".png");
            cardTable[card].setAttribute("src", imgBlob[type]);
            
        })

        socket.on("spinCard", data=>{
            cardTable[data.cardOne].setAttribute("src", "../cards.png")
            cardTable[data.cardTwo].setAttribute("src", "../cards.png")

            cardTable[data.cardOne].style.animation = "turnCard .2s ease-out";
            cardTable[data.cardTwo].style.animation = "turnCard .2s ease-out";

            setTimeout(() => {

                cardTable[data.cardOne].style.animation = "";
                cardTable[data.cardTwo].style.animation = "";
                
            }, 500);
        });

        socket.on("infoServer", info=>{
            setInfoServer(info)
        })

 


        return ()=>{
            socket.off("cardSelected");
            socket.off("resetCard")
            socket.off("spinCard")
        }

    }, [])

    const handleCard = card =>{
        socket.emit("cardSelected", {card, room})
    }

    const handleReady = ()=>{
        socket.emit("imReady")
    }

    const newGame = ()=>{

        const tipo = document.getElementById("dialog_newGame").removeAttribute("open")
 
    }

    return (
        <>
            <dialog id="dialog_newGame">
                <div>
                    <h3>¡Ganaste!</h3>
                    <button onClick={newGame}>Continuar</button>
                </div>
            </dialog>

            <section id="info-room">
                <h1>Card War</h1>
                <button onClick={handleReady}>Ready?</button>
                <h2>{infoServer}</h2>
            </section>
            
            <section id="card-table">

                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />
                <img className="card-table__img" onClick={(e) => handleCard(e.target.order)} src="/cards.png" alt="" />

            </section>
        </>
    )
}


export default Fight
