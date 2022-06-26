export default class Util {
  static getJwtToken = (jwt: any, userObject: any) => {
    const AccessToken = jwt.sign({ userObject }, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: "30m", //TODO: Reduce this duration!
    });
    const RefreshToken = jwt.sign(
      { userObject },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "24h",
      }
    );
    return { AccessToken, RefreshToken };
  };
}
