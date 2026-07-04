-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "billNumber" TEXT,
    "year" INTEGER,
    "house" TEXT,
    "ministry" TEXT,
    "status" TEXT,
    "introducedDate" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "rawSourceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillVersion" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "versionDate" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "textContent" TEXT,
    "source" TEXT NOT NULL,
    "rawSourceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillStage" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "house" TEXT,
    "stageDate" TIMESTAMP(3),
    "description" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "house" TEXT,
    "party" TEXT,
    "state" TEXT,
    "constituency" TEXT,
    "source" TEXT NOT NULL,
    "rawSourceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MpActivity" (
    "id" TEXT NOT NULL,
    "mpId" TEXT NOT NULL,
    "billId" TEXT,
    "activityType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "rawSourceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bill_year_idx" ON "Bill"("year");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_house_idx" ON "Bill"("house");

-- CreateIndex
CREATE INDEX "BillVersion_billId_idx" ON "BillVersion"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "BillVersion_billId_versionLabel_key" ON "BillVersion"("billId", "versionLabel");

-- CreateIndex
CREATE INDEX "BillStage_billId_idx" ON "BillStage"("billId");

-- CreateIndex
CREATE INDEX "BillStage_stageDate_idx" ON "BillStage"("stageDate");

-- CreateIndex
CREATE UNIQUE INDEX "BillStage_billId_stage_stageDate_key" ON "BillStage"("billId", "stage", "stageDate");

-- CreateIndex
CREATE INDEX "Mp_name_idx" ON "Mp"("name");

-- CreateIndex
CREATE INDEX "Mp_party_idx" ON "Mp"("party");

-- CreateIndex
CREATE INDEX "Mp_state_idx" ON "Mp"("state");

-- CreateIndex
CREATE INDEX "MpActivity_mpId_idx" ON "MpActivity"("mpId");

-- CreateIndex
CREATE INDEX "MpActivity_billId_idx" ON "MpActivity"("billId");

-- CreateIndex
CREATE INDEX "MpActivity_activityType_idx" ON "MpActivity"("activityType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Follow_billId_idx" ON "Follow"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_billId_key" ON "Follow"("userId", "billId");

-- AddForeignKey
ALTER TABLE "BillVersion" ADD CONSTRAINT "BillVersion_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillStage" ADD CONSTRAINT "BillStage_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpActivity" ADD CONSTRAINT "MpActivity_mpId_fkey" FOREIGN KEY ("mpId") REFERENCES "Mp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpActivity" ADD CONSTRAINT "MpActivity_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
