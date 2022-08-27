const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");
const Tokens = require("./Tokens");

const UI_URL = process.env.URL_TO_UI;

const server = MyServer.start();

server.listen();

MongoDataBase.init().then((db) => {
  server.setDB(db, SystemEvents.init(db), new Tokens(), UI_URL);
});

module.exports = server.app;
