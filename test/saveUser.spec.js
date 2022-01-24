const { expect } = require("chai");
const supertest = require("supertest");
const { MyServer } = require("../server");

describe.only("Given users are registered", () => {
  let server;
  beforeEach(() => {
    server = MyServer.start();
  });
  afterEach(async () => {
    await server.close();
  });
  it("test 1", async () => {
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await RegisterUser(USER_ID, formValues);

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

    await AssertUserExist(USER_ID, EXPECTED_USER);
  });
  it("test 2", async () => {
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await AssertUserNotRegistered(USER_ID);
  });
  it("test 3", async () => {
    const USER_ID = "12f6538d-fea7-421c-97f0-8f86b763ce75";
    await GivenTheresABridge({ id: "BRIDGE_ID", url: "http://sarasa.com" });
    await AssertUserNotRegistered(USER_ID);

    const formValues = {
      name: "Daniel",
      breed: "Dragon",
      type: "Ice",
      level_name: "Milleniums",
    };
    await RegisterUser(USER_ID, formValues);
    const res = await RegisterUser(USER_ID, formValues);

    console.log(res.status);
    console.log(res.body);
  });

  function GivenTheresABridge({ id, url }) {
    return supertest(server.app)
      .post("/api/bridge")
      .set("bridge-id", id)
      .send({ bridge_url: url });
  }

  async function AssertUserNotRegistered(userId) {
    const { status, body } = await supertest(server.app)
      .get("/api/users/" + userId)
      .set("bridge-id", "BRIDGE_ID");
    expect({ status, body }).to.eqls({
      status: 404,
      body: {
        register_link:
          "https://project-server-x.herokuapp.com/register/12f6538d-fea7-421c-97f0-8f86b763ce75",
      },
    });
  }
  function RegisterUser(userId, formValues) {
    return supertest(server.app)
      .post("/register/" + userId)
      .send(formValues);
  }
  async function AssertUserExist(userId, user) {
    const { body } = await supertest(server.app)
      .get("/api/users/" + userId)
      .set("bridge-id", "BRIDGE_ID")
      .expect(200);

    expect(body).to.eqls(user);
  }
});
