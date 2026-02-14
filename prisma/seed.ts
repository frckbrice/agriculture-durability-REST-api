import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
    // Seed Companies
    const company1 = await prisma.company.upsert({
        where: { email: 'company1@example.com' },
        update: {},
        create: {
            name: 'Company One',
            slug: 'company-one',
            country: 'CountryA',
            email: 'company1@example.com',
            head_office_email: 'office1@example.com',
            sector_of_activity: 'Agriculture',
            address: '123 Main St',
            phone_number: '1234567890',
            city: 'CityA',
            description: 'First company',
            region: 'RegionA',
            timezone: 'UTC',
            status: 'ACTIVE',
        },
    });

    // Seed Campaigns
    const campaign1 = await prisma.campaign.upsert({
        where: { name: 'Spring Campaign' },
        update: {},
        create: {
            name: 'Spring Campaign',
            description: 'Spring season campaign',
            start_date: new Date('2026-03-01'),
            end_date: new Date('2026-06-01'),
            status: 'OPEN',
        },
    });

    // Seed Company-Campaign relation
    await prisma.company_Campaign.upsert({
        where: {
            company_id_campaign_id: {
                company_id: company1.id,
                campaign_id: campaign1.id,
            } as any, // Use 'as any' if TypeScript complains, or adjust to your actual unique input type
        },
        update: {},

        create: {
            company_id: company1.id,
            campaign_id: campaign1.id,
        },
    });

    // Seed Users
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'PDG',
            company_id: company1.id,
            status: 'ACTIVE',
        },
    });

    // Seed Projects
    await prisma.project.upsert({
        where: { code: 'PRJ001' },
        update: {},
        create: {
            code: 'PRJ001',
            type: 'INITIAL_INSPECTION',
            slug: 'project-one',
            campaign_id: campaign1.id,
            company_id: company1.id,
            title: 'Project One',
            description: 'First project',
            sector_activity: 'Cocoa',
            country: 'CountryA',
            status: 'ACTIVE',
            region: 'RegionA',
            city: 'CityA',
            start_date: new Date('2026-03-10'),
            end_date: new Date('2026-06-10'),
            project_structure: {},
            draft_at: new Date(),
            deployed_at: new Date(),
            updated_at: new Date(),
            deleted_at: new Date(),
            archived_at: new Date(),
        },
    });

    // Seed Training (using unique code)
    await prisma.training.upsert({
        where: { code: 'TRN001' },
        update: {},
        create: {
            code: 'TRN001',
            title: 'Training One',
            location: 'Training Center',
            modules: ['Module1', 'Module2'],
            start_date: new Date('2026-04-01'),
            end_date: new Date('2026-04-10'),
            status: 'ACTIVE',
            company_id: company1.id,
            deployed_at: new Date(),
            draft_at: new Date(),
            archived_at: new Date(),
            deleted_at: new Date(),
        },
    });

    // Seed Market (using unique code)
    await prisma.market.upsert({
        where: { code: 'MKT001' },
        update: {},
        create: {
            code: 'MKT001',
            company_id: company1.id,
            start_date: new Date('2026-05-01'),
            end_date: new Date('2026-05-02'),
            price_of_theday: 100,
            supplier: 'SupplierA',
            description: 'Market for cocoa',
            location: 'Market City',
            campaign_id: campaign1.id,
            type_of_market: 'COCOA',
            status: 'OPEN',
            created_at: new Date(),
            updated_at: new Date(),
        },
    });

    // Ensure Price_plan exists for Subscription
    const plan = await prisma.price_plan.upsert({
        where: { plan_name: 'Bronze Plan' },
        update: {},
        create: {
            plan_name: 'Bronze Plan',
            status: 'ON',
            price: '100',
            currency: 'USD',
            product_name: 'BRONZE',
            price_type: 'Fixed pricing',
            description: 'Basic bronze plan',
            billing_cycle: 'ANNUAL',
        },
    });

    // Seed Subscription
    await prisma.subscription.upsert({
        where: { id: 'sub1' },
        update: {},
        create: {
            id: 'sub1',
            plan_id: plan.id,
            company_id: company1.id,
            start_date: new Date('2026-02-01'),
            end_date: new Date('2027-02-01'),
            status: 'ACTIVE',
            payment_mode: 'CARD',
            created_at: new Date(),
            updated_at: new Date(),
        },
    });
}

main()
    .catch(() => {
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
