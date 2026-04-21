/*
  Warnings:

  - A unique constraint covering the columns `[news_id,user_id]` on the table `complaints` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "location_coords_idx";

-- CreateIndex
CREATE UNIQUE INDEX "complaints_news_id_user_id_key" ON "complaints"("news_id", "user_id");
