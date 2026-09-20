import jwt, { decode } from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRESIN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRESIN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import {
  BadException,
  NotFoundException,
} from "../exceptions/error.exception.js";
import { findById } from "../repository/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { TokenTypeEnum } from "../enum/security.enum.js";
import { RoleEnum } from "../enum/user.enum.js";

//Generate token
export const generateToken = async ({
  payload = {},
  options = {},
  secretKey = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return await jwt.sign(payload, secretKey, options);
};

// verify token
export const verifyToken = async ({
  token = "",
  secretKey = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return await jwt.verify(token, secretKey);
};

//get signature according to the role
export const getTokenSignatures = async ({ role = RoleEnum.USER } = {}) => {
  let signatures;
  switch (role) {
    case role == RoleEnum.ADMIN:
      signatures = {
        accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
      };
      break;
    default:
      signatures = {
        accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
      };
      break;
  }
  return signatures;
};

//return access and refresh tokens according to the role
export const getSignature = async ({
  tokenType = TokenTypeEnum.ACCESS,
  role=RoleEnum.USER
} = {}) => {

  const signatures = await getTokenSignatures({role})

  return tokenType == TokenTypeEnum.ACCESS
    ? signatures.accessSignature
    : signatures.refreshSignature;
};

//ensure that the user is authorized or not and check if the payload exist or not before enter the service
//to enter the service file with clean architecture
export const decodeToken = async ({
  authorization = "",
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {

  //to see the audience and extract it to know the role of user
  const decoded = jwt.decode(authorization);
  console.log({decoded});
  if(!decoded?.aud?.length){
    throw BadException("missing token payload");
  }

  const payload = await verifyToken({
    token: authorization,
    secretKey: await getSignature({ tokenType , role:decoded.aud[0] }),
  });
  if (!payload?.sub) {
    throw BadException("missing token payload");
  }
  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });
  if (!user) {
    throw NotFoundException("invalid user ");
  }
  return { user, payload };
};

//we create this method because we notice that the same code are repeated in the login and rotate token API service,
// so we create this method to avoid code duplication
export const createLoginCredentials = async ({
  user,
  issuer,
  options = {},
} = {}) => {
  const { accessSignature, refreshSignature } = await getTokenSignatures({ role:user.role });
  const access_token = await generateToken({
    payload:{sub : user._id},
    secret:accessSignature,
    options: {
      issuer,
      ...options,
      audience:[user.role],
      expiresIn: ACCESS_TOKEN_EXPIRESIN,
    },
  });
  const refresh_token = await generateToken({
    payload:{sub : user._id},
    options: {
      issuer,
      ...options,
      audience:[user.role],
      expiresIn: REFRESH_TOKEN_EXPIRESIN,
    },
    secretKey: refreshSignature,
  });

  console.log({ accessSignature, refreshSignature });
  
  return { access_token, refresh_token };
};
