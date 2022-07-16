"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
}
exports.default = Util;
Util.getJwtToken = (jwt, userObject) => {
    const AccessToken = jwt.sign({ userObject }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '1000m', //TODO: Reduce this duration!
    });
    const RefreshToken = jwt.sign({ userObject }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: '24h',
    });
    return { AccessToken, RefreshToken };
};
