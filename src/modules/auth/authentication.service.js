import { model } from "mongoose";
import { create, findOne } from "../../common/repository/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import {
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
} from "../../config.js";
import { RoleEnum } from "../../common/enum/user.enum.js";

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
    filter: { email },
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