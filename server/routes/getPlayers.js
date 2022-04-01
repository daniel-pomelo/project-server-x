const getPlayers = (db) => async (req, res) => {
  const [users, isDisabled] = await Promise.all([
    db.find("Users"),
    db.find("DisabledUsers").then((documents) => {
      const map = new Map();

      documents.forEach((document) => {
        map.set(document.user_id, true);
      });

      const isDisabled = (user) => !map.get(user.id);

      return isDisabled;
    }),
  ]);

  const players = users.map((user) => {
    return {
      ...user,
      enabled: isDisabled(user),
    };
  });

  res.send({ players });
};

module.exports = getPlayers;
