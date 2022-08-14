import 'dotenv/config';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import process from '../Strings';

const authenticate = (req: any, res: any, next: any) => {
  const header = req.headers.authorization || 'Bearer null';
  try {
    const token = header.split(' ')[1].trim();
    if (!token) {
      throw token;
    }
    const parsedJWT: any =
      (jwt.verify(token, process.env.ACCESS_TOKEN_KEY || '') as any) || {};
    if ('userObject' in parsedJWT) {
      req.body = req.body || {};
      req.body.userId = parsedJWT.userObject.userId;
      return next();
    }
    throw token;
  } catch (e) {
    res.sendStatus(401);
  }
};

/**
 * Use it extract Database link from which is attached to the response object
 * @param response
 * @returns
 */
const extractDBLinkFromResponse = (response: Response) => {
  return response.locals.dbLink;
};

const CheckAuthAndRetrieveDB = (req: Request, res: Response, next: any) => {
  try {
    if (!res.locals.dbLink?.isConnected()) {
      throw new Error('Database Not Connected!');
    }
    authenticate(req, res, next);
  } catch (e) {
    res.sendStatus(500);
  }
};

export { CheckAuthAndRetrieveDB, extractDBLinkFromResponse };
