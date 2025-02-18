import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  level: integer("level").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  warnings: integer("warnings").notNull().default(0)
});

export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  response: text("response").notNull(),
  createdBy: text("created_by").notNull()
});

export const guildSettings = pgTable("guild_settings", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull().unique(),
  welcomeChannel: text("welcome_channel"),
  welcomeMessage: text("welcome_message"),
  levelChannel: text("level_channel"),
  moderationEnabled: integer("moderation_enabled").notNull().default(1)
});

export const insertUserSchema = createInsertSchema(users);
export const insertCommandSchema = createInsertSchema(commands);
export const insertGuildSettingsSchema = createInsertSchema(guildSettings);

export type User = typeof users.$inferSelect;
export type Command = typeof commands.$inferSelect;
export type GuildSettings = typeof guildSettings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type InsertGuildSettings = z.infer<typeof insertGuildSettingsSchema>;
