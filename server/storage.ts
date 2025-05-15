import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  messages, type Message, type InsertMessage,
  menuOptions, type MenuOption, type InsertMenuOption,
  settings, type Setting, type InsertSetting,
  defaultSettings, defaultMenuOptions
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact operations
  getContact(id: number): Promise<Contact | undefined>;
  getContactByPhoneNumber(phoneNumber: string): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  getExemptedContacts(): Promise<Contact[]>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByContactId(contactId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;

  // Menu option operations
  getMenuOption(id: number): Promise<MenuOption | undefined>;
  getAllMenuOptions(): Promise<MenuOption[]>;
  getTopLevelMenuOptions(): Promise<MenuOption[]>;
  getSubmenuOptions(parentId: number): Promise<MenuOption[]>;
  createMenuOption(menuOption: InsertMenuOption): Promise<MenuOption>;
  updateMenuOption(id: number, menuOption: Partial<InsertMenuOption>): Promise<MenuOption | undefined>;
  deleteMenuOption(id: number): Promise<boolean>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  
  // Initialize the database with default data
  initializeDefaultData(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private messages: Map<number, Message>;
  private menuOptions: Map<number, MenuOption>;
  private settings: Map<string, Setting>;
  
  private userCurrentId: number;
  private contactCurrentId: number;
  private messageCurrentId: number;
  private menuOptionCurrentId: number;
  private settingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.messages = new Map();
    this.menuOptions = new Map();
    this.settings = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.messageCurrentId = 1;
    this.menuOptionCurrentId = 1;
    this.settingCurrentId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contact operations
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactByPhoneNumber(phoneNumber: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      (contact) => contact.phoneNumber === phoneNumber,
    );
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, contactUpdate: Partial<InsertContact>): Promise<Contact | undefined> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) return undefined;
    
    const updatedContact: Contact = {
      ...existingContact,
      ...contactUpdate,
    };
    
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getExemptedContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.isExempted,
    );
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByContactId(contactId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.contactId === contactId,
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Menu option operations
  async getMenuOption(id: number): Promise<MenuOption | undefined> {
    return this.menuOptions.get(id);
  }

  async getAllMenuOptions(): Promise<MenuOption[]> {
    return Array.from(this.menuOptions.values());
  }

  async getTopLevelMenuOptions(): Promise<MenuOption[]> {
    return Array.from(this.menuOptions.values()).filter(
      (option) => !option.parentId,
    ).sort((a, b) => a.order - b.order);
  }

  async getSubmenuOptions(parentId: number): Promise<MenuOption[]> {
    return Array.from(this.menuOptions.values()).filter(
      (option) => option.parentId === parentId,
    ).sort((a, b) => a.order - b.order);
  }

  async createMenuOption(insertMenuOption: InsertMenuOption): Promise<MenuOption> {
    const id = this.menuOptionCurrentId++;
    const menuOption: MenuOption = {
      ...insertMenuOption,
      id,
    };
    this.menuOptions.set(id, menuOption);
    return menuOption;
  }

  async updateMenuOption(id: number, menuOptionUpdate: Partial<InsertMenuOption>): Promise<MenuOption | undefined> {
    const existingMenuOption = this.menuOptions.get(id);
    if (!existingMenuOption) return undefined;
    
    const updatedMenuOption: MenuOption = {
      ...existingMenuOption,
      ...menuOptionUpdate,
    };
    
    this.menuOptions.set(id, updatedMenuOption);
    return updatedMenuOption;
  }

  async deleteMenuOption(id: number): Promise<boolean> {
    return this.menuOptions.delete(id);
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const existingSetting = this.settings.get(key);
    if (!existingSetting) return undefined;
    
    const updatedSetting: Setting = {
      ...existingSetting,
      value,
    };
    
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Initialize default settings
    for (const setting of defaultSettings) {
      const id = this.settingCurrentId++;
      const newSetting: Setting = {
        ...setting,
        id,
      };
      this.settings.set(setting.key, newSetting);
    }

    // Initialize default menu options
    for (const option of defaultMenuOptions) {
      const id = this.menuOptionCurrentId++;
      const newOption: MenuOption = {
        ...option,
        id,
      };
      this.menuOptions.set(id, newOption);
    }
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from './DatabaseStorage';

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
