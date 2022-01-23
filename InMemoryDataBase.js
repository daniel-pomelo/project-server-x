const registerAttemps = new Map();

class InMemoryDataBase {
  static init() {
    return new InMemoryDataBase();
  }
  async save(collectionName, data) {
    registerAttemps.set(userId, data);
  }
  async findOne(collectionName, criteria) {
    if (collectionName === "RegisterAttempts") {
      const { userId } = criteria;
      return registerAttemps.get(userId);
    }
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
    } else {
      return Promise.reject(new Error("Some error message"));
    }
  }
}

module.exports = InMemoryDataBase;
