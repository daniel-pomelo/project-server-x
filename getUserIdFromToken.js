const axios = require("axios").default;

async function getUserIdFromToken(token) {
  const response = await axios.get("http://localhost:3006/api/token/" + token);
  return response.data.userId;
}

module.exports = {
  getUserIdFromToken,
};
