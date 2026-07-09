/*
  Warnings:

  - Added the required column `quiz` to the `GrammarConcept` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GrammarConcept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "simpleExplanation" TEXT NOT NULL,
    "visualExamples" JSONB NOT NULL,
    "quiz" JSONB NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrammarConcept_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GrammarConcept" ("code", "createdAt", "difficulty", "id", "languageId", "simpleExplanation", "title", "updatedAt", "visualExamples") SELECT "code", "createdAt", "difficulty", "id", "languageId", "simpleExplanation", "title", "updatedAt", "visualExamples" FROM "GrammarConcept";
DROP TABLE "GrammarConcept";
ALTER TABLE "new_GrammarConcept" RENAME TO "GrammarConcept";
CREATE UNIQUE INDEX "GrammarConcept_languageId_code_key" ON "GrammarConcept"("languageId", "code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
