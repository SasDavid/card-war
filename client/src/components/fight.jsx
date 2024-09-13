import { useEffect, useContext, useState } from "react";
import "../styles/fight.css"
import { MyContext } from "./variablesGlobal";

const Fight = ()=>{

    const [infoServer, setInfoServer] = useState("...")

    const { socket, room, imgBlob } = useContext(MyContext)

    const cardArray = Array(20).fill(null)
    

    function resetCard () {

        const cardTable = document.querySelectorAll(".card-table__img");
        cardTable.forEach(element => {
            element.classList.remove("winner", "defeated")
            element.setAttribute("src", "../cards.png")
        })
    }

    useEffect(()=>{

        socket.on("resetCard", ()=>{
            resetCard();
        })

        socket.on("cardSelected", ({card, type}) => {
            const cardTable = document.querySelectorAll(".card-table__img");
            cardTable[card].setAttribute("src", imgBlob[type]);
        })

        socket.on("spinCard", ({ cardOne, cardTwo }) => {
          const cards = [cardOne, cardTwo];

          const cardTable = document.querySelectorAll(".card-table__img");

          cards.forEach(card => {
            cardTable[card].setAttribute("src", "../cards.png");
            cardTable[card].style.animation = "turnCard .2s ease-out";
          });

          setTimeout(() => {
            cards.forEach(card => {
              cardTable[card].style.animation = "";
            });
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
                {cardArray.map((_, index)=>(
                    <img
                      key={index}
                      className="card-table__img"
                      onClick={() => handleCard(index)}
                      src="/cards.png"
                      alt=""
                    />
                ))}
            </section>
        </>
    )
}


export default Fight
