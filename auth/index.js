require("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");

const PORT = 3006;

const responses = {
  USER_ALREADY_EXISTS: {
    status: 400,
    message: "User already exists",
  },
  BRIDGE_NOT_FOUND: {
    status: 400,
    message: "Bridge not found",
  },
  ATTEMPT_NOT_FOUND: {
    status: 400,
    message: "Attempt not found",
  },
};

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

class MyServer {
  constructor(app) {
    this.app = app;
  }
  static start(db, systemEvents, tokens, UI_URL) {
    const app = express();

    app.use(express.static("public"));
    app.use(cors());
    app.use(
      express.urlencoded({
        extended: true,
      })
    );
    app.use(express.json());
    app.set("views", path.resolve(path.join(__dirname, "..", "view")));
    app.set("view engine", "ejs");

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
      //   const url = UI_URL + "/auth/" + token;
      //   console.log("Request URL to profile for user id: ", userId);
      console.log("Provided user-id: ", userId);
      res.send({ userId });
    });

    app.use((error, req, res, next) => {
      const custom = responses[error.message];
      res
        .status((custom && custom.status) || 500)
        .send({ message: (custom && custom.message) || error.message });
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
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("../server/Tokens");

const UI_URL = process.env.URL_TO_UI;

MongoDataBase.init().then((db) => {
  const server = MyServer.start(db, null, new Tokens(), UI_URL);
  server.listen();
});
