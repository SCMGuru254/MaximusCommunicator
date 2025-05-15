import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  messages, type Message, type InsertMessage,
  menuOptions, type MenuOption, type InsertMenuOption,
  settings, type Setting, type InsertSetting,
  defaultSettings, defaultMenuOptions
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Contact operations
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async getContactByPhoneNumber(phoneNumber: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.phoneNumber, phoneNumber));
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, contactUpdate: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updatedContact] = await db.update(contacts)
      .set(contactUpdate)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getExemptedContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.isExempted, true));
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByContactId(contactId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.contactId, contactId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Menu option operations
  async getMenuOption(id: number): Promise<MenuOption | undefined> {
    const [menuOption] = await db.select().from(menuOptions).where(eq(menuOptions.id, id));
    return menuOption;
  }

  async getAllMenuOptions(): Promise<MenuOption[]> {
    return await db.select().from(menuOptions);
  }

  async getTopLevelMenuOptions(): Promise<MenuOption[]> {
    return await db.select().from(menuOptions).where(isNull(menuOptions.parentId));
  }

  async getSubmenuOptions(parentId: number): Promise<MenuOption[]> {
    return await db.select().from(menuOptions).where(eq(menuOptions.parentId, parentId));
  }

  async createMenuOption(insertMenuOption: InsertMenuOption): Promise<MenuOption> {
    const [menuOption] = await db.insert(menuOptions).values(insertMenuOption).returning();
    return menuOption;
  }

  async updateMenuOption(id: number, menuOptionUpdate: Partial<InsertMenuOption>): Promise<MenuOption | undefined> {
    const [updatedMenuOption] = await db.update(menuOptions)
      .set(menuOptionUpdate)
      .where(eq(menuOptions.id, id))
      .returning();
    return updatedMenuOption;
  }

  async deleteMenuOption(id: number): Promise<boolean> {
    const result = await db.delete(menuOptions).where(eq(menuOptions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    // Check if setting exists first
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db.update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();
      return updatedSetting;
    } else {
      // Create new setting
      const [newSetting] = await db.insert(settings)
        .values({ key, value })
        .returning();
      return newSetting;
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    try {
      // Check if settings already exist
      const existingSettings = await this.getAllSettings();
      if (existingSettings.length === 0) {
        // Insert default settings
        for (const setting of defaultSettings) {
          await db.insert(settings).values(setting);
        }
      }

      // Check if menu options already exist
      const existingMenuOptions = await this.getAllMenuOptions();
      if (existingMenuOptions.length === 0) {
        // Insert default menu options
        for (const option of defaultMenuOptions) {
          await db.insert(menuOptions).values(option);
        }
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
      throw error;
    }
  }
}