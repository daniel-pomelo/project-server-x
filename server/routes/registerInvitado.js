const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");
const { forceMeterUpdate } = require("../../forceMeterUpdate");

module.exports = (db) => async (req, res) => {
  const invitationKey = req.params.id;
  const invitation = await db.findOne("Invitations", { key: invitationKey });

  const id = invitation.invitado;
  const data = {
    name: req.body.name.trim(),
    breed: req.body.breed.trim(),
    type: req.body.type.trim(),
    level_name: req.body.level_name.trim(),
  };

  await Promise.all([
    verifyUserIsNotRegistered(db, id),
    verifyUserNameIsAvailable(db, data.name),
    verifyHasOnlyLetters(data, "name"),
    verifyHasOnlyLetters(data, "breed"),
    verifyHasOnlyLettersOrNumbers(data, "type"),
    verifyHasOnlyLetters(data, "level_name"),
  ]);

  await db.save("Users", User.from(id, data));
  await db.giveUserSkillPointTo(id);

  await db.updateInvitationTimestamp(invitation, timestamp());

  const url = await getProfileUrl(db, id);

  res.status(201).send({ url });

  await forceMeterUpdate(id, db, "USER_REGISTER");
};

class User {
  static from(id, { name, breed, type, level_name }) {
    return {
      id,
      name,
      breed,
      type,
      level_name,
      level_value: 1,
      stats: {
        health: 100,
        mana: 100,
      },
    };
  }
}

async function verifyUserIsNotRegistered(db, id) {
  const user = await db.findOne("Users", { id });
  if (user) {
    throw new Error("USER_ALREADY_EXISTS");
  }
}
async function verifyUserNameIsAvailable(db, name) {
  const user = await db.findOne("Users", { name });
  if (user) {
    throw new Error(`The name "${name}" is already taken.`);
  }
}
async function verifyHasOnlyLetters(data, fieldName) {
  const value = data[fieldName];
  const containsNumbers = value.match(/[\d]/);
  const containsSpecialCharacters = value.match(/[\W]/);
  if (containsNumbers || containsSpecialCharacters) {
    throw new Error(`Your ${fieldName} can only contain letters.`);
  }
}
async function verifyHasOnlyLettersOrNumbers(data, fieldName) {
  const value = data[fieldName];
  const containsSpecialCharacters = value.match(/[\W]/);
  if (containsSpecialCharacters) {
    throw new Error(`Your ${fieldName} can only contain letters or numbers.`);
  }
}
