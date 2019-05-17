const yaml = require("yamljs");
const config = require("../config");

const spec = yaml.load("./src/api/index.yaml");
const authPath = spec.securityDefinitions.oauth.authorizationUrl;
const actualAuthUrl = `${config.server.host}${authPath}`;
spec.securityDefinitions.oauth.authorizationUrl = actualAuthUrl;
spec.schemes = [config.server.protocol];

module.exports = spec;
