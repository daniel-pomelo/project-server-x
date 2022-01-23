const axios = require("axios").default;

function sendUserInfoToBridgeUrl(bridgeUrl, user) {
  if (process.env.ENV_NAME === "dev") {
    return Promise.resolve();
  }
  return axios
    .post(bridgeUrl, user)
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
