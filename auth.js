const axios = require("axios").default;

const URL = process.env.AUTH_SERVICE_URL;
const UI_URL = process.env.URL_TO_UI;

async function getUserIdFromToken(token) {
  const response = await axios.get(URL + "/api/token/" + token);
  if (!response.data || !response.data.userId) {
    throw new Error("SESSION_EXPIRED");
  }
  return response.data.userId;
}

async function getProfileUrl(userId) {
  const response = await axios.get(URL + "/api/auth/" + userId);
  const token = response.data.token;
  const url = UI_URL + "/auth/" + token;
  return url;
}

async function getUserIdFromRequest(req) {
  const authorization = req.headers["authorization"];
  return getUserIdFromToken(authorization);
}

module.exports = {
  getUserIdFromToken,
  getProfileUrl,
  getUserIdFromRequest,
};
