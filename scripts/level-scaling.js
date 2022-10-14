const calculateNextLevelXP = require("../server/routes/calculateNextLevelXP");

console.log(1, calculateNextLevelXP(1));
console.log(2, calculateNextLevelXP(2));
console.log(3, calculateNextLevelXP(3));
console.log(4, calculateNextLevelXP(4));
console.log(51, calculateNextLevelXP(51));
console.log(52, calculateNextLevelXP(52));

function show(output) {
  console.log(Math.round(output));
}
