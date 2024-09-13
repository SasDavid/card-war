import '../styles/sesion.css'
import { useEffect, useContext } from 'react';
import { MyContext } from './variablesGlobal';
import { useNavigate } from 'react-router-dom'

function Sesion () {

    const { socket, url } = useContext(MyContext)

    const navigate = useNavigate();


    const logear = e =>{
        e.preventDefault();

        const username = document.querySelector(".input_name").value;
        const password = document.querySelector(".input_password").value;


        
        fetch(url + "/logear", {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({ username, password })
        })
        .then(res => res.text())
        .then(res => navigate("/"))
        




        //socket.emit("logear", {username, password});
    }

    useEffect(()=>{

        socket.on("logear", ()=>{
            console.log("Logeado");
        })

        return ()=>{
            socket.off("logear");
        }
    })


    return (
    <>
        <dialog open id="Sesion_Modal">
            <form onSubmit={logear}>

                <header>
                    Iniciar Sesion
                </header>

                <input className='input_name' placeholder='Name of user' type="text" />
                <input className="input_password" placeholder='Password' type="password" />
                
                <div id='confirm'>
                    <button type='submit'>Confirm</button>
                    <button type="button">Cancel</button>
                </div>
    
            </form>
        </dialog>

        <menu>
        <button id="updateDetails">Update details</button>
        </menu>
    </>
    )
}

export default Sesion