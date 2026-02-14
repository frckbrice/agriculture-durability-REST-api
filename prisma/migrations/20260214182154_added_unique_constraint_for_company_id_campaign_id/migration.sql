/*
  Warnings:

  - A unique constraint covering the columns `[company_id,campaign_id]` on the table `Company_Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_Campaign_company_id_campaign_id_key" ON "Company_Campaign"("company_id", "campaign_id");
