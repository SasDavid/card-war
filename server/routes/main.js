import express from 'express';
const mainRouter = express.Router();
import fs from 'node:fs'
import path from 'node:path'
import jwt from "jsonwebtoken"
import { ruta } from '../index.js'

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

export default mainRouter