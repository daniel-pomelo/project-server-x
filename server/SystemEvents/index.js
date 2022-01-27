const axios = require("axios").default;

class SystemEvents {
  static init() {
    return new SystemEvents();
  }
  notify(user, bridge) {
    const { url } = bridge;
    return axios.post(url, user);
  }
}

module.exports = SystemEvents;
