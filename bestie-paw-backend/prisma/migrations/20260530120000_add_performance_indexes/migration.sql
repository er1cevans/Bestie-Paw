-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "HealthRecord_petId_date_idx" ON "HealthRecord"("petId", "date");

-- CreateIndex
CREATE INDEX "Reminder_petId_dueDate_idx" ON "Reminder"("petId", "dueDate");

-- CreateIndex
CREATE INDEX "Reminder_notified_dueDate_idx" ON "Reminder"("notified", "dueDate");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

