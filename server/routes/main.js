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


mainRouter.post("/logear", (req, res)=>{

   const { username, password } = req.body;

   const token = jwt.sign({ username, password }, process.env.SECRET_JWT_KEY, {
      expiresIn: "3h"
   });
   

   res.cookie("user", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3 //3 hour
   }).send(ruta)

})


mainRouter.post("/createServer", (req, res) =>{

      const { user } = req.cookies;
      const { title } = req.body;

      //console.log(title)

      if(user == undefined) {
         res.json({message: "login"})
         return
      }

      const existServer = CardTable.create({title, user});

   
      if(!existServer) {
         //socket.leave("lobby");

         /*

         const ListLoad = listTable.map(element => {
            const { title, joined, serverStatus, idServer } = element
            return { room: title, joined, serverStatus, id: idServer }
         })
   
         serverListLoad.push(...ListLoad)
      
         io.to("lobby").emit("updateServerList", serverListLoad)
         */

       //  console.log(data)

         serverListLoad.push(
            { id: indexServer, room: title, joined: "1", serverStatus: "Waiting"}
         )

         io.to("lobby").emit("updateServerList", serverListLoad)

         res.cookie("room", title, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 3 //3 hour
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
         res.json({ message: "login "})
         return
      }

      const notExistServer = CardTable.join({ title, user })

      if(notExistServer) {
         res.json({ message: "No existe el servidor "})
      } else {
         res.cookie("room", title, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 3 //3 hour
         }).json({message: "exist", goRoom: title});


         //socket.leave("lobby");

         //console.log(serverListLoad)
         //io.to("lobby").emit("updateServerList", serverListLoad)
         //socket.emit("enterServer", data)
      }

})



export default mainRouter