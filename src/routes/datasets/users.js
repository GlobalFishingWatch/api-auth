const authorization = require("../../middleware/authorization");
const actions = require("../../data/actions");
const users = require("../../data/users");
const log = require("../../data/log");

const checkAction = (action, applicablePolicies, dataset) => {
  return applicablePolicies.some(
    policy =>
      dataset.startsWith(policy.datasetPrefix) &&
      action.startsWith(policy.actionPrefix)
  );
};

const getAllAllowedActions = async (user, dataset) => {
  log.debug("Getting applicable policies");
  const applicablePolicies = await users.loadApplicablePolicies(user);

  log.debug("Checking each action against applicable policies");
  const actionReducer = (result, action) => ({
    ...result,
    [action]: checkAction(action, applicablePolicies, dataset)
  });
  return actions.reduce(actionReducer, {});
};

const isActionAllowed = async (action, user, dataset) => {
  log.debug("Getting applicable policies");
  const applicablePolicies = await users.loadApplicablePolicies(user);

  log.debug("Checking action against policies");
  return checkAction(action, applicablePolicies, dataset);
};

module.exports = app => {
  app.get(
    "/datasets/:dataset/users/me",
    authorization.requiresUser({ allowAnonymous: true }),
    async (req, res, next) => {
      try {
        const { user } = req.authorization;

        res.json({
          ...user.profile,
          identity: user.provider,
          allowedActions: await getAllAllowedActions(
            user,
            req.swagger.params.dataset.value
          )
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/datasets/:dataset/users/me/actions/:action",
    authorization.requiresUser({ allowAnonymous: true }),
    async (req, res, next) => {
      try {
        const { user } = req.authorization;
        const dataset = req.swagger.params.dataset.value;
        const action = req.swagger.params.action.value;

        const isAllowed = await isActionAllowed(action, user, dataset);

        if (isAllowed) {
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      } catch (error) {
        next(error);
      }
    }
  );
};
