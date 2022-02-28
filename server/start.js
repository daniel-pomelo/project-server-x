require("dotenv").config();

const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("./Tokens");

const UI_URL = "http://localhost:3000";

MongoDataBase.init().then((db) => {
  const server = MyServer.start(
    db,
    SystemEvents.init(db),
    new Tokens(),
    UI_URL
  );
  server.listen();
});
