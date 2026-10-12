import { prismaClient } from "../src/prisma-client";

describe("Prisma Client", () => {
  it("should be abble connect prisma client", async () => {
    await prismaClient.$connect();
    // do something
    await prismaClient.$disconnect();
  });
});
