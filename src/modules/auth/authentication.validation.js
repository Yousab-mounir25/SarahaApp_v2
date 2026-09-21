import {z} from 'zod'
export const login = z.object({
    email:z.email(),
    password:z.string().min(8).max(16)
})

export const signup = login.extend({
    username:z.string(),
    phone:z.e164(),
    confirmPassword:z.string().min(8).max(16),
}).superRefine((data,ctx)=>{
    if(data.password != data.confirmPassword){
        ctx.addIssue({
            code:"custom",
            path:['confirmPassword'],
            message:"password missmatch with confirmation password"
        })
    }
    if(data.username.includes('admin')){
        ctx.addIssue({
            code:"custom",
            path:['username'],
            message:'UserName cannot be contain admin'
        })
    }
})


// .refine((data)=>{
//     console.log({data});
//     return data.password == data.confirmPassword
// },{message:"password miss match with confirmation password"})