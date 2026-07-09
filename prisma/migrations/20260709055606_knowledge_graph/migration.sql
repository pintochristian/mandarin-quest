/*
  Warnings:

  - You are about to drop the `GrammarConcept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonVocabulary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VocabularyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `primaryGrammarConceptId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GrammarConcept_languageId_code_key";

-- DropIndex
DROP INDEX "LessonVocabulary_lessonId_vocabularyItemId_key";

-- DropIndex
DROP INDEX "ReviewItem_userId_itemType_itemId_key";

-- DropIndex
DROP INDEX "ReviewItem_userId_nextReviewAt_idx";

-- DropIndex
DROP INDEX "ReviewLog_reviewItemId_idx";

-- DropIndex
DROP INDEX "VocabularyItem_languageId_script_romanization_key";

-- DropIndex
DROP INDEX "VocabularyItem_languageId_frequencyRank_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GrammarConcept";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LessonVocabulary";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReviewItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReviewLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VocabularyItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "KnowledgeNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeNode_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NodeEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'PREREQUISITE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NodeEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NodeEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEACHES',
    "order" INTEGER NOT NULL,
    CONSTRAINT "LessonNode_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonNode_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNodeMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "masteryScore" REAL NOT NULL DEFAULT 0,
    "confidenceScore" REAL NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserNodeMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserNodeMastery_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNodeMasteryLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masteryId" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "responseTimeMs" INTEGER,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNodeMasteryLog_masteryId_fkey" FOREIGN KEY ("masteryId") REFERENCES "UserNodeMastery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MistakeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT,
    "exerciseId" TEXT,
    "mistakeType" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MistakeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MistakeLog_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MistakeLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dialogue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "situationTag" TEXT NOT NULL,
    "structureNodeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dialogue_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dialogue_structureNodeId_fkey" FOREIGN KEY ("structureNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dialogue" ("createdAt", "id", "lessonId", "situationTag", "title", "updatedAt") SELECT "createdAt", "id", "lessonId", "situationTag", "title", "updatedAt" FROM "Dialogue";
DROP TABLE "Dialogue";
ALTER TABLE "new_Dialogue" RENAME TO "Dialogue";
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "supportedModes" JSONB NOT NULL,
    "primaryNodeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exercise_primaryNodeId_fkey" FOREIGN KEY ("primaryNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("createdAt", "data", "id", "lessonId", "order", "prompt", "supportedModes", "type", "updatedAt") SELECT "createdAt", "data", "id", "lessonId", "order", "prompt", "supportedModes", "type", "updatedAt" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
CREATE UNIQUE INDEX "Exercise_lessonId_order_key" ON "Exercise"("lessonId", "order");
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "situationTag" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 18,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "outline" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("createdAt", "estimatedMinutes", "id", "index", "isPublished", "moduleId", "outline", "situationTag", "title", "updatedAt") SELECT "createdAt", "estimatedMinutes", "id", "index", "isPublished", "moduleId", "outline", "situationTag", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE UNIQUE INDEX "Lesson_moduleId_index_key" ON "Lesson"("moduleId", "index");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "KnowledgeNode_languageId_type_idx" ON "KnowledgeNode"("languageId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeNode_languageId_code_key" ON "KnowledgeNode"("languageId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "NodeEdge_fromNodeId_toNodeId_relation_key" ON "NodeEdge"("fromNodeId", "toNodeId", "relation");

-- CreateIndex
CREATE UNIQUE INDEX "LessonNode_lessonId_nodeId_role_key" ON "LessonNode"("lessonId", "nodeId", "role");

-- CreateIndex
CREATE INDEX "UserNodeMastery_userId_nextReviewAt_idx" ON "UserNodeMastery"("userId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserNodeMastery_userId_nodeId_key" ON "UserNodeMastery"("userId", "nodeId");

-- CreateIndex
CREATE INDEX "UserNodeMasteryLog_masteryId_idx" ON "UserNodeMasteryLog"("masteryId");

-- CreateIndex
CREATE INDEX "MistakeLog_userId_mistakeType_idx" ON "MistakeLog"("userId", "mistakeType");
