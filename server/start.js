const { MyServer } = require("./index");
const MongoDataBase = require("../MongoDataBase");

const server = MyServer.start(MongoDataBase.init());

server.listen();
