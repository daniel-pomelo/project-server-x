const { MyServer } = require("./index");
const SystemEvents = require("./SystemEvents");
const MongoDataBase = require("../MongoDataBase");

const db = MongoDataBase.init();
const server = MyServer.start(db, SystemEvents.init(db));

server.listen();
