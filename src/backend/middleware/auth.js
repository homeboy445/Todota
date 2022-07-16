"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const header = req.headers.authorization || 'Bearer null';
    try {
        const token = header.split(' ')[1].trim();
        if (!token) {
            throw token;
        }
        const parsedJWT = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_KEY || '') || {};
        if ('userObject' in parsedJWT) {
            req.body = req.body || {};
            req.body.userId = parsedJWT.userObject.userId;
            return next();
        }
        throw token;
    }
    catch (e) {
        res.sendStatus(401);
    }
};
exports.default = authenticate;
