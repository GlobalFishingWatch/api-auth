const datastore = require("../google/datastore");

const kind = "UserGroup";

module.exports = {
  keys: {
    anonymous: datastore.key([kind, "Anonymous"]),
    default: datastore.key([kind, "Default"])
  },

  async get(id) {
    const key = datastore.key([kind, id]);
    const [record] = await datastore.get(key);
    return record;
  },

  async loadPolicies(userGroup) {
    if (userGroup.policies.length < 1) {
      return [];
    }
    const [policies] = await datastore.get(userGroup.policies);
    const sortedPolicies = userGroup.policies.map(groupPolicy =>
      policies.find(policy => policy.name === groupPolicy.name)
    );
    return sortedPolicies;
  }
};
