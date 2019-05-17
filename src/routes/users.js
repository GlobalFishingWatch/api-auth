const authorization = require("../middleware/authorization");

module.exports = app => {
  app.get(
    "/datasets/:dataset/users/me",
    authorization.requiresUser({ allowAnonymous: true }),
    async (req, res, next) => {
      try {
        const { user = {} } = req.authorization;
        res.json({
          ...user.profile,
          identity: user.provider,
          allowedFeatures: []
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
