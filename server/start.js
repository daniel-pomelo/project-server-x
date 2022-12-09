const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("./Tokens");
const scheduler = require("node-schedule");
const reserveConquestPoint = require("../reserveConquestPoint");
const updateConquestPoint = require("./conquer/common/updateConquestPoint");
const { timestamp } = require("../time");

const UI_URL = process.env.URL_TO_UI;

const server = MyServer.start();

server.listen();

MongoDataBase.init().then(async (db) => {
  const systemEvents = SystemEvents.init(db);
  server.setDB(db, systemEvents, new Tokens(), UI_URL);
  const now = new Date();
  console.log(`Searching scheduled conquest points greather than ${now}.`);
  const schedules = await db.find("ConquestPointSchedules", {
    timestamp: {
      $gte: now,
    },
  });
  console.log(`Found ${schedules.length} scheduled conquest points.`);
  console.log(JSON.stringify(schedules, null, 2));
  const bridge = await db.findOne("Bridges");
  console.log(`Found bridge ${bridge.id} to spawn conquest points.`);
  schedules.forEach((schedule) => {
    scheduler.scheduleJob(new Date(schedule.timestamp), async () => {
      const conquestPoint = await reserveConquestPoint(db, {
        ttl: parseInt(schedule.ttl) || 3600,
      });
      const requestResult = await systemEvents.notifyConquestPointLaunched(
        bridge,
        conquestPoint
      );

      await updateConquestPoint(db, conquestPoint, {
        status: "launched",
        launched_at: timestamp(),
      });

      await db.save("ConquestPointLaunchings", {
        request_body: requestResult?.body,
        request_result: requestResult?.config?.data,
        request_result_status: requestResult.status,
        conquer_point: conquestPoint,
        bridge,
        timestamp: timestamp(),
      });

      // await db.save("ConquestPointSchedules", {
      //   timestamp: now,
      // });
    });
  });
});

module.exports = server.app;
