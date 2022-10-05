const assertCharacterExists = (db, userId) => {
  return db.findOne("Users", { id: userId }).then((user) => {
    if (user === null) {
      const error = new Error("CHARACTER_NOT_FOUND");
      error.context = "GETTING_PROFILE_URL";
      error.reason = "CHARACTER_NOT_FOUND";
      error.payload = {
        query: { id: userId },
      };
      throw error;
    }
  });
};

module.exports = assertCharacterExists;
