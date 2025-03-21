// src/index.ts
import {
  ModelType,
  Service,
  logger
} from "@elizaos/core";
import { z } from "zod";
var configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z.string().min(1, "Example plugin variable is not provided").optional().transform((val) => {
    if (!val) {
      logger.warn("Example plugin variable is not provided (this is expected)");
    }
    return val;
  })
});
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "Responds with a simple hello world message",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger.info("Handling HELLO_WORLD action");
      const responseContent = {
        text: "hello world!",
        actions: ["HELLO_WORLD"],
        source: message.content.source
      };
      await callback(responseContent);
      return responseContent;
    } catch (error) {
      logger.error("Error in HELLO_WORLD action:", error);
      throw error;
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you say hello?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "hello world!",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};
var StarterService = class _StarterService extends Service {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
  }
  static serviceType = "starter";
  capabilityDescription = "This is a starter service which is attached to the agent through the starter plugin.";
  static async start(runtime) {
    logger.info(`*** Starting starter service - MODIFIED: ${(/* @__PURE__ */ new Date()).toISOString()} ***`);
    const service = new _StarterService(runtime);
    return service;
  }
  static async stop(runtime) {
    logger.info("*** TESTING DEV MODE - STOP MESSAGE CHANGED! ***");
    const service = runtime.getService(_StarterService.serviceType);
    if (!service) {
      throw new Error("Starter service not found");
    }
    service.stop();
  }
  async stop() {
    logger.info("*** THIRD CHANGE - TESTING FILE WATCHING! ***");
  }
};
var starterPlugin = {
  name: "plugin-starter",
  description: "Plugin starter for elizaOS",
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE
  },
  async init(config) {
    logger.info("*** TESTING DEV MODE - PLUGIN MODIFIED AND RELOADED! ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime, { prompt, stopSequences = [] }) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType.TEXT_LARGE]: async (_runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    }
  },
  tests: [
    {
      name: "plugin_starter_test_suite",
      tests: [
        {
          name: "example_test",
          fn: async (runtime) => {
            logger.debug("example_test run by ", runtime.character.name);
            if (runtime.character.name !== "Eliza") {
              throw new Error(
                `Expected character name to be "Eliza" but got "${runtime.character.name}"`
              );
            }
            const service = runtime.getService("starter");
            if (!service) {
              throw new Error("Starter service not found");
            }
          }
        },
        {
          name: "should_have_hello_world_action",
          fn: async (runtime) => {
            const actionExists = starterPlugin.actions.some((a) => a.name === "HELLO_WORLD");
            if (!actionExists) {
              throw new Error("Hello world action not found in plugin");
            }
          }
        }
      ]
    }
  ],
  routes: [
    {
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug("MESSAGE_RECEIVED event received");
        logger.debug(Object.keys(params));
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug("VOICE_MESSAGE_RECEIVED event received");
        logger.debug(Object.keys(params));
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.debug("WORLD_CONNECTED event received");
        logger.debug(Object.keys(params));
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.debug("WORLD_JOINED event received");
        logger.debug(Object.keys(params));
      }
    ]
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider]
};
{
  const debugPlugin = () => {
    logger.debug("DEBUG: PLUGIN STRUCTURE:");
    logger.debug("Plugin name:", starterPlugin.name);
    logger.debug("Tests array exists:", !!starterPlugin.tests);
    logger.debug("Tests array length:", starterPlugin.tests?.length);
    if (starterPlugin.tests && starterPlugin.tests.length > 0) {
      logger.debug("First test suite name:", starterPlugin.tests[0].name);
      logger.debug("First test suite has tests array:", !!starterPlugin.tests[0].tests);
      logger.debug("First test suite tests length:", starterPlugin.tests[0].tests?.length);
      if (starterPlugin.tests[0].tests && starterPlugin.tests[0].tests.length > 0) {
        logger.debug("First test name:", starterPlugin.tests[0].tests[0].name);
        logger.debug("First test has fn:", !!starterPlugin.tests[0].tests[0].fn);
      }
    }
  };
  debugPlugin();
}
var index_default = starterPlugin;
export {
  StarterService,
  index_default as default,
  starterPlugin
};
//# sourceMappingURL=index.js.map