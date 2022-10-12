const getPlayers = (db) => async (req, res) => {
  try {
    const [users, disabledIds] = await Promise.all([
      db.find("Users"),
      db
        .find("DisabledUsers")
        .then((users) => users.map((user) => user.user_id)),
    ]);

    const isEnabled = (user) => !disabledIds.includes(user.id);

    const players = users.map((user) => {
      return {
        ...user,
        enabled: isEnabled(user),
      };
    });

    res.send({
      players,
    });
  } catch (error) {
    console.log("get-players error: ", error);
    res.send({ error });
  }
};

module.exports = getPlayers;
