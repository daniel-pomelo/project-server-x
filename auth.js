const axios = require("axios").default;

const URL = process.env.AUTH_SERVICE_URL;

async function getUserIdFromToken(token) {
  const response = await axios.get(URL + "/api/token/" + token);
  return response.data.userId;
}

async function getPlayerToken(userId) {
  const response = await axios.get(URL + "/api/auth/" + userId);
  return response.data.url;
}

module.exports = {
  getUserIdFromToken,
  getPlayerToken,
};
