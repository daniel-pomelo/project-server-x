require("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");
const getUserProfile = require("./routes/getUserProfile");
const assignPointsToStats = require("./routes/assignPointsToStats");
const getUrlToProfile = require("./routes/getUrlToProfile");
const getSkills = require("./routes/getSkills");
const saveSkills = require("./routes/saveSkills");
const deleteSkill = require("./routes/deleteSkill");
const updateUserSkills = require("./routes/updateUserSkills");
const getProfileSkills = require("./routes/getProfileSkills");
const toggleSkill = require("./routes/toggleSkill");
const getPoints = require("./routes/getPoints");
const asyncHandler = require("./routes/asyncHandler");
const crafting = require("./crafting");
const enrollment = require("./enrollment");
const experience = require("./experience");
const bridges = require("./bridges");
const users = require("./users");
const scaling = require("./scaling");
const stats = require("./stats");
const clans = require("./clans");
const pages = require("./pages");
const management = require("./management");

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

class MyServer {
  constructor(app) {
    this.app = app;
  }
  static start() {
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

    return new MyServer(app);
  }
  setDB(db, systemEvents, tokens, UI_URL) {
    const app = this.app;
    app.post(
      "/api/users/:id/stats",
      asyncHandler(assignPointsToStats(db, systemEvents))
    );
    //SKILLS
    app.get("/api/skills", asyncHandler(getSkills(db)));
    app.post("/api/skills", asyncHandler(saveSkills(db)));
    app.delete("/api/skills/:id", asyncHandler(deleteSkill(db)));
    app.get("/api/skills/:skill_id/toggle", asyncHandler(toggleSkill(db)));
    app.post(
      "/api/profile/:token/skills",
      asyncHandler(updateUserSkills(db, systemEvents))
    );

    //PROFILE
    app.get("/api/profile/:token", asyncHandler(getUserProfile(db)));
    app.get("/api/auth/:id", asyncHandler(getUrlToProfile(db)));
    app.get("/api/skills/:id", getProfileSkills(db));
    app.get("/api/points/:id", getPoints(db));

    users.all(app, db);
    users.single(app, db);
    users.delete(app, db);
    users.toggle(app, db);
    users.find(app, db);

    bridges.update(app, db);
    bridges.list(app, db);
    bridges.save(app, db);
    bridges.toggle(app, db);

    experience.reward(app, db, systemEvents);

    enrollment.invite(app, db, tokens, UI_URL);
    enrollment.invitation(app, db, tokens);
    enrollment.register(app, db, tokens, UI_URL);

    crafting.pickup(app, db);
    crafting.user_materials(app, db);

    scaling.getScalingFactors(app, db);
    scaling.updateScalingFactors(app, db);

    stats.readDefaultStats(app, db);
    stats.updateDefaultStats(app, db);

    clans.save(app, db);
    clans.sendInvitationToMyClan(app, db);
    clans.join(app, db);
    clans.leave(app, db);
    clans.management(app, db);
    clans.userInfo(app, db);

    management.joinMembers(app, db);
    management.playersWithoutClan(app, db);

    pages.getClansPageInfo(app, db);

    app.use((error, req, res, next) => {
      console.log(error);
      db.registerError(error);
      const custom = responses[error.message];
      res
        .status((custom && custom.status) || 500)
        .send({ message: (custom && custom.message) || error.message });
    });
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
