const MongoDataBase = require("../MongoDataBase");
const calculateNextLevelXPV2 = require("../server/routes/calculateNextLevelXPV2");

const dataset = [];
// let acc = 0;
let i = 1;

while (i < 99) {
  dataset.push({
    time: `${i} ${Math.round(calculateNextLevelXPV2(i) / 9216)}`,
    xp: calculateNextLevelXPV2(i),
  });
  // acc += calculateNextLevelXPV2(i);
  i++;
}
// acc += calculateNextLevelXPV2(i);
console.log("sali: ", JSON.stringify(dataset));

// show(51, calculateNextLevelXP(51));
show(51, calculateNextLevelXPV2(51));
// show(52, calculateNextLevelXP(52));
show(52, calculateNextLevelXPV2(52));
// show(53, calculateNextLevelXP(53));
show(53, calculateNextLevelXPV2(53));
// show(54, calculateNextLevelXP(54));
show(54, calculateNextLevelXPV2(54));
// show(55, calculateNextLevelXP(55));
show(55, calculateNextLevelXPV2(55));
// show(56, calculateNextLevelXP(56));
show(56, calculateNextLevelXPV2(56));
// show(57, calculateNextLevelXP(57));
show(57, calculateNextLevelXPV2(57));
// show(58, calculateNextLevelXP(58));
show(58, calculateNextLevelXPV2(58));
// show(59, calculateNextLevelXP(59));
show(59, calculateNextLevelXPV2(59));
// show(60, calculateNextLevelXP(60));
show(60, calculateNextLevelXPV2(60));
// show(70, calculateNextLevelXP(70));
show(70, calculateNextLevelXPV2(70));
// show(80, calculateNextLevelXP(80));
show(80, calculateNextLevelXPV2(80));
// show(90, calculateNextLevelXP(90));
show(90, calculateNextLevelXPV2(90));
// show(99, calculateNextLevelXP(99));
show(99, calculateNextLevelXPV2(99));
// show(120, calculateNextLevelXP(120));

function show(level, requiredXP) {
  console.log("Level: ", level);
  console.log("Required XP: ", Math.round(requiredXP));
  const hours = ((requiredXP / 32) * 5) / 60;
  const time =
    hours >= 24
      ? `${Math.ceil(hours / 24).toFixed(2)} days`
      : `${Math.ceil(hours).toFixed(2)} hours`;

  if (level >= 50) {
    console.log("Time to complete level ", time);
    return;
  }
  console.log(
    "Time to complete level ",
    Math.round(((requiredXP / 32) * 5) / 60).toFixed(2),
    " hours."
  );
}

// MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
//   console.log("****");

//   db.find(
//     "UserExperienceRecords",
//     { user_id: "4f1e1283-da0f-4051-9493-9f944c294b57" },
//     { sorting: "desc" }
//   )
//     .then((res) => console.log(JSON.stringify(res, null, 2)))
//     .then(() => process.exit());
// });
