require("dotenv").config();
const path = require("path");
const express = require("express");
const { logBridgeId } = require("./logBridgeId");
const { verifyIsValidBridge } = require("./verifyIsValidBridge");
const { verifyUserIdPresence } = require("./verifyUserIdPresence");
const findUsers = require("./routes/findUsers");
const getUserDataOrRegisterLink = require("./routes/getUserDataOrRegisterLink");
const saveUser = require("./routes/saveUser");
const saveBridge = require("./routes/saveBridge");
const InMemoryDataBase = require("../InMemoryDataBase");
const MongoDataBase = require("../MongoDataBase");

const PORT = process.env.PORT || 3000;
class MyServer {
  constructor(server, app) {
    this.server = server;
    this.app = app;
  }
  static start() {
    const app = express();

    app.use(express.static("public"));
    app.use(
      express.urlencoded({
        extended: true,
      })
    );
    app.use(express.json());

    const db =
      process.env.ENV_NAME === "dev"
        ? InMemoryDataBase.init()
        : MongoDataBase.init();

    app.get("/api/users", findUsers(db));
    app.get(
      "/api/users/:id",
      logBridgeId,
      verifyIsValidBridge,
      verifyUserIdPresence,
      getUserDataOrRegisterLink(db)
    );
    app.get("/", function (req, res) {
      res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
    });
    app.post("/register/:id", saveUser(db));
    app.get("/register/:id", function (req, res) {
      res.sendFile(
        path.resolve(path.join(__dirname, "/../view/register.html"))
      );
    });

    app.post("/api/bridge", verifyIsValidBridge, saveBridge);

    const server = app.listen(PORT, () => {
      console.log("Server is running at port " + PORT);
    });
    return new MyServer(server, app);
  }
  async close() {
    await new Promise((r) => {
      this.server.close(() => {
        console.log("Server closed at port " + PORT);
        r();
      });
    });
  }
}

module.exports = {
  MyServer,
};
