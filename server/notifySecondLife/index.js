const axios = require("axios").default;

const notifySecondLife = {
  notify(user, bridge) {
    const { url } = bridge;
    return axios.post(url, user);
  },
};

module.exports = notifySecondLife;
