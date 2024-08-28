import "../styles/header.css"

import React, { useContext, useEffect, useState } from "react"

import { MyContext } from './variablesGlobal.jsx';

import TimeSVG from "../svgs/time.jsx";
import AudioOff from "../svgs/audioOff.jsx";
import AudioOn from "../svgs/audioOn.jsx";
import DoorSVG from "../svgs/door.jsx";
import StatusSVG from "../svgs/status.jsx";
import TurnSVG from "../svgs/turn.jsx";
import { useNavigate } from "react-router-dom";


function Header (){

    const [turn, setTurn] = useState("???");
    const [puntsMe, setPuntsMe] = useState(0);
    const [puntsHeShe, setPuntsHeShe] = useState(0);
    const { socket, room, status, time, URL } = useContext(MyContext);

    const [audio, setAudio] = useState(false)
    const navigate = useNavigate();

    useEffect(()=>{

        socket.on("turn", data =>{

            if(data == "Winner" || data == "Defeat" || data == "TimeOut" || data == "VictoryForTime") {
                // Se crean dos EVENTOS y DEBO personalizar si ganó o perdió
                const dialogNewGame = document.getElementById("dialog_newGame");
                dialogNewGame.setAttribute("open", "")
                dialogNewGame.getElementsByTagName("h3")[0].textContent = data;
            } else {

                setTurn(data)

            }
        })

        
        socket.on("redirect",  data =>{
            
            navigate(`/login`);
        })

        socket.on("resetPunts", ()=>{
            setPuntsMe(0)
            setPuntsHeShe(0)
        })


        socket.on("sound-info", data =>{
            document.getElementById("audio-fight").setAttribute("src", data)
        })

        socket.on("upPunts", ({ cardOne, cardTwo })=>{
            setPuntsMe(a => a + 2);
            const cardTable = document.querySelectorAll(".card-table__img");
            
            cardTable[cardOne].classList.add("winner")
            cardTable[cardTwo].classList.add("winner")

            document.getElementById("audio-fight").setAttribute("src", "/sounds/well.mp3")
        })

        socket.on("upPuntsHeShe", ({ cardOne, cardTwo })=>{
            setPuntsHeShe(a => a + 2);
            const cardTable = document.querySelectorAll(".card-table__img");

            cardTable[cardOne].classList.add("defeated")
            cardTable[cardTwo].classList.add("defeated")

            document.getElementById("audio-fight").setAttribute("src", "/sounds/attacked.mp3")
        })

        
        

        return ()=>{
            socket.off("turn")
            socket.off("upPunts")
            socket.off("upPuntsHeShe")
            socket.off("resetPunts");
            socket.off("redirect")
        }

        
    }, [])

    const handleSound = (e)=>{
        e.target.volume = .025;
    }


    const handleClick = () => {
        console.log("La función ha sido ejecutada desde el componente hijo.");
      };

    return (
        <>
            <header id="header">
               
                <div className="door-svg">
                    <DoorSVG fill="#fff" height={50} />
                    <span>{room}</span>
                </div>

                <div className="status-svg">
                    <StatusSVG fill="#fff" height={40} />
                    <span>{status}</span>
                </div>

                <div className="turn-svg">
                    <TurnSVG fill="#fff" height={40} />
                    <span>{turn}</span>
                </div>

                <span className="punts">{puntsMe} / {puntsHeShe}</span>

                <div className="time-svg">
                    <TimeSVG fill="#fff" width={40} />
                    <span>{time}s</span>
                </div>
                <div className="audio-svg">
                    {audio 
                    ? 
                    (
                    <>
                        <AudioOn click={()=> setAudio(false)} fill="#fff" width={40} />
                        <audio loop onPlay={handleSound} src="/sounds/background.mp3" autoPlay></audio>
                    </>
                    )
                    : 
                    (
                    <>
                        <AudioOff click={()=> setAudio(true)} fill="#fff" width={40} />
                    </>
                    )
                    }
                    
                </div>
                
            </header>

            <audio id="audio-fight" src="/" autoPlay></audio>
        </>
    )
}

export default Header