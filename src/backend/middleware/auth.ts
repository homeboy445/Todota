import "dotenv/config";
import jwt from "jsonwebtoken";

const authenticate = (req: any, res: any, next: any) => {
  const header = req.headers["authorization"] || "Bearer null";
  try {
    const token = header.split(" ")[1].trim();
    if (!token) {
      throw token;
    }
    const parsedJWT: any =
      (jwt.verify(token, process.env.ACCESS_TOKEN_KEY || "") as any) || {};
    if ("userObject" in parsedJWT) {
      req.body = req.body || {};
      req.body["userId"] = parsedJWT.userObject.userId;
      return next();
    }
    throw token;
  } catch (e) {
    res.sendStatus(401);
  }
};

export default authenticate;
