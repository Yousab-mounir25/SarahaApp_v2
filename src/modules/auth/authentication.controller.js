import { Router } from "express";
import {  login, signup } from "./authentication.service.js";
import { successResponse } from "../../common/utils/success.response.js";
const router  = Router()

router.post('/signup' ,async (req,res,next)=>{
    const user = await signup(req.body)
    return successResponse({res,data:user , message:"User added successfully" , status:201})
})

router.post('/login'  , async (req,res,next)=>{
  const user = await login(req.body , `${req.protocol}://${req.host}`)
  return successResponse({res  , data:user})
})

export default  router