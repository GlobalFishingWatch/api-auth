const greenpeace = require("./greenpeace");

const environments = {
  development: {
    inherits: ["all"]
  },

  test: {
    inherits: ["development", "all"]
  },

  production: {
    inherits: ["all"]
  }
};

module.exports = greenpeace.sanitizeEnvironment(environments, {
  log: {
    level: greenpeace.entry({
      key: "LOG_LEVEL",
      doc:
        "Logging level. In increasing amount of logs: error, warn, info, verbose, debug, silly",
      defaults: { all: "debug" },
      required: true
    })
  },

  server: {
    host: greenpeace.entry({
      key: "HOST",
      doc: "Protocol, host and port where the server is exposed to clients.",
      defaults: { development: "http://localhost:8080" },
      required: true
    }),

    port: greenpeace.entry({
      key: "PORT",
      doc: "Port on which the server is exposed to clients.",
      defaults: { development: 8080 },
      required: true
    }),

    protocol: greenpeace.entry({
      key: "PROTOCOL",
      doc: "Protocol by which the server is exposed to clients.",
      defaults: { development: "http", production: "https" },
      required: true
    })
  },

  authorization: {
    secret: greenpeace.entry({
      key: "AUTHORIZATION_SECRET",
      doc: "Random key used to sign access tokens.",
      defaults: { development: "a1b2c3d4", test: "test" },
      required: true
    })
  },

  gcloud: {
    datastore: {
      projectId: greenpeace.entry({
        key: "GCLOUD_DATASTORE_PROJECTID",
        doc: "Google cloud platform project id for the datastore services.",
        defaults: { development: "world-fishing-827" },
        required: true
      }),

      namespace: greenpeace.entry({
        key: "GCLOUD_DATASTORE_NAMESPACE",
        doc:
          'Namespace to scope all datastore operations to. On development this should be set to something unique to the user, such as "andres--api"',
        defaults: { test: "dummy" },
        required: true
      })
    }
  },

  salesforce: {
    oauth: {
      endpoints: greenpeace.entry({
        key: "SALESFORCE_OAUTH_ENDPOINTS",
        doc: "Url namespace for the different oauth2 services at salesforce",
        defaults: {
          development:
            "https://trial-globalfishingwatch.cs43.force.com/gfw/services/oauth2/",
          test:
            "https://trial-globalfishingwatch.cs43.force.com/gfw/services/oauth2/"
        },
        required: true
      }),

      clientId: greenpeace.entry({
        key: "SALESFORCE_OAUTH_CLIENTID",
        doc: "Client id used to connect to salesforce oauth 2.0",
        defaults: { test: "" },
        required: true
      }),

      clientSecret: greenpeace.entry({
        key: "SALESFORCE_OAUTH_CLIENTSECRET",
        doc: "Client secret used to connect ot salesforce oauth 2.0",
        defaults: { test: "" },
        required: true
      })
    }
  }
});
