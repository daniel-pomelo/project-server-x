const { expect } = require("chai");
const supertest = require("supertest");
const { server } = require("../server");

describe("save user", () => {
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
});

function GivenTheresABridge({ id, url }) {
  return supertest(server)
    .post("/api/bridge")
    .set("bridge-id", id)
    .send({ bridge_url: url });
}

function AssertUserNotRegistered(userId) {
  return supertest(server)
    .get("/api/users/" + userId)
    .set("bridge-id", "BRIDGE_ID")
    .expect(404);
}
function RegisterUser(userId, formValues) {
  return supertest(server)
    .post("/register/" + userId)
    .send(formValues);
}
async function AssertUserExist(userId, user) {
  const { body } = await supertest(server)
    .get("/api/users/" + userId)
    .set("bridge-id", "BRIDGE_ID")
    .expect(200);

  expect(body).to.eqls(user);
}
