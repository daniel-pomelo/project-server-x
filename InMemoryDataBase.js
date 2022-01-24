class InMemoryDataBase {
  static init() {
    const db = new InMemoryDataBase();
    db.registerAttemps = new Map();
    db.users = new Map();
    return db;
  }
  async save(collectionName, data) {
    if (collectionName === "Users") {
      this.users.set(data.id, data);
    } else {
      const { userId } = data;
      this.registerAttemps.set(userId, data);
    }
  }
  async findAll(collectionName) {
    if (collectionName === "Users") {
      return Array.from(this.users.values());
    } else {
      throw new Error(collectionName, " not implemented for findAll");
    }
  }
  async findOne(collectionName, criteria) {
    if (collectionName === "Users") {
      if (criteria.id === "abc123") {
        return Promise.resolve({
          id: "abc123",
          name: "Daniel",
          breed: "Dragon",
          type: "Hielo",
          level_name: "Milenios",
          level_value: 1,
          stats: {
            health: 100,
            mana: 100,
          },
        });
      } else if (criteria.id === "abc789") {
        return null;
      } else if (criteria.id === "abc78910") {
        return Promise.reject(new Error("Some error message"));
      } else {
        return this.users.get(criteria.id);
      }
    }
    if (collectionName === "Bridges") {
      return {
        id: criteria.id,
        url: "http://sarasa.com",
      };
    }
    if (collectionName === "RegisterAttempts") {
      const { userId } = criteria;
      return this.registerAttemps.get(userId);
    }
  }
}

module.exports = InMemoryDataBase;
