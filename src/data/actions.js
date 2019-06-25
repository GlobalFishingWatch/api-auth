const apiSpec = require("../api");

module.exports = {
  all: apiSpec.definitions.Action.enum,

  isActionAllowed(action, applicablePolicies, dataset) {
    const finalPolicy = applicablePolicies.find(
      policy =>
        dataset.startsWith(policy.datasetPrefix) &&
        action.startsWith(policy.actionPrefix)
    );

    if (finalPolicy) {
      return finalPolicy.allow;
    }

    return false;
  }
};

module.exports = apiSpec.definitions.Action.enum;
