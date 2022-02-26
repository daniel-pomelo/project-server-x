require("dotenv").config();

const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init().then((db) => {
  const server = MyServer.start(db, SystemEvents.init(db));
  server.listen();
});
