-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_news_id_fkey";

-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "news_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE SET NULL ON UPDATE CASCADE;
