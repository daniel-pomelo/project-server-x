class UserMaterials {
  static from(payload) {
    const append = (acc, { type, quantity }) => {
      const found = acc.get(type);
      if (found) {
        return acc.set(type, incrementQuantity(found, quantity));
      }
      return acc.set(type, { type, quantity });
    };
    const mapper = ({ material, quantity }) => ({ type: material, quantity });
    return Array.from(payload.map(mapper).reduce(append, new Map()).values());
  }
}

function incrementQuantity(found, quantity) {
  return {
    ...found,
    quantity: quantity + found.quantity,
  };
}

module.exports = { UserMaterials };
