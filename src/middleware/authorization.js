const authorization = require("../data/authorization");
const users = require("../data/users");
const userGroups = require("../data/userGroups");
const config = require("../config");

const parseAuthorizationHeader = header => {
  if (header) {
    const claim = header.split(" ");
    if (claim.length !== 2 || claim[0] !== "Bearer") {
      throw new Error("Invalid authorization claim");
    }
    return claim[1];
  }
  return undefined;
};

module.exports = {
  requiresUser(options) {
    const actualOptions = {
      allowAnonymous: false,
      ...options
    };

    return async (req, res, next) => {
      try {
        const token = parseAuthorizationHeader(req.get("authorization"));
        const payload = token && authorization.decode(token);
        const databaseUser = await (payload && users.get(payload.id));

        if (!databaseUser && !actualOptions.allowAnonymous) {
          throw new Error("Invalid authorization claim");
        }

        const user = databaseUser || {
          groups: [userGroups.keys.anonymous]
        };

        req.authorization = {
          user,
          payload
        };
        next();
      } catch (error) {
        res.status(401).send(error.message);
        next(error);
      }
    };
  },

  requiresAdminKey() {
    return (req, res, next) => {
      const authorizationClaim = req.get("authorization");

      if (authorizationClaim !== config.authorization.adminKey) {
        res.sendStatus(401);
      } else {
        next();
      }
    };
  }
};
