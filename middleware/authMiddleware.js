import jwt, { decode } from 'jsonwebtoken';
import { User } from '../model/UserModel.js';
import errorResponseFactory from '../utils/errorResponseFactory.js';
import { responseStatus } from '../utils/ResponseFactory.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1]; // The second part is the token
}

export const authUser = async (req, res, next) => {
  const token =
    req.token ||
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    extractBearerToken(req.headers.authorization);

  if (!token) {
    return errorResponseFactory(
      res,
      responseStatus.FORBIDDEN,
      'You need to login first.'
    );
  }


  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (decoded.sub !== undefined) {
      // Will check if the decoded sub or User Id exists
      // Else it will throw an error
      await User.findById(decoded.sub).exec();
    }

    req.user = decoded;
  } catch (err) {
    return errorResponseFactory(
      res,
      responseStatus.UNAUTHORIZED,
      'Invalid Token',
      {
        details: err?.message,
      }
    );
  }

  next();
};

export const authAdmin = async (req, res, next) => {
  const token =
    req.token || // Check BearerTokenMiddleware what is this
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    extractBearerToken(req.headers.authorization);

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded.role !== 'admin') {
      throw new Error('You are not authorized to access this resource');
    }

    req.user = decoded;
  } catch (err) {
    return errorResponseFactory(
      res,
      responseStatus.UNAUTHORIZED,
      'Invalid Token',
      {
        details: err?.message,
      }
    );
  }

  next();
};
