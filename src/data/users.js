const datastore = require("../google/datastore");

const datasetKind = "User";

module.exports = {
  get(id) {
    const key = datastore.key([datasetKind, id]);
    return datastore.get(key).then(queryResult => queryResult[0]);
  },

  save(id, user) {
    const key = datastore.key([datasetKind, id]);
    return datastore.save({
      key,
      data: user
    });
  }
};
