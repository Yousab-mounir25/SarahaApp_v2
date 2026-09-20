import { Router } from "express";
import { successResponse } from "../../common/utils/success.response.js";
import { getProfile, rotateToken, updateProfile } from "./user.service.js";
import { authentication } from "../../middleware/index.js";
import { TokenTypeEnum } from "../../common/enum/security.enum.js";
const router  = Router()


//application level middleware to check the authorization before enter the service
router.get('/' , authentication() ,async (req,res,next)=>{
    const data = await getProfile(req.user)
    return successResponse({res,data:data})
})
router.patch('/' , authentication() ,async (req,res,next)=>{
    const data = await updateProfile(req.user , req.body)
    return successResponse({res,data})
})
router.post('/rotate-token' , authentication(TokenTypeEnum.REFRESH) ,async (req,res,next)=>{
    const data = await rotateToken(req.payload, req.user , `${req.protocol}://${req.host}`)
    return successResponse({res,data})
})

export default router