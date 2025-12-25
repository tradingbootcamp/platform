-- Video library for uploaded videos
CREATE TABLE "video" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL UNIQUE,
    "original_name" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" INTEGER NOT NULL REFERENCES "account"("id"),
    "uploaded_at" TEXT NOT NULL DEFAULT (datetime('now'))
);
