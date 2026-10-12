import { prismaClient } from "../src/prisma-client";

describe("Prisma CLient", () => {
  it("should be able to execute sql", async () => {
    const id = "2";
    const name = "Lusiana Fahmi";

    const impacted =
      await prismaClient.$executeRaw`INSERT INTO sampel(id, name) VALUES (${id}, ${name})`;

    expect(impacted).toBe(1);
  });
});
