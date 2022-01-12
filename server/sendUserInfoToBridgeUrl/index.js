const axios = require("axios").default;

function sendUserInfoToBridgeUrl(bridgeUrl, user) {
  console.log("sendUserInfoToBridgeUrl", bridgeUrl, user);
  axios
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
