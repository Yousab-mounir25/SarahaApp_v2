import { model } from "mongoose";
import { create, findOne } from "../../common/repository/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import {
  BadException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/index.js";
import {
  decryption,
  encryption,
  compare,
  hash,
  generateToken,
  createLoginCredentials,
} from "../../common/security/index.js";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRESIN,
  REFRESH_TOKEN_EXPIRESIN,
 REFRESH_USER_TOKEN_SIGNATURE,
 WEB_CLIENT_IDS,
} from "../../config.js";
import { ProviderEnum, RoleEnum } from "../../common/enum/user.enum.js";
import {OAuth2Client} from 'google-auth-library';


/**
 * {
  payload: {
    iss: 'https://accounts.google.com',
    azp: '493353823461-4va0tbdp7lnmt5l1ok7u2pq1c2fhkbgu.apps.googleusercontent.com',
    aud: '493353823461-4va0tbdp7lnmt5l1ok7u2pq1c2fhkbgu.apps.googleusercontent.com',
    sub: '110519885660650122691',
    email: 'yousab.mounir@gmail.com',
    email_verified: true,
    nonce: 'not_provided',
    nbf: 1790068273,
    name: 'Yousab Mounir',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocJlCyZ8aWvhcRpQs_nbW1S3TTl_lxh4qspqq19_wdr4VvgWuF8P=s96-c',
    given_name: 'Yousab',
    family_name: 'Mounir',
    iat: 1790068573,
    exp: 1790072173,
    jti: '3f58930c5294d0aa78a42abe54eed53bd875d7aa'
  }
}
 */

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDS,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload(); 
  if(!payload.email_verified){
    throw BadException("not verified email")
  }
  return payload
}


// export const loginWithGoogle = async (user, issuer) => {
//   return await createLoginCredentials({user:existingUser ,issuer})
// }


export const signupWithGmail= async({idToken , issuer})=>{

//after i receive the idToken from the frontend 
//I talked to google to verify the token , then i receive from google the payload that contain the data
const {email , name , picture } = await verifyGoogleAccount(idToken)   
const existAccount = await findOne({
  model:UserModel,
  filter:{email}
})
  if(existAccount){
    if(existAccount.provider != ProviderEnum.GOOGLE){
      throw ConflictException("invalid account provider")
    }
    //login wit google
     return { status:200 ,data:await createLoginCredentials({user:existAccount , issuer})}
  }

  //if not exist --> add user
  const user = await create({
    model:UserModel,
    data:{
      email,
      username:name,
      image:picture,
      confirmEmail:new Date(),
      provider:ProviderEnum.GOOGLE
    }
  })
  return { status:201 ,data:await createLoginCredentials({user:existAccount , issuer})}
}

export const signup = async (inputs) => {
  const { username, email, password, phone, age ,role } = inputs;
  const existingUser = await findOne({
    filter: { email },
    options: { select: "email" },
    model: UserModel,
  });
  if (existingUser) {
    throw ConflictException("Email exist");
  }
  const user = await create({
    data: {
      username,
      email,
      password: await hash({ plainText: password }), //hash the password before saving to the database
      phone: await encryption(phone), //encrypt the phone number before saving to the database
      age,
      role
    },
    model: UserModel,
  });
  return user;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const existingUser = await findOne({
    filter: { email , provider:ProviderEnum.SYSTEM },
    model: UserModel,
  });
  if (!existingUser) {
    throw NotFoundException("invalid login credentials"); // check for email
  }
  const match = await compare(password, existingUser.password); //check for password
  if (!match) {
    throw NotFoundException("invalid login credentials");
  }
  return await createLoginCredentials({user:existingUser ,issuer})
}