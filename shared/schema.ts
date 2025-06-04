import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Contacts schema for managing WhatsApp contacts
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  category: text("category").notNull().default("uncategorized"), // business, work, personal, uncategorized
  isExempted: integer("is_exempted", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  phoneNumber: true,
  category: true,
  isExempted: true,
});

// Messages schema for storing conversation history
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull(),
  content: text("content").notNull(),
  isFromContact: integer("is_from_contact", { mode: "boolean" }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).defaultNow(),
  isEncrypted: integer("is_encrypted", { mode: "boolean" }).notNull().default(false),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  contactId: true,
  content: true,
  isFromContact: true,
  isEncrypted: true,
});

// Menu options schema for customizable menu items
export const menuOptions = sqliteTable("menu_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // For nested menus
  responseText: text("response_text"),
  order: integer("order").notNull().default(0),
});

export const insertMenuOptionSchema = createInsertSchema(menuOptions).pick({
  title: true,
  description: true,
  parentId: true,
  responseText: true,
  order: true,
});

// Settings schema for app configuration
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  description: true,
});

// Default settings
export const defaultSettings = [
  {
    key: "ai_assistant_active",
    value: "true",
    description: "Whether the AI assistant is active"
  },
  {
    key: "encryption_enabled",
    value: "true",
    description: "Whether message encryption is enabled"
  },
  {
    key: "store_conversation_history",
    value: "true",
    description: "Whether to store conversation history"
  },
  {
    key: "form_link",
    value: "https://tally.so/r/w4q5Mo",
    description: "Link to the contact form"
  },
  {
    key: "assistant_name",
    value: "Maximus",
    description: "Name of the AI assistant"
  },
  {
    key: "nous_api_key",
    value: "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",
    description: "API key for Nous: DeepHermes 3 Mistral 24B"
  }
];

// Default menu options
export const defaultMenuOptions = [
  {
    title: "Business Inquiries",
    description: "Information about our business",
    responseText: "Great! I'd be happy to help with business inquiries. What specific information are you looking for?",
    order: 1
  },
  {
    title: "Work-Related Questions",
    description: "Questions about work",
    responseText: "Thank you for your work-related inquiry. Can you please provide more details about your question?",
    order: 2
  },
  {
    title: "Personal Contact",
    description: "Personal contact requests",
    responseText: "Thank you for your personal inquiry! To better assist you, could you please fill out this quick form about your request?",
    order: 3
  },
  {
    title: "Other",
    description: "Other questions",
    responseText: "Thank you for reaching out. Could you please provide more details about how I can help you?",
    order: 4
  },
  // Submenu for Business Inquiries
  {
    title: "Services offered",
    description: "Information about our services",
    parentId: 1,
    responseText: "We offer a range of services including consulting, development, and support. Would you like more specific information about any of these areas?",
    order: 1
  },
  {
    title: "Pricing information",
    description: "Information about our pricing",
    parentId: 1,
    responseText: "Our pricing varies depending on the specific service and requirements. I'd be happy to provide you with a customized quote based on your needs.",
    order: 2
  },
  {
    title: "Schedule a consultation",
    description: "Schedule a business consultation",
    parentId: 1,
    responseText: "I'd be happy to help you schedule a consultation. Please fill out this form with your availability and requirements.",
    order: 3
  },
  {
    title: "Other business question",
    description: "Other business questions",
    parentId: 1,
    responseText: "Please let me know what other business-related information you're looking for, and I'll do my best to assist you.",
    order: 4
  }
];

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type MenuOption = typeof menuOptions.$inferSelect;
export type InsertMenuOption = z.infer<typeof insertMenuOptionSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
