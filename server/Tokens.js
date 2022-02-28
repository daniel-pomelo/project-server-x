const jwt = require("jsonwebtoken");

class Tokens {
  getTokenForProfile(userId) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    return jwt.sign({ userId, expiration: date }, "my-secret");
  }
  getUserIdFromToken(token) {
    const { userId, expiration } = jwt.verify(token, "my-secret");
    if (new Date(expiration) < new Date()) {
      throw new Error("Expired");
    }
    return userId;
  }
}

module.exports = Tokens;
