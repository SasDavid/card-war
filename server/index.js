 import express from "express";
 import http from "node:http";
 import path from 'path'
 import cors from "cors";
 import { Server as SocketServer } from "socket.io";
 import CardTable, { listTable, serverListLoad } from "./modules/cardTable.js"
 import jwt from "jsonwebtoken"
import { SECRET_JWT_KEY } from "../config.js";
import cookieParser from "cookie-parser";
import cookie from 'cookie'
import fs from 'fs';


const localhost = false;
let ruta;

const app = express();

const allowedOrigin = process.env.ORIGIN || 'http://localhost:5173';

app.use(cookieParser())
app.use(cors({
   origin: allowedOrigin,
   credentials: true
}))

app.use(express.json())

if (localhost) {
   ruta = allowedOrigin;
 } else {
   ruta = path.resolve("client", "dist");
   app.use(express.static(ruta));
 }

const server = http.createServer(app);
 const io = new SocketServer(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true
    }
 })


 app.get("/", (req, res)=>{
   res.send("Hello world")
 })


app.get("/resourcesImg/:value", async (req, res)=>{
   
   fs.readFile(path.resolve("server", "card-types", req.params.value + ".png"), (err, data)=>{
      if (err) {
         console.log(err)
         console.log("Ha habido un error")
         res.status(500).send('Error al leer la imagen');
         return;
       }

      res.setHeader('Content-Type', 'image/jpeg');
      res.send(data);
   })

})


app.post("/logear", (req, res)=>{

   const { username, password } = req.body;

   const token = jwt.sign({ username, password }, SECRET_JWT_KEY, {
      expiresIn: "1h"
   });
   

   res.cookie("user", token, {
      httpOnly: true
      //sameSite: "none", //strict, lax
      //expire : 10000,
      //maxAge: 1000 * 60 * 60 //1 hour
   }).send("http://localhost:5173")

   console.log("cookieCreada")

   
})


io.on("connection", socket =>{

   socket.join("lobby")

   console.log("An user has connected: ", socket.id);

   socket.emit("updateServerList", serverListLoad)

   socket.on("handleMessage", data =>{
      socket.broadcast.emit("handleMessage", data)
   })

   socket.on("joinServer", data=>{

      const { user } = cookie.parse(socket.handshake.headers.cookie || "")

      if(user == undefined) {
         socket.emit("redirect", "login")
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
      //console.log('User disconnected with ID:', socket.id);
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