import React, { createContext, useState, useEffect } from 'react';
import io from "socket.io-client"

let url, produccion = true;
 
produccion ? url = window.location.protocol + "//" + window.location.hostname
           : url = window.location.protocol + "//" + window.location.hostname + ":3000"

const socket = io(url, {
  withCredentials: true,
  auth: {
      nombre: "David"
  }
});


// Crear el contexto
export const MyContext = createContext();

export function MyProvider({ children }) {
  const [room, setRoom] = useState('...');
  const [status, setStatus] = useState("...")
  const [time, setTime] = useState(20)
  const [imgBlob, setImgBlob] = useState([])

  useEffect(()=>{

    socket.on("connect_error", (e) => {
      setStatus("Off")
    });

    socket.on("connect", ()=>{
      setStatus("On");
    })

    socket.on("downTime", ()=>{
      setTime(a => a - 1)
    })

    socket.on("resetTime", data =>{
      setTime(data)
    })

    return ()=>{
      socket.off("connect_error")
      socket.off("connect");
      socket.off("downTime")
      socket.off("resetTime")
    }
  }, [])

  // Valor del contexto con múltiples variables
  const value = {
    socket,
    room, setRoom,
    status,
    time,
    url,
    imgBlob, setImgBlob
  };

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
