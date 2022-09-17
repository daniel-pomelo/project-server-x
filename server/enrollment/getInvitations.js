function saveInvitation(db) {
  return async (req, res) => {
    const invitations = await db.getInvitations();
    res.send({
      invitations,
    });
  };
}

module.exports = saveInvitation;
