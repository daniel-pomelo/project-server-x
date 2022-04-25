const scaleSkill = require("../server/scaleSkill");
const { expect } = require("chai");

describe("scale skills", () => {
  it("should be 20% up when gap is 2", () => {
    const actual = scaleSkill({
      id: "self-heal",
      health_self: 50,
      health_other: 0,
      mana_self: -20,
      mana_other: 0,
      amount: 0,
      duration: 0,
      cooldown: 10,
      target: 0,
      reach: 0,
      level_gap: 2,
      level_min: 2,
      amount_max: 0,
      cooldown_max: 0,
      duration_max: 0,
      skill_level_value: 2,
    });

    const expected = {
      id: "self-heal",
      health_self: 60,
      health_other: 0,
      mana_self: -24,
      mana_other: 0,
      amount: 0,
      duration: 0,
      cooldown: 10,
      target: 0,
      reach: 0,
      level_gap: 2,
      level_min: 2,
      amount_max: 0,
      cooldown_max: 0,
      duration_max: 0,
      skill_level_value: 2,
    };

    expect(actual).to.eqls(expected);
  });
  it("should be 50% up when gap is 5", () => {
    const actual = scaleSkill({
      id: "self-heal",
      health_self: 50,
      health_other: 0,
      mana_self: -20,
      mana_other: 0,
      amount: 0,
      level_gap: 5,
      level_min: 2,
      skill_level_value: 4,
    });

    const expected = {
      id: "self-heal",
      health_self: 125,
      health_other: 0,
      mana_self: -50,
      mana_other: 0,
      amount: 0,
      level_gap: 5,
      level_min: 2,
      skill_level_value: 4,
    };

    expect(actual).to.eqls(expected);
  });
});
