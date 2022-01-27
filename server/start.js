const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");

const server = MyServer.start(MongoDataBase.init(), SystemEvents.init());

server.listen();
