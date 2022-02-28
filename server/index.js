const path = require("path");
const cors = require("cors");
const express = require("express");
const { logBridgeId } = require("./logBridgeId");
const findUsers = require("./routes/findUsers");
const saveBridge = require("./routes/saveBridge");
const assignExperience = require("./routes/assignExperience");
const getUserProfile = require("./routes/getUserProfile");
const assignPointsToStats = require("./routes/assignPointsToStats");
const renderHomePage = require("./routes/renderHomePage");
const returnUserById = require("./routes/returnUserById");
const registerUser = require("./routes/registerUser");
const renderRegisterPage = require("./routes/renderRegisterPage");
const getUrlToProfile = require("./routes/getUrlToProfile");

const PORT = process.env.PORT || 3001;

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
    app.get("/api/users", findUsers(db));
    app.get("/api/users/:id", logBridgeId, returnUserById(db));
    app.post("/api/users/:id/stats", asyncHandler(assignPointsToStats(db)));
    app.get("/", renderHomePage);
    app.post("/register/:id", registerUser(db, systemEvents));
    app.get("/register/:id", renderRegisterPage);
    app.post("/api/bridge", saveBridge(db));
    app.post("/api/xp", asyncHandler(assignExperience(db, systemEvents)));

    app.get("/api/profile/:token", asyncHandler(getUserProfile(db, tokens)));
    app.get("/api/auth/:id", getUrlToProfile(tokens, UI_URL));

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

module.exports = {
  MyServer,
};
