import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      _id: string;
      [key: string]: any;
    };
  }
}
