const authorization = require("../middleware/authorization");
const actions = require("../data/actions");
const users = require("../data/users");
const log = require("../data/log");

module.exports = app => {
  app.get(
    "/users/me",
    authorization.requiresUser({ allowAnonymous: true }),
    async (req, res, next) => {
      try {
        const { user } = req.authorization;

        log.debug("Loading applicable policies");
        const applicablePolicies = await users.loadApplicablePolicies(user);

        log.debug(`Checking ${actions.all} against the applicable policies`);
        const allowedActions = actions.all.reduce(
          (result, action) => ({
            ...result,
            [action]: actions.isActionAllowed(action, applicablePolicies)
          }),
          {}
        );

        res.json({
          ...user.profile,
          identity: user.provider,
          allowedActions
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/users/me/actions/:action",
    authorization.requiresUser({ allowAnonymous: true }),
    async (req, res, next) => {
      try {
        const { user } = req.authorization;
        const action = req.swagger.params.action.value;

        log.debug("Loading applicable policies");
        const applicablePolicies = await users.loadApplicablePolicies(user);

        log.debug(`Checking action ${action} against the applicable policies`);
        const isAllowed = actions.isActionAllowed(action, applicablePolicies);

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
