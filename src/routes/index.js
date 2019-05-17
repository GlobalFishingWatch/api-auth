const swagger = require("./swagger");
const authorization = require("./authorization");
const datasets = require("./datasets");

module.exports = [swagger, authorization, ...datasets];
