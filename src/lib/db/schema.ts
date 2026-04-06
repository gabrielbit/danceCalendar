import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  pgEnum,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "trusted", "admin"]);
export const eventStatusEnum = pgEnum("event_status", [
  "pending",
  "approved",
  "rejected",
]);
export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "none",
  "weekly",
  "biweekly",
  "monthly",
]);
export const modalityEnum = pgEnum("modality", [
  "presencial",
  "virtual",
  "hibrido",
]);

// Auth.js tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: userRoleEnum("role").default("user").notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  bio: text("bio"),
  instagram: varchar("instagram", { length: 100 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// App tables
export const categories = pgTable(
  "categories",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    color: varchar("color", { length: 7 }).notNull(), // hex color
    emoji: varchar("emoji", { length: 10 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("categories_slug_idx").on(table.slug)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    dateStart: timestamp("date_start", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    dateEnd: timestamp("date_end", { mode: "date", withTimezone: true }),
    location: text("location"),
    imageUrl: text("image_url"),
    price: text("price"),
    paymentInfo: text("payment_info"),
    instagram: varchar("instagram", { length: 100 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    website: varchar("website", { length: 255 }),
    modality: modalityEnum("modality").default("presencial").notNull(),
    recurrenceType: recurrenceTypeEnum("recurrence_type")
      .default("none")
      .notNull(),
    recurrenceParentId: uuid("recurrence_parent_id"),
    status: eventStatusEnum("status").default("pending").notNull(),
    rejectionReason: text("rejection_reason"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("events_date_start_idx").on(table.dateStart),
    index("events_status_idx").on(table.status),
    index("events_user_id_idx").on(table.userId),
  ]
);

export const eventCategories = pgTable(
  "event_categories",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.categoryId] }),
  ]
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
