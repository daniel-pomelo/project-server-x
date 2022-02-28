const { v4: uuidv4 } = require("uuid");

const map = new Map();

class Tokens {
  getTokenForProfile(userId) {
    const token = uuidv4();

    map.set(token, userId);

    return token;
  }
  getUserIdFromToken(token) {
    return map.get(token);
  }
}

module.exports = Tokens;
