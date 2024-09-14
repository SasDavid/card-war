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

const getOrigin = "produccion";

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
export const io = new SocketServer(server, {
   cors: {
      origin: ruta,
      credentials: true
   }
})


app.use('/', mainRouter)


io.on("connection", socket =>{

   console.log("anyone has connected")

   socket.join("lobby")

   socket.emit("updateServerList", serverListLoad)

   socket.on("handleMessage", data =>{
      socket.broadcast.emit("handleMessage", data)
   })

   socket.on("cardSelected", ({card, room}) =>{
      CardTable.click({ card, roomTitle: room, socket, allSockets: io});
   })

   socket.on('disconnect', () => {
      const { user } = cookie.parse(socket.handshake.headers.cookie || "")
      CardTable.desconexion({ user, socket, allSockets: io})
      io.to("lobby").emit("updateServerList", serverListLoad)
   });

   socket.on("imReady", ()=>{
      const { user } = cookie.parse(socket.handshake.headers.cookie || "")
      const { room } = cookie.parse(socket.handshake.headers.cookie || "")
      CardTable.imReady({ title: room, user, socket, allSockets: io })
      
   })

   socket.on("joinRoom", ({ title })=>{
      CardTable.joinRoom({ title, socket })
   })


})


const PORT = process.env.PORT ?? 3000;

server.listen(PORT, ()=>{
   console.log(`Servido inicializado en el puerto ${PORT}`);
})