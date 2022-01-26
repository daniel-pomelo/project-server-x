const { MyServer } = require("./index");
const notifySecondLife = require("./notifySecondLife");
const MongoDataBase = require("../MongoDataBase");

const server = MyServer.start(MongoDataBase.init(), notifySecondLife);

server.listen();
