const qs = require("querystring");
const request = require("request-promise");
const config = require("../config");

module.exports = {
  authorizationUrl(state) {
    const params = qs.stringify({
      response_type: "code",
      client_id: config.salesforce.oauth.clientId,
      redirect_uri: `${config.server.host}/oauth/cb/salesforce`,
      state
    });
    return `${config.salesforce.oauth.endpoints}authorize?${params}`;
  },

  accessTokens(code) {
    return request.post({
      uri: `${config.salesforce.oauth.endpoints}token`,
      json: true,
      form: {
        grant_type: "authorization_code",
        client_id: config.salesforce.oauth.clientId,
        client_secret: config.salesforce.oauth.clientSecret,
        code,
        redirect_uri: `${config.server.host}/oauth/cb/salesforce`
      }
    });
  },

  userInfo(tokens) {
    return request.get({
      uri: tokens.id,
      json: true,
      headers: {
        Authorization: `${tokens.token_type} ${tokens.access_token}`
      }
    });
  }
};
