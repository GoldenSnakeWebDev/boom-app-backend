import SwaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: SwaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Boom Social Media",
      description: `The web3 Social Media`,
      contact: {
        name: "nGeni, Omambia Dauglous",
      },
      version: "0.0.1",
    },
    schemes: ["http", "https"],
    tags: [
      {
        name: "Auth",
        description:
          "ALL the apis for user authentication, authorization and account management",
      },
      {
        name: "Booms",
        description:
          "These are apis for the Boom Web3 ecosystems that provide users/administrations on features to management and access the booms",
      },
    ],
    produces: ["application/json"],
  },
  failOnErrors: true,
  apis: [`${__dirname}/../routes/**/*.ts`, `${__dirname}/../routes/*.ts`],
};
