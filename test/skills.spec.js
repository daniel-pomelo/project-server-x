const scaleSkill = require("../server/scaleSkill");
const { expect } = require("chai");

describe("scale skills", () => {
  it("should skill level be 1 by default", () => {
    const skillBase = {
      health_self: 100,
      mana_self: -50,
      skill_level_value: 1,
    };
    const actual = scaleSkill(skillBase);

    const expected = {
      health_self: 100,
      mana_self: -50,
    };

    expect(actual).to.eqls(expected);
  });
  it("sum 20% of health_self and mana_self then multiply by completed levels", () => {
    const actual = scaleSkill({
      health_self: 100,
      mana_self: -50,
      skill_level_value: 3,
    });

    const expected = {
      health_self: 120,
      mana_self: -60,
      skill_level_value: 3,
    };

    expect(actual).to.eqls(expected);
  });
});
