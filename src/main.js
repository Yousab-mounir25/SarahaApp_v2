import express from 'express'
import { authenticationController  ,userController } from './modules/index.js'
import { globalErrorHandling } from './middleware/index.js'
import { PORT } from './config.js'
import { bootstrapDB } from './DB/connection.db.js'
import { decryption, encryption } from './common/security/encryption.security.js'
import cors from 'cors'
const app =express()
const port = PORT
app.use(cors())
app.use(express.json())
bootstrapDB(app,port)


app.get('/' , (req,res,next)=>{
    return res.status(200).json({message:"Hello world"})
})

app.use('/auth' , authenticationController)
app.use('/user' , userController)
app.all('{/*dummy}' , (req,res,next)=>{
    return res.status(404).json({message:"invalid ROuting"})
})
app.use(globalErrorHandling)
// app.listen(port , ()=>{
//     console.log(`app is running on port ${port}`);
    
// })