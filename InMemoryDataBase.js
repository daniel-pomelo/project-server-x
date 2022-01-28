class InMemoryDataBase {
  static init() {
    const db = new InMemoryDataBase();
    db.registerAttemps = new Map();
    db.users = new Map();
    db.bridges = new Map();
    db.stats = new Set();
    return db;
  }
  async save(collectionName, data) {
    if (collectionName === "Users") {
      this.users.set(data.id, data);
    }
    if (collectionName === "UsersProps") {
      this.stats.add(data);
    } else {
      const { userId } = data;
      this.registerAttemps.set(userId, data);
    }
  }
  async findAll(collectionName) {
    if (collectionName === "Users") {
      return Array.from(this.users.values());
    }
    if (collectionName === "UsersProps") {
      return Array.from(this.stats.values());
    }
  }
  async findOne(collectionName, criteria) {
    if (collectionName === "Users") {
      if (criteria.id === "USER_ID_THAT_WILL_CAUSE_ERROR") {
        return Promise.reject(
          new Error("Error de base de datos para este user id")
        );
      } else {
        return this.users.get(criteria.id);
      }
    }
    if (collectionName === "Bridges") {
      return this.bridges.get(criteria.id);
    }
    if (collectionName === "RegisterAttempts") {
      const { userId } = criteria;
      return this.registerAttemps.get(userId);
    }
  }
  updateOne(collectionName, criteria, data) {
    if (collectionName === "Bridges") {
      this.bridges.set(criteria.id, data);
    }
  }
  async find(collectionName, criteria) {
    return Array.from(this.stats.values());
  }
}

module.exports = InMemoryDataBase;
