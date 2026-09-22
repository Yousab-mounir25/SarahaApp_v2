import { Router } from "express";
import {  login, signup, signupWithGmail } from "./authentication.service.js";
import { successResponse } from "../../common/utils/success.response.js";
import * as validators from './authentication.validation.js'
import { validation } from "../../middleware/validation.middleware.js";

const router  = Router()

//add validation middleware
router.post('/signup', validation(validators.signup) ,async (req,res,next)=>{
    const user = await signup(req.validate)
    return successResponse({res,data:user , message:"User added successfully" , status:201})
})
router.post('/signup-with-gmail' ,async (req,res,next)=>{
    const {status ,data} = await signupWithGmail(req.body , `${req.protocol}://${req.host}`)
    return successResponse({res,data, message:"User added successfully" , status})
})


//add validation middleware
router.post('/login', validation(validators.login) , async (req,res,next)=>{
  const user = await login(req.validate , `${req.protocol}://${req.host}`)
  return successResponse({res  , data:user})
})

export default  router