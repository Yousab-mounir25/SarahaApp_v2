import { UnAuthorizedException } from "../common/exceptions/error.exception.js";
import { decodeToken } from "../common/security/token.security.js";
import { TokenTypeEnum } from "./../common/enum/index.js";

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw UnAuthorizedException("Unauthorized account ");
    }
    const{user , payload} = await decodeToken({ authorization, tokenType });
    req.user = user,
    req.payload = payload
    next();
  };
};
