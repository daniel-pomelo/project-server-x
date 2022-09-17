const getInvitation = (tokens, db) => async (req, res) => {
  const invitationKey = req.params.id;
  const invitation = await db.findOne("Invitations", { key: invitationKey });

  if (!invitation) {
    return res.status(410).send({});
  }

  const query = {
    id: invitation.invitador,
  };
  const invitador = await db.findOne("Users", query);

  res.send({
    invitador: {
      name: invitador.name,
    },
  });
};

module.exports = getInvitation;
