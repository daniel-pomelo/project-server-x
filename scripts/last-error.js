const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  const res1 = await db.findNewest("Errors");
  showLastError(res1);
});

async function showLastError(lastError) {
  if (!lastError) {
    console.log("No errors.");
  } else {
    console.log(lastError.timestamp);
    console.log(lastError.error.message);
    lastError.error.stack.split("\n").forEach((line) => console.log(line));
  }
}
