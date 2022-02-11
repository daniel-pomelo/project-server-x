const axios = require("axios").default;

const USER_REGISTERED = "USER_REGISTERED";
const USER_LEVEL_UP = "USER_LEVEL_UP";

class SystemEvents {
  static init(db) {
    return new SystemEvents(db);
  }
  constructor(db) {
    this.db = db;
  }
  async notify(eventName, data) {
    try {
      if (eventName === USER_REGISTERED) {
        const { user, bridge } = data;
        const { url } = bridge;
        await axios.post(url, user);
      }
      if (eventName === USER_LEVEL_UP) {
        const { userId, prevLevel, currentLevel } = data;
        const points = (currentLevel - prevLevel) * 10;
        await this.db.save("UserPoints", {
          user_id: userId,
          prevLevel,
          currentLevel,
          points,
        });
      }
    } catch (error) {
      console.log(error);
      const { status, config } = error.response;
      const { method, url, data } = config;
      console.log("Error trying to handle event:", eventName);
      console.log(status);
      console.log(method);
      console.log(url);
      console.log(JSON.parse(data));
    }
  }
}

module.exports = SystemEvents;
