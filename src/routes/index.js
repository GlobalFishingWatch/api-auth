const swagger = require("./swagger");
const authorization = require("./authorization");
const datasets = require("./datasets");
const users = require("./users");

module.exports = [swagger, authorization, users, ...datasets];
