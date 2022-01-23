const axios = require("axios").default;

function sendUserInfoToBridgeUrl(bridgeUrl, user) {
  if (process.env.ENV_NAME === "dev") {
    return Promise.resolve();
  }
  const userStats = user.stats;
  const data = {
    ...user,
    health: userStats.health,
    mana: userStats.mana,
    stats: userStats,
  };
  console.log(JSON.stringify(user, null, 2));
  console.log(JSON.stringify(data, null, 2));
  return axios
    .post(bridgeUrl, data)
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
