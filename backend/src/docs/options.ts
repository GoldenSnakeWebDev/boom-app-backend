import SwaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: SwaggerJSDoc.Options = {
  swaggerDefinition: {
    info: {
      title: "Boom Social Media",
      description: `The web3 Social Media`,
      contact: {
        name: "nGeni, Omambia Dauglous",
      },
      version: "0.0.1",
    },
    tags: [
      {
        name: "Auth",
        description: "This authorizes the users",
      },
      {
        name: "Booms",
        description: "This authorizes the users",
      },
    ],
  },
  apis: [`${__dirname}/../routes/**/*.ts`],
};
