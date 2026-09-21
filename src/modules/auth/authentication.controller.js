import { Router } from "express";
import {  login, signup } from "./authentication.service.js";
import { successResponse } from "../../common/utils/success.response.js";
import * as validators from './authentication.validation.js'
import { validation } from "../../middleware/validation.middleware.js";

const router  = Router()

//add validation middleware
router.post('/signup', validation(validators.signup) ,async (req,res,next)=>{
    const user = await signup(req.validate)
    return successResponse({res,data:user , message:"User added successfully" , status:201})
})


//add validation middleware
router.post('/login', validation(validators.login) , async (req,res,next)=>{
  const user = await login(req.validate , `${req.protocol}://${req.host}`)
  return successResponse({res  , data:user})
})

export default  router