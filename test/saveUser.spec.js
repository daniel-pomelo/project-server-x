const { expect } = require("chai");
const InMemoryDataBase = require("../InMemoryDataBase");
const { MyServer } = require("../server");
const { ServerInterface } = require("./ServerInterface.js");

class Sorombombom {
  constructor() {
    this.user = null;
  }
  contains(expected) {
    expect(expected).to.eqls(this.user);
  }
  notify(user, bridge) {
    this.user = user;
  }
}

describe("Given a application to manage users in a second life game", () => {
  let server;
  let sorombombom;
  beforeEach(async () => {
    sorombombom = new Sorombombom();
    server = await MyServer.start(InMemoryDataBase.init(), sorombombom);
  });
  afterEach(async () => {
    server.close();
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

    const EXPECTED_USER = {
      id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
      level_value: 1,
      health: 100,
      mana: 100,
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

    const res = await api.findAllUsers();

    res.equals(200, [EXPECTED_USER]);
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
  it("should call sorombombom with new user", async () => {
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

    sorombombom.contains(EXPECTED_USER);
  });
});
