import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Shows
export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertShowSchema = createInsertSchema(shows).omit({
  id: true,
});

export type InsertShow = z.infer<typeof insertShowSchema>;
export type Show = typeof shows.$inferSelect;

// Groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isCustom: integer("is_custom").notNull(),
  showId: integer("show_id"),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

// Calls
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  minutesBefore: integer("minutes_before").notNull(),
  groupIds: text("group_ids").notNull(), // Storing JSON array of group IDs as string
  showId: integer("show_id").notNull(),
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
});

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
