const axios = require("axios").default;

class SystemEvents {
  static init() {
    return new SystemEvents();
  }
  async notify(user, bridge) {
    try {
      const { url } = bridge;
      await axios.post(url, user);
    } catch (error) {
      const { status, config } = error.response;
      const { method, url, data } = config;
      console.log("Error trying to sync user data");
      console.log(status);
      console.log(method);
      console.log(url);
      console.log(JSON.parse(data));
    }
  }
}

module.exports = SystemEvents;
