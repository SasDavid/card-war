import '../styles/sesion.css'
import { useState, useEffect, useContext } from 'react';
import { MyContext } from './variablesGlobal';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin'

function Sesion () {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")

    const { login, isLoading } = useLogin();

    const { socket, url } = useContext(MyContext)

    const navigate = useNavigate();


    const logear = e =>{
        e.preventDefault();

        login({ userName, password })

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

                {/*<header>Iniciar Sesion</header>*/}

                {isLoading 
                ? <p style={{"margin": "0"}}>Cargando...</p>
                : <header>Iniciar Sesion</header>
                }

                {/*<p style={{"margin": "0"}}>Cargando...</p>*/}


                <input onChange={(e => setUserName(e.target.value))} value={userName} required className='input_name' placeholder='Name of user' type="text" />
                <input onChange={(e => setPassword(e.target.value))} value={password} required className="input_password" placeholder='Password' type="password" />
                
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