const { expect } = require("chai");
const InMemoryDataBase = require("../InMemoryDataBase");
const { MyServer } = require("../server");
const { ServerInterface } = require("./ServerInterface.js");

class SystemEventsMock {
  constructor() {
    this.user = null;
  }
  contains(expected) {
    expect(this.user).to.eqls(expected);
  }
  notify(user, bridge) {
    this.user = user;
  }
}

const listOf = (...arg) => arg;
const userExperience = (user_id, xp) => ({
  user_id,
  xp,
});

describe("Given a application to manage users in a second life game", () => {
  let server;
  let systemEvents;
  beforeEach(async () => {
    systemEvents = new SystemEventsMock();
    server = await MyServer.start(InMemoryDataBase.init(), systemEvents);
  });
  afterEach(async () => {
    server.close();
  });
  it("should allow user to register", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await api.RegisterUser(USER_ID, formValues);

    const EXPECTED_USER = {
      id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 0,
      xp_max: 240,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("should return user stats", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await api.RegisterUser(USER_ID, formValues);

    const formStatsValues1 = {
      fortitude: 40,
      intelligence: 30,
      perception: 20,
      strength: 10,
    };
    const registerUserStatsResponse1 = await api.RegisterUserStats(
      USER_ID,
      formStatsValues1
    );

    registerUserStatsResponse1.statusEquals(200);

    const formStatsValues2 = {
      fortitude: 10,
      intelligence: 20,
      perception: 15,
      strength: 22,
    };
    const registerUserStatsResponse2 = await api.RegisterUserStats(
      USER_ID,
      formStatsValues2
    );

    registerUserStatsResponse2.statusEquals(200);

    const EXPECTED_USER = {
      id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 0,
      xp_max: 240,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 50,
        health: 0,
        intelligence: 50,
        perception: 35,
        strength: 32,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("when getting all users should then return registered users", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await api.RegisterUser(USER_ID, formValues);

    const formStatsValues = {
      fortitude: 40,
      intelligence: 30,
      perception: 20,
      strength: 10,
    };
    const registerUserStatsResponse = await api.RegisterUserStats(
      USER_ID,
      formStatsValues
    );

    registerUserStatsResponse.statusEquals(200);

    const EXPECTED_USER = {
      id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 0,
      xp_max: 240,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 40,
        health: 0,
        intelligence: 30,
        perception: 20,
        strength: 10,
        will: 0,
      },
    };

    const findAllUsersResponse = await api.findAllUsers();

    findAllUsersResponse.equals(200, [EXPECTED_USER]);
  });
  it("when there's not attempt then register should fail", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.equals(400, "Attempt not found");
  });
  it("when there's not bridge then register should fail", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.AssertUserNotRegistered(USER_ID);
    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.equals(400, "Bridge not found");
  });
  it("when user is not registered, api return 404 ", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    const res = await api.AssertUserNotRegistered(USER_ID);
    res.equals(404, {
      register_link:
        "https://project-server-x.herokuapp.com/register/12f6538d-fea7-421c-97f0-8f86b763ce75",
    });
  });
  it("should fail second try of register", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await api.RegisterUser(USER_ID, formValues);

    const res = await api.RegisterUser(USER_ID, formValues);

    res.equals(400, "User already exists");
  });
  it("should fail", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "USER_ID_THAT_WILL_CAUSE_ERROR";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    const res = await api.findUser(USER_ID);
    res.equals(500, "Error de base de datos para este user id");
  });
  it("should call system events with new user", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);

    const EXPECTED_USER = {
      id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 0,
      xp_max: 240,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    res.statusEquals(201);

    systemEvents.contains(EXPECTED_USER);
  });
  it("test 1", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 100)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 100,
      xp_max: 240,
      xp_level: 100,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 1.5", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 240)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 2,
      health: 100,
      mana: 100,
      xp_current: 240,
      xp_max: 288,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 2", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 100)));
    await api.assignExperience(listOf(userExperience(USER_ID, 139)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
      xp_current: 239,
      xp_max: 240,
      xp_level: 239,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 3", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 100)));
    await api.assignExperience(listOf(userExperience(USER_ID, 139)));
    await api.assignExperience(listOf(userExperience(USER_ID, 61)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 2,
      health: 100,
      mana: 100,
      xp_current: 300,
      xp_max: 288,
      xp_level: 60,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 4", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 100)));
    await api.assignExperience(listOf(userExperience(USER_ID, 139)));
    await api.assignExperience(listOf(userExperience(USER_ID, 61)));
    await api.assignExperience(listOf(userExperience(USER_ID, 100)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 2,
      health: 100,
      mana: 100,
      xp_current: 400,
      xp_max: 288,
      xp_level: 160,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 5", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 1690)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 6,
      health: 100,
      mana: 100,
      xp_current: 1690,
      xp_max: 480,
      xp_level: 10,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 6", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const res = await api.RegisterUser(USER_ID, formValues);
    res.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 860)));
    await api.assignExperience(listOf(userExperience(USER_ID, 2)));

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 3,
      health: 100,
      mana: 100,
      xp_current: 862,
      xp_max: 336,
      xp_level: 334,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 7", async () => {
    const api = new ServerInterface(server);
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    const OTHER_USER_ID = "13f6538d-fea7-421c-97f0-8f86b763ce75";
    await api.GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await api.AssertUserNotRegistered(USER_ID);
    await api.AssertUserNotRegistered(OTHER_USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    const formValues2 = {
      name: "Kaleb",
      breed: "Vampiro",
      type: "DarkSoul",
      level_name: "Ages",
    };
    const res1 = await api.RegisterUser(USER_ID, formValues);
    res1.statusEquals(201);

    const res2 = await api.RegisterUser(OTHER_USER_ID, formValues2);
    res2.statusEquals(201);

    await api.assignExperience(listOf(userExperience(USER_ID, 860)));
    await api.assignExperience(
      listOf(userExperience(USER_ID, 2), userExperience(OTHER_USER_ID, 239))
    );
    await api.assignExperience(
      listOf(userExperience(USER_ID, 2), userExperience(OTHER_USER_ID, 100))
    );

    const EXPECTED_USER = {
      id: USER_ID,
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 4,
      health: 100,
      mana: 100,
      xp_current: 864,
      xp_max: 384,
      xp_level: 0,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };
    const EXPECTED_USER_2 = {
      id: OTHER_USER_ID,
      name: "Kaleb",
      breed: "Vampiro",
      type: "DarkSoul",
      xp_level: 0,
      level_value: 2,
      level_name: "Ages",
      health: 100,
      mana: 100,
      xp_current: 339,
      xp_max: 288,
      xp_level: 99,
      stats: {
        agility: 0,
        endurance: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        perception: 0,
        strength: 0,
        will: 0,
      },
    };

    await api.AssertUserExist(USER_ID, EXPECTED_USER);
    await api.AssertUserExist(OTHER_USER_ID, EXPECTED_USER_2);
  });
});
