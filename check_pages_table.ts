import { prisma } from './src/config/db';
async function main() {
  console.log("Checking Page records in database...");
  try {
    const page = await prisma.page.findFirst();
    console.log("Success! Columns exist. Sample record:", page);
  } catch (err: any) {
    console.error("Failed to query Page table:", err.message || err);
  }
}
main().catch(err => console.error("Error:", err)).finally(() => prisma.$disconnect());
