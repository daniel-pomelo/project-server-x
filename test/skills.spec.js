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
      skill_level_value: 1,
    };

    expect(actual).to.eqls(expected);
  });
  it("sum 20% of health_self and mana_self then multiply by completed levels", () => {
    const actual = scaleSkill({
      name: "Heal",
      id: "self-heal",
      description: "Hola esta es la descripción, chau esta es la descripción.",
      icon: "40032c3a-79a9-f91f-8af3-0fd250f8a0b8",
      enabled: true,
      health_self: 50,
      health_other: 0,
      mana_self: -20,
      mana_other: 0,
      amount: 0,
      effect: -1,
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
      name: "Heal",
      id: "self-heal",
      description: "Hola esta es la descripción, chau esta es la descripción.",
      icon: "40032c3a-79a9-f91f-8af3-0fd250f8a0b8",
      enabled: true,
      health_self: 60,
      health_other: 0,
      mana_self: -24,
      mana_other: 0,
      amount: 0,
      effect: -1,
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
  it("sum 20% of health_self and mana_self then multiply by completed levels", () => {
    const actual = scaleSkill({
      id: "ignite",
      name: "Ignite",
      icon: "874d1112-787d-f7a7-77d4-bcff2594227f",
      description: "Hola esta es la descripción, chau esta es la descripción.",
      enabled: true,
      target: 1,
      effect: 1,
      mana_other: 0,
      health_other: 0,
      reach: 10,
      mana_self: -35,
      health_self: 0,
      cooldown: 10,
      level_gap: 2,
      level_min: 2,
      amount: -6,
      amount_max: 0,
      cooldown_max: 0,
      duration: 10,
      duration_max: 0,
      skill_level_value: 2,
    });

    const expected = {
      id: "ignite",
      name: "Ignite",
      icon: "874d1112-787d-f7a7-77d4-bcff2594227f",
      description: "Hola esta es la descripción, chau esta es la descripción.",
      enabled: true,
      target: 1,
      effect: 1,
      mana_other: 0,
      health_other: 0,
      reach: 10,
      mana_self: -42,
      health_self: 0,
      cooldown: 10,
      level_gap: 2,
      level_min: 2,
      amount: -8,
      amount_max: 0,
      cooldown_max: 0,
      duration: 10,
      duration_max: 0,
      skill_level_value: 2,
    };

    expect(actual).to.eqls(expected);
  });
});
