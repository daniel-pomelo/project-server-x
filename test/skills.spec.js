const { expect } = require("chai");

describe("xx", () => {
  it("test 1", () => {
    const actual = scaleSkill({
      health_self: 100,
      mana_self: -50,
    });

    const expected = {
      health_self: 100,
      mana_self: -50,
    };

    expect(actual).to.eqls(expected);
  });
  it("test 2", () => {
    const actual = scaleSkill({
      health_self: 100,
      mana_self: -50,
      skill_level_value: 2,
    });

    const expected = {
      health_self: 120,
      mana_self: -60,
      skill_level_value: 2,
    };

    expect(actual).to.eqls(expected);
  });
  it("test 3", () => {
    const actual = scaleSkill({
      health_self: 100,
      mana_self: -50,
      skill_level_value: 5,
    });

    const expected = {
      health_self: 180,
      mana_self: -90,
      skill_level_value: 5,
    };

    expect(actual).to.eqls(expected);
  });
});

function scaleSkill(skill) {
  const { health_self, mana_self, skill_level_value = 1 } = skill;
  return {
    ...skill,
    health_self:
      health_self + (health_self / 100) * 20 * (skill_level_value - 1),
    mana_self: mana_self + (mana_self / 100) * 20 * (skill_level_value - 1),
  };
}
