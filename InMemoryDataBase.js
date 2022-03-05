const COLLECTION_NAMES = {
  USER_EXPERIENCE: "UserExperience",
  USER_POINTS: "UserPoints",
  USER_SKILL_POINTS: "UserSkillPoints",
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
    db.userPoints = new Set();
    db.userSkillPoints = new Set();
    return db;
  }
  async save(collectionName, data) {
    if (collectionName === "Users") {
      this.users.set(data.id, data);
    }
    if (collectionIs(COLLECTION_NAMES.USER_EXPERIENCE, collectionName)) {
      this.userExperience.set(data.user_id, data);
    }
    if (collectionIs(COLLECTION_NAMES.USER_POINTS, collectionName)) {
      this.userPoints.add(data);
    }
    if (collectionIs(COLLECTION_NAMES.USER_SKILL_POINTS, collectionName)) {
      this.userSkillPoints.add(data);
    }
    if (collectionName === "UserStats") {
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
    if (collectionName === "UserStats") {
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
    if (collectionName === "Users") {
      return Array.from(this.users.values());
    }
    if (collectionName === "UserStats") {
      return Array.from(this.stats.values());
    }
    if (collectionIs(COLLECTION_NAMES.USER_POINTS, collectionName)) {
      return Array.from(this.userPoints.values()).filter(
        (item) => item.user_id === criteria.user_id
      );
    }
    if (collectionIs(COLLECTION_NAMES.USER_SKILL_POINTS, collectionName)) {
      return Array.from(this.userSkillPoints.values()).filter(
        (item) => item.user_id === criteria.user_id
      );
    }
    return [];
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
  async saveUserExperience(collectionName, operations) {
    operations.forEach(({ isFirstAssignment, newUserExperience }) => {
      if (isFirstAssignment) {
        this.save(collectionName, newUserExperience);
      } else {
        this.updateOne(
          collectionName,
          { user_id: newUserExperience.user_id },
          newUserExperience
        );
      }
    });
  }
  registerAssignExperience(experienceToAssign, timestamp) {}
  saveUserPoints(userPoints) {
    userPoints.forEach((points) => {
      this.save(COLLECTION_NAMES.USER_POINTS, points);
    });
  }
  saveUserSkillPoints(userPoints) {
    userPoints.forEach((points) => {
      this.save(COLLECTION_NAMES.USER_SKILL_POINTS, points);
    });
  }
}

module.exports = InMemoryDataBase;
