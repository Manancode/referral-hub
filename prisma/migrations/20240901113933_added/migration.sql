-- DropIndex
DROP INDEX "SearchQueue_userId_key";

-- AlterTable
ALTER TABLE "Search" ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "productIdea" TEXT,
ADD COLUMN     "status" TEXT;
