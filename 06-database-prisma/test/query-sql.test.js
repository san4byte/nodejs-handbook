import { prismaClient } from "../src/prisma-client";

describe("Prisma CLient", () => {
  it("should be able to query sql", async () => {
    const id = "2";

    const samples = await prismaClient.$queryRaw`SELECT * FROM sampel WHERE id = ${id}`;
    console.info(samples); //  [ { id: '1', name: 'Joko Santoso' }, ... ]
  });
});
