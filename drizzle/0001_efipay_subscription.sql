-- EfiPay es el único proveedor de suscripciones.
ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "efipay_subscription_id" text;

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_efipay_subscription_id_unique"
  ON "user_profiles" ("efipay_subscription_id");

ALTER TABLE "user_profiles"
  ALTER COLUMN "ai_conversions_limit" SET DEFAULT 0;

UPDATE "user_profiles"
SET "ai_conversions_limit" = 0
WHERE "plan" = 'starter';

ALTER TABLE "user_profiles"
  DROP COLUMN IF EXISTS "paypal_subscription_id";
