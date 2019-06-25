const datastore = require("../google/datastore");

const kind = "Policy";

module.exports = {
  async get(id) {
    const key = datastore.key([kind, id]);
    const [record] = await datastore.get(key);
    return record;
  },
};
