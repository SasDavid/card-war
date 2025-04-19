import express from 'express';
const mainRouter = express.Router();
import fs from 'node:fs'
import path from 'node:path'
import jwt from "jsonwebtoken"
import { ruta } from '../index.js'
import CardTable, { serverListLoad, indexServer } from '../modules/cardTable.js'
import { io } from '../index.js'

mainRouter.get("/resourcesImg/:value", async (req, res)=>{
   
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


mainRouter.get("/resetTime", (req, res)=>{
   console.log("TimeReset")
   //console.log(req.cookies)
   res.send(":)")
})

mainRouter.get("/bueno", (req, res)=>{
   res.send("Bueno")
})

mainRouter.post("/logear", (req, res)=>{

   const { username, password } = req.body;

   const token = jwt.sign({ username, password }, process.env.SECRET_JWT_KEY);

   setTimeout(()=>{

      res.cookie("user", token, {
         httpOnly: true
      }).send("/")

   }, 500)


})


mainRouter.post("/createServer", (req, res) =>{

      const { user } = req.cookies;
      const { title } = req.body;


      if(user == undefined) {
         res.json({message: "login"})
         return
      }

      const existServer = CardTable.create({title, user});

   
      if(!existServer) {

         serverListLoad.push(
            { id: indexServer, room: title, joined: "1", serverStatus: "Waiting"}
         )

         io.to("lobby").emit("updateServerList", serverListLoad)

         res.cookie("room", title, {
            httpOnly: true
         }).json({message: "room", goRoom: title});

      } else {
         res.json({message: "Ya existe el servidor"})
         //socket.emit("existServer", existServer)
      }
      
})


mainRouter.post("/joinServer", (req, res)=>{

      const { user } = req.cookies;
      const { title } = req.body;

      if(user == undefined) {
         res.json({ message: "login"})
         return
      }

      console.log("el titulo es " + title)

      const notExistServer = CardTable.join({ title, user })

      if(notExistServer) {
         res.json({ message: "No existe el servidor "})
      } else {


         res.cookie("room", title, {
            httpOnly: true
         }).json({message: "exist", goRoom: title});

         const roomIndex = serverListLoad.findIndex(element => element.room == title)
         // console.log(serverListLoad)
         // console.log(roomIndex)
         serverListLoad[roomIndex].joined = "2"
         serverListLoad[roomIndex].serverStatus = "Full"


         io.to("lobby").emit("updateServerList", serverListLoad)


         //socket.leave("lobby");

         //console.log(serverListLoad)
         //io.to("lobby").emit("updateServerList", serverListLoad)
         //socket.emit("enterServer", data)
      }

})



export default mainRouter