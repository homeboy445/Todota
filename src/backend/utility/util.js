"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Strings_1 = __importDefault(require("../Strings"));
class Util {
}
exports.default = Util;
Util.getJwtToken = (jwt, userObject) => {
    const AccessToken = jwt.sign({ userObject }, Strings_1.default.env.ACCESS_TOKEN_KEY, {
        expiresIn: '1000m', // TODO: Reduce this duration!
    });
    const RefreshToken = jwt.sign({ userObject }, Strings_1.default.env.REFRESH_TOKEN_KEY, {
        expiresIn: '24h',
    });
    return { AccessToken, RefreshToken };
};
