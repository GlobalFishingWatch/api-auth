const datastore = require("../google/datastore");
const log = require("../data/log");
const userGroups = require("../data/userGroups");

const kind = "User";

module.exports = {
  async get(id) {
    const key = datastore.key([kind, id]);
    const [record] = await datastore.get(key);
    return record;
  },

  save(id, user) {
    const key = datastore.key([kind, id]);
    return datastore.save({
      key,
      data: user
    });
  },

  async loadGroups(user) {
    const [groups] = await datastore.get(user.groups);
    const sortedGroups = user.groups.map(userGroup =>
      groups.find(group => group.name === userGroup.name)
    );
    return sortedGroups;
  },

  async loadApplicablePolicies(user) {
    log.debug("Obtaining groups for user");
    const groups = await this.loadGroups(user);

    log.debug("Obtaining all policies given user groups");
    const nestedPolicies = await Promise.all(
      groups.map(group => userGroups.loadPolicies(group))
    );

    log.debug("Flattening applicable policies");
    return nestedPolicies.reduce((result, x) => result.concat(x));
  }
};
