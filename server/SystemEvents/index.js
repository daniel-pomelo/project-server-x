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
    const event = { name: eventName, data };
    try {
      if (eventName === USER_REGISTERED) {
        const { user, bridge } = data;
        const { url } = bridge;
        await axios.post(url, user);
      }
      if (eventName === USER_LEVEL_UP) {
        //hacer sync cuando obtenga el bridge
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
    } finally {
      this.db
        .save("EventRecords", event)
        .then(() => console.log("Saved EventRecords"))
        .catch((err) => console.log("Error saving EventRecords: ", err));
    }
  }
  async notifyThatUserHasTrained(userId, bridge) {
    try {
      console.log(
        `Send {user-id: ${userId}} to ${bridge.id} with URL ${bridge.url}.`
      );
      const res = await axios.post(bridge.url, {
        command: "CHARACTER_UPDATED",
        data: {
          "user-id": userId,
        },
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = SystemEvents;
