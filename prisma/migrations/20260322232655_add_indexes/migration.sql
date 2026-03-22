-- CreateIndex
CREATE INDEX "Device_room_idx" ON "Device"("room");

-- CreateIndex
CREATE INDEX "Device_online_idx" ON "Device"("online");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "ShoppingItem_checked_idx" ON "ShoppingItem"("checked");

-- CreateIndex
CREATE INDEX "Chore_completed_idx" ON "Chore"("completed");

-- CreateIndex
CREATE INDEX "Chore_dueDate_idx" ON "Chore"("dueDate");
