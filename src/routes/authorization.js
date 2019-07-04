const qs = require("querystring");
const util = require("util");
const salesforce = require("../data/salesforce");
const authorization = require("../data/authorization");
const users = require("../data/users");
const userGroups = require("../data/userGroups");
const log = require("../data/log");

const appendDefaultUserGroup = user => {
  const originalGroups = (user && user.groups) || [];
  log.debug(`The original user groups are ${util.inspect(originalGroups)}`);
  if (
    !originalGroups.find(
      groupKey =>
        groupKey.kind === userGroups.keys.default.kind &&
        groupKey.name === userGroups.keys.default.name
    )
  ) {
    log.debug("The original groups don't include the default");
    return [...originalGroups, userGroups.keys.default];
  }

  log.debug("The original groups include the default");
  return originalGroups;
};

const storeSalesforceUser = async (salesforceUser, accessTokens) => {
  log.debug("Storing salesforce user in local datastore");

  const id = `sf:${salesforceUser.id}`;
  const existingUser = await users.get(id);

  log.debug(`Existing user is ${util.inspect(existingUser)}`);

  const groups = appendDefaultUserGroup(existingUser);

  const updatedUser = {
    id,

    provider: {
      type: "sf",
      id: salesforceUser.id,
      organizationId: salesforceUser.organization_id,
      userId: salesforceUser.user_id
    },

    profile: {
      displayName: salesforceUser.display_name,
      email: salesforceUser.email,
      photos: {
        main: salesforceUser.photos.picture,
        thumbnail: salesforceUser.photos.thumbnail
      }
    },

    tokens: {
      accessToken: accessTokens.access_token,
      refreshToken: accessTokens.refresh_token
    },

    groups
  };

  await users.save(id, updatedUser);

  return updatedUser;
};

const redirectionUrl = (state, token) => {
  const parsedState = qs.parse(state);

  return `${parsedState.r}#access_token=${token}&state=${parsedState.s}`;
};

module.exports = app => {
  app.get("/oauth/authorize", (req, res) => {
    log.debug("Building redirect uri");
    const validResponseType = req.query.response_type === "token";
    const validClient = req.query.client_id !== undefined;

    if (!validResponseType || !validClient) {
      log.warn("Invalid request", req.query);
      res.sendStatus(400);
    } else {
      log.debug("Bulding state for authorization url");
      const state = qs.stringify({
        r: req.query.redirect_uri,
        s: req.query.state
      });

      log.debug("Bulding actual salesforce url");
      const url = salesforce.authorizationUrl(state);

      log.debug("Authorization url built", url);
      res.redirect(url);
    }
  });

  app.get("/oauth/cb/salesforce", async (req, res, next) => {
    try {
      log.debug("Callback from salesforce, requesting access token");
      const accessTokens = await salesforce.accessTokens(req.query.code);

      log.debug("Obtained access token, querying user information");
      const user = await salesforce.userInfo(accessTokens);

      log.debug("Obtained user information, upserting local user data");
      const storedUser = await storeSalesforceUser(user, accessTokens);

      log.debug("Upserted local user data, generating access token");
      const localTokenPayload = { id: storedUser.id };
      const localToken = authorization.encode(localTokenPayload);

      log.debug("Token generated, generating redirection url");
      const url = redirectionUrl(req.query.state, localToken);

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  });
};
