import { ConflictException } from "../../common/exceptions/error.exception.js";
import {
  findById,
  findByIdAndUpdate,
} from "../../common/repository/db.repository.js";
import {
  createLoginCredentials,
  verifyToken,
} from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIRESIN } from "../../config.js";
import { UserModel } from "../../DB/model/user.model.js";
import jwt from "jsonwebtoken";

export const getProfile = async (user) => {
  return user;
};

export const updateProfile = async (user, inputs) => {
  const account = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update: inputs,
  });
  return account;
};

export const rotateToken = async (payload, user , issuer ) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRESIN) * 1000; //to ms
  const currentTime = Date.now() + 5 * 60000; //plus 5 mins
  if (currentTime < accessExpiresIn) {
    throw ConflictException(
      "sorry we cannot create login credential, while current access token still within valid time range",
    );
  }

  return await createLoginCredentials({ user,issuer });
};
