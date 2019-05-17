const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = {
  encode(payload) {
    return jwt.sign(payload, config.authorization.secret);
  },

  decode(token) {
    return jwt.verify(token, config.authorization.secret);
  }
};
