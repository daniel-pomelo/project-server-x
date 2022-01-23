const { expect } = require("chai");
const supertest = require("supertest");
const { server } = require("../server");

describe("save user", () => {
  it("test 1", async () => {
    await supertest(server)
      .post("/api/bridge")
      .set("bridge-id", "BRIDGE_ID")
      .send({ bridge_url: "http://sarasa.com" });
    await supertest(server)
      .get("/api/users/abc789")
      .set("bridge-id", "BRIDGE_ID")
      .expect(404);
    await supertest(server)
      .post("/register/abc789")
      .send({ name: "john" })
      .expect(200);
  });
});
