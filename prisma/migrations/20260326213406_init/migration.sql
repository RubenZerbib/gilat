-- CreateTable
CREATE TABLE "SignedForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "SignedForm_idNumber_idx" ON "SignedForm"("idNumber");

-- CreateIndex
CREATE INDEX "SignedForm_fullName_idx" ON "SignedForm"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
