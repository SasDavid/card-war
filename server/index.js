import http from "node:http";
import path from 'node:path'

import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";
import CardTable, { listTable, serverListLoad } from "./modules/cardTable.js"

import cookieParser from "cookie-parser";
import cookie from 'cookie'

import mainRouter from './routes/main.js'

const app = express();

export let ruta;

const getOrigin = "local";

if(getOrigin == "local") {
   ruta = 'http://localhost:5173';

} else if(getOrigin == "prueba"){
   ruta = 'http://localhost:5173';
   app.use(express.static(path.resolve("client", "dist")));

} else if(getOrigin == "produccion"){
   ruta = path.resolve("client", "dist");
   app.use(express.static(ruta));
}

app.use(express.json())

app.use(cookieParser())

app.use(cors({
   origin: ruta,
   credentials: true
}))




const server = http.createServer(app);
const io = new SocketServer(server, {
   cors: {
      origin: ruta,
      credentials: true
   }
})


app.use('/', mainRouter)


io.on("connection", socket =>{

   socket.join("lobby")

   socket.emit("updateServerList", serverListLoad)

   socket.on("handleMessage", data =>{
      socket.broadcast.emit("handleMessage", data)
   })

   socket.on("joinServer", data=>{

      const { user } = cookie.parse(socket.handshake.headers.cookie || "")

      if(user == undefined) {
         socket.emit("redirect", "/login")
         return
      }

      const notExistServer = CardTable.join({ socket, room: data, user })

      if(notExistServer) {
         console.log("No existe el servidor")
      } else {
         socket.leave("lobby");

         console.log(serverListLoad)
         io.to("lobby").emit("updateServerList", serverListLoad)
         socket.emit("enterServer", data)
      }

   })

   socket.on("cardSelected", ({card, room}) =>{
      CardTable.click({ card, roomTitle: room, socket, allSockets: io});
      
   })

   socket.on("createServer", data =>{

      const { user } = cookie.parse(socket.handshake.headers.cookie || "");

      if(user == undefined) {
         socket.emit("redirect", "login")
         return
      }

      const existServer = CardTable.create({socket, title: data, user});

   
      if(!existServer) {
         socket.leave("lobby");

         const ListLoad = listTable.map(element => {
            const { title, joined, serverStatus, idServer } = element
            return { room: title, joined, serverStatus, id: idServer }
         })
   
         serverListLoad.push(...ListLoad)
      
         io.to("lobby").emit("updateServerList", serverListLoad)

         socket.emit("enterServer", data)
      } else {
         socket.emit("existServer", existServer)
      }
      
   })

   socket.on('disconnect', () => {
      CardTable.desconexion({ id : socket.id, allSockets: io})
      io.to("lobby").emit("updateServerList", serverListLoad)

   });

   socket.on("imReady", ()=>{

      const { user } = cookie.parse(socket.handshake.headers.cookie || "")
      CardTable.imReady({ user, allSockets: io })
      
   })

})


const PORT = process.env.PORT ?? 3000;

server.listen(PORT, ()=>{
   console.log(`Servido inicializado en el puerto ${PORT}`);
})