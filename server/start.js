const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("./Tokens");
const dayjs = require("dayjs");
const scheduler = require("node-schedule");

const UI_URL = process.env.URL_TO_UI;

const server = MyServer.start();

server.listen();

MongoDataBase.init().then(async (db) => {
  server.setDB(db, SystemEvents.init(db), new Tokens(), UI_URL);
  const schedules = await db.find("ConquestPointSchedules", {
    timestamp: {
      $gte: new Date(),
    },
  });
  schedules.forEach((schedule) => {
    scheduler.scheduleJob(new Date(schedule.timestamp), () => {
      console.log("The world is going to end today.");
    });
  });
});

module.exports = server.app;
