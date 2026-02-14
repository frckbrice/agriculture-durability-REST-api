import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const companies = await prisma.company.findMany();

    for (const company of companies) {
        const company_bucket = 'unknown';
        await prisma.company.update({
            where: { id: company.id },
            data: { company_bucket },
        });
    }

    console.log('Data migration completed successfully.');
}

main()
    .catch((e) => {
        console.error('Error during data migration:', e);
    })
    .finally(() => prisma.$disconnect());
