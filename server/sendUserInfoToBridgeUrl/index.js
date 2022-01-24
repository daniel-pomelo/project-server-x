const axios = require("axios").default;

function sendUserInfoToBridgeUrl(bridge, user) {
  if (process.env.ENV_NAME === "dev") {
    return Promise.resolve();
  }
  const { url } = bridge;
  const userStats = user.stats;
  const data = {
    ...user,
    health: userStats.health,
    mana: userStats.mana,
    stats: userStats,
  };
  return axios
    .post(url, data)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  sendUserInfoToBridgeUrl,
};
