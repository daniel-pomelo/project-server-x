const registerAttemps = new Map();
const users = new Map();

class InMemoryDataBase {
  static init() {
    return new InMemoryDataBase();
  }
  async save(collectionName, data) {
    if (collectionName === "Users") {
      users.set(data.id, data);
    } else {
      const { userId } = data;
      registerAttemps.set(userId, data);
    }
  }
  async findAll(collectionName) {
    if (collectionName === "Users") {
      return Array.from(users.values());
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
        return users.get(criteria.id);
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
      return registerAttemps.get(userId);
    }
  }
}

module.exports = InMemoryDataBase;
