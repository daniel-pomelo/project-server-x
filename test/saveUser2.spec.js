const { expect } = require("chai");
const InMemoryDataBase = require("../InMemoryDataBase");
const { MyServer } = require("../server");
const { ServerInterface } = require("./ServerInterface.js");

class SystemEventsMock {
  constructor() {
    this.map = {
      USER_REGISTERED: [],
      USER_LEVEL_UP: [],
    };
  }
  hasReceiveThatUserRegister(expected) {
    expect(this.map["USER_REGISTERED"]).to.eqls([expected]);
  }
  hasReceiveThatUserLevelUp(expected) {
    expect(this.map["USER_LEVEL_UP"]).to.eqls([expected]);
  }
  notify(eventName, data) {
    this.map[eventName].push(data);
  }
}

describe("Given I need to provide the skills of the users", () => {
  let server;
  let systemEvents;
  const UI_URL = "http://origin.com";
  const tokens = {
    getTokenForProfile(userId) {
      tokens.userId = userId;
      return "12345678";
    },
    getUserIdFromToken() {
      return tokens.userId;
    },
  };
  beforeEach(async () => {
    systemEvents = new SystemEventsMock();
    server = await MyServer.start(
      InMemoryDataBase.init(),
      systemEvents,
      tokens,
      UI_URL
    );
  });
  afterEach(async () => {
    server.close();
  });
  describe("because user doesn't have skills", () => {
    it("should provide empty skills", async () => {
      const api = new ServerInterface(server);
      const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
      await api.GivenTheresABridge({
        id: "BRIDGE_ID",
        url: "http://sarasa.com",
      });
      await api.AssertUserNotRegistered(USER_ID);

      const formValues = {
        name: "Daniel",
        breed: "Dragon",
        type: "Ice",
        level_name: "Milleniums",
      };
      await api.RegisterUser(USER_ID, formValues);

      const res = await api.GetUserSkills("12345678");

      res.contains("skills", []);
    });
  });
  describe("because user has only 1 skill", () => {
    it("should provide only that skill", async () => {
      const api = new ServerInterface(server);
      const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
      await api.GivenTheresABridge({
        id: "BRIDGE_ID",
        url: "http://sarasa.com",
      });
      await api.AssertUserNotRegistered(USER_ID);

      const formValues = {
        name: "Daniel",
        breed: "Dragon",
        type: "Ice",
        level_name: "Milleniums",
      };
      await api.RegisterUser(USER_ID, formValues);

      const saveSkillResponse = await api.SaveSkill({
        id: "fire-beam",
        name: "Fire Beam",
        description: "Some description for fire beam...",
        level_min: 2,
        level_gap: 4,
      });

      saveSkillResponse.statusEquals(200);

      await api.getURLToProfile(USER_ID);

      await api.LearnSkills({
        token: "12345678",
        skills: [
          {
            id: "fire-beam",
            skill_level_value: 1,
            user_level_value: 2,
          },
        ],
      });
      await api.LearnSkills({
        token: "12345678",
        skills: [
          {
            id: "fire-beam",
            skill_level_value: 1,
            user_level_value: 2,
          },
        ],
      });

      const res = await api.GetUserSkills(
        "12f6538d-fea7-421c-97f0-8f86b763ce75"
      );

      res.contains("skills", [
        {
          id: "fire-beam",
          name: "Fire Beam",
          description: "Some description for fire beam...",
          level_min: 2,
          level_gap: 4,
        },
      ]);
    });
  });
});
