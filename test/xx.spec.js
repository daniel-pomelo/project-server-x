const { expect } = require("chai");
const supertest = require("supertest");
const { server } = require("../server");

describe("xx", () => {
  it("test 1", async () => {
    const response = await supertest(server)
      .get("/api/users/abc123")
      .set("bridge-id", "BRIDGE_ID")
      .expect(200);

    expect(response.body).to.eqls({
      id: "abc123",
      name: "Daniel",
      breed: "Dragon",
      type: "Hielo",
      level_name: "Milenios",
      level_value: 1,
      health: 100,
      mana: 100,
      stats: {
        strength: 0,
        fortitude: 0,
        health: 0,
        intelligence: 0,
        will: 0,
        perception: 0,
        agility: 0,
        endurance: 0,
      },
    });
  });
  it("test 2", async () => {
    const response = await supertest(server)
      .get("/api/users/abc789")
      .set("bridge-id", "BRIDGE_ID")
      .expect(404);

    expect(response.body).to.eqls({
      register_link: "https://project-server-x.herokuapp.com/register/abc789",
    });
  });
  it("test 3", async () => {
    const response = await supertest(server)
      .get("/api/users/abc78910")
      .set("bridge-id", "BRIDGE_ID")
      .expect(500);

    expect(response.body).to.eqls({
      message: "Some error message",
    });
  });
});
