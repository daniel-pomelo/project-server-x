const axios = require("axios").default;

const URL = process.env.AUTH_SERVICE_URL;
const UI_URL = process.env.URL_TO_UI;

async function getUserIdFromToken(token) {
  const response = await axios.get(URL + "/api/token/" + token);
  return response.data.userId;
}

async function getProfileUrl(userId) {
  const response = await axios.get(URL + "/api/auth/" + userId);
  const token = response.data.token;
  const url = UI_URL + "/auth/" + token;
  return url;
}

module.exports = {
  getUserIdFromToken,
  getProfileUrl,
};
