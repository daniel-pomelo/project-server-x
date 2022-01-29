const firstLevelMaxXP = 240;

function calculateNextLevelXP(level) {
  let nextLevelXP = firstLevelMaxXP;
  for (i = 1; i < level; i++) {
    nextLevelXP += firstLevelMaxXP * 0.2;
  }
  return Math.round(nextLevelXP);
}
let acc_xp_max = 0;
for (let level = 1; level <= 20; level++) {
  const xp_max = calculateNextLevelXP(level);
  acc_xp_max += xp_max;
  console.log("level: ", level);
  console.log("xp_max: ", xp_max);
  console.log("acc_xp_max: ", acc_xp_max);
}
