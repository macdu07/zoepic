import { pgTable, text, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text('name').notNull(),
					email: text('email').notNull().unique(),
					emailVerified: boolean('emailVerified').notNull(),
					image: text('image'),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull()
				});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp('expiresAt').notNull(),
					token: text('token').notNull().unique(),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull(),
					ipAddress: text('ipAddress'),
					userAgent: text('userAgent'),
					userId: text('userId').notNull().references(()=> user.id)
				});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text('accountId').notNull(),
					providerId: text('providerId').notNull(),
					userId: text('userId').notNull().references(()=> user.id),
					accessToken: text('accessToken'),
					refreshToken: text('refreshToken'),
					idToken: text('idToken'),
					accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
					refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
					scope: text('scope'),
					password: text('password'),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull()
				});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text('identifier').notNull(),
					value: text('value').notNull(),
					expiresAt: timestamp('expiresAt').notNull(),
					createdAt: timestamp('createdAt'),
					updatedAt: timestamp('updatedAt')
				});

// Custom App Tables

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  plan: text("plan").notNull().default("starter"),
  aiConversionsUsed: integer("ai_conversions_used").notNull().default(0),
  aiConversionsLimit: integer("ai_conversions_limit").notNull().default(50),
  maxBatchSize: integer("max_batch_size").notNull().default(5),
  periodStart: timestamp("period_start").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paypalSubscriptionId: text("paypal_subscription_id"),
  subscriptionStatus: text("subscription_status")
});

export const conversionLogs = pgTable("conversion_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  fileCount: integer("file_count").notNull(),
  aiUsed: boolean("ai_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const guestConversionLogs = pgTable("guest_conversion_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: text("guest_id").notNull(),
  fileCount: integer("file_count").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
