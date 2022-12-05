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
const uuid = require("uuid");
const conquer = require("./conquer");
const http = require("http");
const { Server } = require("socket.io");
const getAvatarURL = require("./users/getAvatarURL");
const dayjs = require("dayjs");

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
  BRIDGE_INVALID: {
    status: 400,
    message: "Bad Request",
  },
  BAD_REQUEST: {
    status: 400,
    message: "Bad Request",
  },
  CHARACTER_NOT_FOUND: {
    status: 404,
    message: "Character not found",
  },
  SESSION_EXPIRED: {
    status: 401,
    message: "Session expired.",
  },
};

const connectedUsers = new Map();

class MyServer {
  constructor(app, server) {
    this.app = app;
    this.server = server;
  }
  static start() {
    const app = express();
    const server = http.createServer(app);
    app.use(cors());
    app.use(express.static("public"));
    app.use(
      express.urlencoded({
        extended: true,
      })
    );
    app.use(express.json());
    app.set("views", path.resolve(path.join(__dirname, "..", "view")));
    app.set("view engine", "ejs");

    return new MyServer(app, server);
  }
  setDB(db, systemEvents, tokens, UI_URL) {
    const app = this.app;

    const io = new Server(this.server, {
      cors: {
        origin: process.env.URL_TO_UI,
        methods: ["GET", "POST"],
      },
    });
    let socketClient;
    io.on("connection", (socket) => {
      socketClient = socket;
      socket.on("connection", async (data) => {
        Array.from(connectedUsers.entries()).forEach(([id, user]) => {
          if (user.id === data.id) {
            connectedUsers.delete(id);
          }
        });
        connectedUsers.set(socket.id, {
          id: data.id,
          name: data.name,
          avatar: await getAvatarURL(data.id),
        });
        const users = Array.from(connectedUsers.values());
        socket.broadcast.emit("connected_users", { users });
        socket.emit("connected_users", { users });
        const schedules = await db.find("ConquestPointSchedules", {
          timestamp: {
            $gte: new Date(),
          },
        });
        if (schedules[0] && schedules[0].timestamp) {
          socket.emit("next_conquest_point", schedules[0]);
        }
        const lastConquestPoint = await db.findOne(
          "ConquestPoints",
          {},
          {
            sort: {
              launched_at: -1,
            },
          }
        );
        const isExpired = dayjs(lastConquestPoint.launched_at)
          .add(lastConquestPoint.ttl, "seconds")
          .isBefore(dayjs());
        socket.emit("last_conquest_point", {
          ...lastConquestPoint,
          is_expired: isExpired,
        });
      });
      socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        const users = Array.from(connectedUsers.values());
        socket.broadcast.emit("connected_users", { users });
      });
    });

    app.use((req, res, next) => {
      const id = uuid.v4();
      const requestData = {
        id,
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        ip: req.ip,
      };
      req["id"] = id;
      console.log("Created Request-Id: ", req.id);
      next();
      db.setRequestLog(requestData);
    });
    app.use((req, res, next) => {
      console.log("Request-Id: ", req.id);
      next();
    });

    app.post("/api/conquest-point/update", (req, res) => {
      socketClient.emit("conquest_point:state_change", { status: "launched" });
      res.send("hola");
    });

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
    users.details(app, db);
    users.delete(app, db);
    users.toggle(app, db);
    users.find(app, db);
    users.deleteProgress(app, db);
    users.respec(app, db);
    users.updateIdentity(app, db);

    bridges.update(app, db);
    bridges.list(app, db);
    bridges.save(app, db);
    bridges.toggle(app, db);

    experience.reward(app, db, systemEvents);

    enrollment.invite(app, db, UI_URL);
    enrollment.invitation(app, db, tokens);
    enrollment.register(app, db, tokens, UI_URL);
    enrollment.invitations(app, db);

    crafting.pickup(app, db);
    crafting.user_materials(app, db);

    scaling.getScalingFactors(app, db);
    scaling.updateScalingFactors(app, db);

    stats.readDefaultStats(app, db);
    stats.updateDefaultStats(app, db);

    clans.save(app, db);
    clans.sendInvitationToMyClan(app, db);
    clans.declineInvitation(app, db);
    clans.join(app, db);
    clans.leave(app, db);
    clans.management(app, db);
    clans.userInfo(app, db);
    clans.managementDeleteClan(app, db);
    clans.adminPutClanDown(app, db);
    clans.declareWar(app, db);
    clans.kickout(app, db);
    clans.setRoleToMember(app, db);

    management.joinMembers(app, db);
    management.playersWithoutClan(app, db);

    pages.getClansPageInfo(app, db);
    pages.getConquestPointPageInfo(app, db);

    conquer.conquerConquestPoint(app, db);
    conquer.createConquestPoint(app, db);
    conquer.launchConquestPoint(app, db);

    app.use((error, req, res, next) => {
      db.registerError(error, req.id);
      const custom = responses[error.message];
      res
        .status((custom && custom.status) || 500)
        .send({ message: (custom && custom.message) || error.message });
    });
  }
  listen() {
    this.server.listen(PORT, () => {
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
