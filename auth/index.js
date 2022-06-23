require("dotenv").config();

const cors = require("cors");
const express = require("express");
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("../server/Tokens");

const UI_URL = process.env.URL_TO_UI;
const PORT = process.env.PORT || 3006;

class MyServer {
  constructor(app) {
    this.app = app;
  }
  static start(tokens, UI_URL) {
    const app = express();
    app.use(cors());
    app.use(
      express.urlencoded({
        extended: true,
      })
    );
    app.use(express.json());

    app.get("/api/auth/:id", (req, res) => {
      const userId = req.params.id;
      const token = tokens.getTokenForProfile(userId);
      const url = UI_URL + "/auth/" + token;
      console.log("Request URL to profile for user id: ", userId);
      console.log("Provided URL: ", url);
      res.send({ url });
    });
    app.get("/api/token/:token", (req, res) => {
      const token = req.params.token;
      const userId = tokens.getUserIdFromToken(token);
      console.log("Provided user-id: ", userId);
      res.send({ userId });
    });

    return new MyServer(app);
  }
  listen() {
    this.server = this.app.listen(PORT, () => {
      console.log("Server is running at port " + PORT);
    });
  }
  async close() {
    if (this.server) {
      await new Promise((r) => {
        this.server.close(() => {
          console.log("Server closed at port " + PORT);
          r();
        });
      });
    }
  }
}

MongoDataBase.init().then((db) => {
  const server = MyServer.start(new Tokens(), UI_URL);
  server.listen();
});
