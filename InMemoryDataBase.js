const COLLECTION_NAMES = {
  USER_EXPERIENCE: "UserExperience",
};

function collectionIs(expectedName, collectionName) {
  return expectedName === collectionName;
}
class InMemoryDataBase {
  static init() {
    const db = new InMemoryDataBase();
    db.registerAttemps = new Map();
    db.users = new Map();
    db.bridges = new Map();
    db.userExperience = new Map();
    db.stats = new Set();
    return db;
  }
  async save(collectionName, data) {
    if (collectionName === "Users") {
      this.users.set(data.id, data);
    }
    if (collectionIs(COLLECTION_NAMES.USER_EXPERIENCE, collectionName)) {
      this.userExperience.set(data.user_id, data);
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
    if (collectionIs(COLLECTION_NAMES.USER_EXPERIENCE, collectionName)) {
      return Array.from(this.userExperience.values());
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
    if (collectionIs(COLLECTION_NAMES.USER_EXPERIENCE, collectionName)) {
      return this.userExperience.get(criteria.user_id) || null;
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
    if (collectionIs(COLLECTION_NAMES.USER_EXPERIENCE, collectionName)) {
      this.userExperience.set(criteria.user_id, data);
    }
  }
  async find(collectionName, criteria) {
    return Array.from(this.stats.values());
  }
  async groupByUserId(collectionName, userIds) {
    const all = Array.from(this.userExperience.values());
    const experiences = all
      .filter((experience) => {
        return userIds.includes(experience.user_id);
      })
      .reduce((acc, experience) => {
        acc[experience.user_id] = experience;
        return acc;
      }, {});
    return experiences;
  }
  async bulkWrite(collectionName, operations) {
    operations.forEach(({ operation, document }) => {
      if (operation === "insert") {
        this.save(collectionName, document);
      } else {
        this.updateOne(collectionName, { user_id: document.user_id }, document);
      }
    });
  }
}

module.exports = InMemoryDataBase;
