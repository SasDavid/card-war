import { useState, useEffect, useContext } from 'react'
import "./index.css"
import './App.css'

import { useNavigate } from "react-router-dom"
import { MyContext } from './components/variablesGlobal'



function App() {
  const [nameServer, setNameServer] = useState("roro");
  const [nameRoom, setNameRoom] = useState("");
  const navigate = useNavigate();
  const [imgLoad, setImgLoad] = useState(0);
  const [loadingImg, setLoadingImg] = useState(true)
  const [serverList, setServerList] = useState([]);
  const [percent, setPercent] = useState(0);

  const { socket, setRoom, ruta, imgBlob, setImgBlob } = useContext(MyContext)


  const joinServer = ()=>{
   socket.emit("joinServer", nameRoom);
  }

  const createServer = ()=>{
    socket.emit("createServer", nameServer)
  }

  const requestImage = num =>{

    console.log("cantidad")

    const controller = new AbortController();
    const signal = controller.signal;

    setImgLoad(prev => prev + 1);

    // Fetch que se ejecuta solo una vez
    fetch(ruta + '/resourcesImg/' + num, { signal })
    .then(response => response.blob())
    .then(data => {
      const newElement = document.createElement("img");
      const blobURL = URL.createObjectURL(data);

      newElement.src = blobURL;
     // setImgBlob[num]

      document.body.appendChild(newElement);

      newElement.onload = ()=> {
        URL.revokeObjectURL(blobURL)

      }
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    });

  }

  useEffect(() => {

    if(imgBlob.length == 10 && imgBlob.every(element => element != undefined)){
  
      setTimeout(()=>{
        setLoadingImg(false)
        document.getElementById("contenedorLoad").close();

        const a = document.createElement("IMG");
        document.body.appendChild(a)

        document.querySelectorAll(".section-server__button").forEach(element =>{
          element.classList.add("button_on")
        })

      }, 500)
    } else {
      document.getElementById("contenedorLoad").showModal();
      setLoadingImg(true)
    }

    //console.log(loadingImg)

  }, [imgBlob]);

  const teclado = (e)=>{

    if(e.key == "o"){
      document.getElementById("contenedorLoad").showModal();
    }

    if(e.key == "p"){
      document.getElementById("contenedorLoad").close();
    }


    if(e.key == "l"){
      requestImage();
    }
  }

  useEffect(()=>{


    const controller = new AbortController();
    const signal = controller.signal;

    let arrayBlob = [];

    const fetchPromises = [];


    for (let i = 0; i <= 9; i++) {
      if(imgBlob[i] == undefined) {

          setImgLoad(prev => prev + 1);

          // Fetch que se ejecuta solo una vez
          const fetchPromise = fetch(ruta + '/resourcesImg/' + i, { signal })
          .then(response => response.blob())
          .then(data => {
            const newElement = document.createElement("img");
            const blobURL = URL.createObjectURL(data);

            newElement.src = blobURL;

            arrayBlob[i] = blobURL;

           // console.log(imgBlob)

            //document.body.appendChild(newElement);

            newElement.onload = ()=> {
              setPercent(a => a + 10)
             // URL.revokeObjectURL(blobURL)
            }
          })
          .catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Fetch error:', error);
            }
          });

          fetchPromises.push(fetchPromise);
      }
    }

    // Espera a que todas las promesas fetch se completen antes de actualizar el estado
    Promise.all(fetchPromises).then(() => {
      setImgBlob(arrayBlob);
    });

   // setImgBlob(arrayBlob);

    socket.on("updateServerList", data =>{
      setServerList(data)
    })
    
    socket.on("enterServer", data =>{
      setRoom(data)
      navigate(`/rooms/${data}`);
    })

    socket.on("existServer", message =>{
      console.log(message);
    })

    document.addEventListener("keypress", teclado)
  
    return ()=>{
      socket.off("enterServer");
      socket.off("existServer");
      socket.off("updateServerList")
      document.removeEventListener("keypress", teclado)
      controller.abort()
    }

    
  },[])

  

  return (
    <>

    


    <h1 className='text-lobby'>Servidor...</h1>

    <main>

    <section id="section-server">
      <input value={nameServer} onChange={(e)=> setNameServer(e.target.value)} type="text" placeholder='Name of the room' />
      <button className='section-server__button' onClick={createServer}>Crear servidor</button>
      <input value={nameRoom} onChange={(e) => setNameRoom(e.target.value)} type="text" placeholder='introduce la sala'/>
      <button className='section-server__button' onClick={joinServer}>Unirse al servidor</button>
    </section>

    <section id="server-list">
      <div>
        <h2>Server List:</h2>
        <ul>
          {serverList.map(element => (
            <li key={element.id}>
              | Room: {element.room} | {element.joined} | {element.serverStatus} |
            </li>
          ))}
        </ul>
      </div>
    </section>

    </main>


    {loadingImg 
      ? (
        <dialog id="contenedorLoad">
          <h3>Cargando...</h3>
          <div className="loadResources">
            <div style={{width: percent + "%"}} className="loadCurrent"></div>
          </div>
        </dialog>
      )
      : (
        <span>Beta</span>
      )
    }





    </>
  )
}

export default App
