-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PDG', 'EMPLOYEE', 'AGENT', 'ADG', 'AUDITOR', 'SALES', 'IT_SUPPORT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ARCHIVED', 'ACTIVE', 'DELETED', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "TypeProject" AS ENUM ('INITIAL_INSPECTION', 'INTERNAL_INSPECTION', 'AUTO_EVALUATION', 'MAPPING', 'TRAINING');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'SUSPENDED', 'APPROVAL_PENDING', 'EXPIRED', 'GRACE_PERIOD');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'PAYPAL', 'E_CHEQUE', 'CASH', 'INSTANT_BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "ProductName" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ON', 'OFF', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('COCOA', 'COFFEE', 'BANANA', 'WOOD', 'OTHER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('CONFIRMED', 'NOT_CONFIRMED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('ANNUAL', 'BIANNUAL');

-- CreateEnum
CREATE TYPE "IncomeAndShareResponsabilityType" AS ENUM ('PAYMENT_JUSTIFICATION', 'SUSTENABILITY_DIFFERENTIAL', 'INVESTMENT_MANAGEMENT_PLAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PDG',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profileUrls" TEXT,
    "company_id" TEXT NOT NULL,
    "famer_attached_contract_url" TEXT,
    "status" "UserStatus" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "country" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "head_office_email" TEXT NOT NULL,
    "payment_mode" TEXT,
    "company_paypal_email" TEXT,
    "payment_id" TEXT,
    "payment_phone_number" TEXT,
    "sector_of_activity" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "company_bucket" TEXT,
    "status" "CompanyStatus" DEFAULT 'INACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_type" TEXT NOT NULL,
    "total_drafts" INTEGER NOT NULL,
    "total_archiveds" INTEGER NOT NULL,
    "total_deployeds" INTEGER NOT NULL,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignee" (
    "id" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "projectCodes" TEXT[],
    "company_id" TEXT NOT NULL,
    "fullName" TEXT,
    "project_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "type" "TypeProject" NOT NULL,
    "slug" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector_activity" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "project_structure" JSONB NOT NULL DEFAULT '{}',
    "another_logo" TEXT,
    "code" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL,
    "draft_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_audit" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type_of_project" "TypeProject" NOT NULL,
    "invited_by" TEXT,
    "invitation_status" "InvitationStatus" DEFAULT 'NOT_CONFIRMED',
    "action" "ProjectStatus" DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'CLOSED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company_Campaign" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collector_agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "project_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collector_agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection_data" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_data" JSONB DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "farmer_name" TEXT NOT NULL,
    "farmer_contact" TEXT NOT NULL,
    "council" TEXT NOT NULL,
    "farmer_ID_card_number" TEXT NOT NULL,
    "inspection_date" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "certification_year" TEXT NOT NULL,
    "inspector_name" TEXT NOT NULL,
    "inspector_contact" TEXT NOT NULL,
    "weed_application" TEXT NOT NULL,
    "weed_application_quantity" INTEGER NOT NULL,
    "pesticide_used" TEXT NOT NULL,
    "status" "SubscriptionStatus" DEFAULT 'ACTIVE',
    "pesticide_quantity" INTEGER NOT NULL,
    "farmer_photos" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "location" JSONB DEFAULT '{}',
    "farmer_id" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "plantation_creation_date" TIMESTAMP(3) NOT NULL,
    "farm_image_url" TEXT,
    "estimate_area" DOUBLE PRECISION NOT NULL,
    "plantation_photos" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm_coordinates" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "coordinates" JSONB DEFAULT '{}',
    "collector_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_coordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance_sheet" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "modules" TEXT[],
    "trainers" JSONB NOT NULL DEFAULT '[{}]',
    "location" TEXT NOT NULL,
    "report_url" TEXT NOT NULL,
    "photos" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "training_id" TEXT NOT NULL,

    CONSTRAINT "Attendance_sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participants" (
    "id" TEXT NOT NULL,
    "attendence_sheet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "village" TEXT NOT NULL,

    CONSTRAINT "Participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "modules" TEXT[],
    "start_date" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL,
    "draft_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "payment_mode" TEXT NOT NULL,
    "last_notification_date" TIMESTAMP(3),
    "payment_id" TEXT DEFAULT '',
    "grace_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price_plan" (
    "id" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'OFF',
    "price" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "product_name" "ProductName" NOT NULL DEFAULT 'BRONZE',
    "price_type" TEXT NOT NULL DEFAULT 'Fixed pricing',
    "plan_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'ANNUAL',
    "number_of_billing_cycles" TEXT DEFAULT 'Unlimited',
    "auto_renewal" BOOLEAN,
    "cancellation_policy" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price_of_theday" INTEGER NOT NULL,
    "supplier" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "type_of_market" "MarketType" NOT NULL DEFAULT 'COCOA',
    "bordereau_vente_url" TEXT,
    "bon_entree_magazin_url" TEXT,
    "accompanying_url" TEXT,
    "transmission_url" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'OPEN',
    "code" TEXT,
    "product_quantity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" TEXT NOT NULL,
    "humidity" TEXT NOT NULL,
    "net_weight" INTEGER NOT NULL,
    "agent_name" TEXT NOT NULL,
    "refraction" TEXT NOT NULL,
    "price_per_kg" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "salePhotoUrl" TEXT[],
    "agent_signature" TEXT NOT NULL,
    "farmer_signature" TEXT NOT NULL,
    "gpsLocation" JSONB NOT NULL,
    "product_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "market_number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "level_of_traceability" TEXT NOT NULL,
    "driver_name" TEXT,
    "humidity" INTEGER NOT NULL,
    "net_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vehicule_immatriculation_number" TEXT,
    "number_of_bags" INTEGER,
    "number_of_bags_for_transmission" INTEGER,
    "sender_name" TEXT,
    "receiver_name" TEXT,
    "sender_signature" TEXT,
    "driver_signature" TEXT,
    "product_quality" TEXT,
    "number_of_receipts" TEXT,
    "upload_status" TEXT,
    "min_com_sig" TEXT,
    "minister_agent_name" TEXT,
    "date_transmission" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agriculture" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "activity_title" TEXT NOT NULL,
    "pictures_url" TEXT[],
    "documents_url" TEXT[],
    "pv_url" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agriculture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Social" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "activity_title" TEXT NOT NULL,
    "pictures_url" TEXT[],
    "documents_url" TEXT[],
    "pv_url" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "activity_title" TEXT NOT NULL,
    "pictures_url" TEXT[],
    "documents_url" TEXT[],
    "pv_url" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenuEtResponsabilitePartager" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "agreement_pv" TEXT[],
    "proof_of_expenses" TEXT[],
    "proof_of_paiement" TEXT[],
    "pv_url" TEXT[],
    "first_buyer_proof" TEXT[],
    "producer_payment_proof" TEXT[],
    "management_plan" TEXT[],
    "type" "IncomeAndShareResponsabilityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenuEtResponsabilitePartager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_email_phone_number_idx" ON "User"("id", "email", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_id_status_email_idx" ON "Company"("id", "status", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_agentCode_key" ON "Assignee"("agentCode");

-- CreateIndex
CREATE INDEX "Assignee_id_projectCodes_company_id_idx" ON "Assignee"("id", "projectCodes", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_id_company_id_start_date_end_date_sector_activity_t_idx" ON "Project"("id", "company_id", "start_date", "end_date", "sector_activity", "type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "Campaign"("name");

-- CreateIndex
CREATE INDEX "Campaign_id_start_date_end_date_status_idx" ON "Campaign"("id", "start_date", "end_date", "status");

-- CreateIndex
CREATE INDEX "Inspection_data_project_id_idx" ON "Inspection_data"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_farmer_ID_card_number_key" ON "Farmer"("farmer_ID_card_number");

-- CreateIndex
CREATE INDEX "Farmer_id_farmer_ID_card_number_farmer_contact_council_idx" ON "Farmer"("id", "farmer_ID_card_number", "farmer_contact", "council");

-- CreateIndex
CREATE INDEX "Farm_farmer_id_location_idx" ON "Farm"("farmer_id", "location");

-- CreateIndex
CREATE INDEX "Farm_coordinates_farm_id_idx" ON "Farm_coordinates"("farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "Training_code_key" ON "Training"("code");

-- CreateIndex
CREATE INDEX "Training_company_id_start_date_end_date_title_id_idx" ON "Training"("company_id", "start_date", "end_date", "title", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_payment_id_key" ON "Subscription"("payment_id");

-- CreateIndex
CREATE INDEX "Subscription_company_id_plan_id_status_id_idx" ON "Subscription"("company_id", "plan_id", "status", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Price_plan_plan_name_key" ON "Price_plan"("plan_name");

-- CreateIndex
CREATE INDEX "Price_plan_id_plan_name_idx" ON "Price_plan"("id", "plan_name");

-- CreateIndex
CREATE UNIQUE INDEX "Market_code_key" ON "Market"("code");

-- CreateIndex
CREATE INDEX "Market_company_id_start_date_end_date_code_status_idx" ON "Market"("company_id", "start_date", "end_date", "code", "status");

-- CreateIndex
CREATE INDEX "Receipt_market_id_farmer_id_date_id_idx" ON "Receipt"("market_id", "farmer_id", "date", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_market_number_key" ON "Transaction"("market_number");

-- CreateIndex
CREATE INDEX "Transaction_market_number_date_id_date_transmission_idx" ON "Transaction"("market_number", "date", "id", "date_transmission");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company_Campaign" ADD CONSTRAINT "Company_Campaign_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company_Campaign" ADD CONSTRAINT "Company_Campaign_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm_coordinates" ADD CONSTRAINT "Farm_coordinates_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance_sheet" ADD CONSTRAINT "Attendance_sheet_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_attendence_sheet_id_fkey" FOREIGN KEY ("attendence_sheet_id") REFERENCES "Attendance_sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Price_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_market_number_fkey" FOREIGN KEY ("market_number") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
