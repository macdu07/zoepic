CREATE TABLE IF NOT EXISTS "guest_conversion_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "guest_id" text NOT NULL,
  "file_count" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
