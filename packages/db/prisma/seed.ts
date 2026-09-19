import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.appMeta.upsert({
    where: { key: "schema_note" },
    create: { key: "schema_note", value: "FE foundation placeholder — no business seed." },
    update: { value: "FE foundation placeholder — no business seed." },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
