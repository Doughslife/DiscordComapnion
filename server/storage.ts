import { type User, type Command, type GuildSettings, type RoleAssignment, type InsertUser, type InsertCommand, type InsertGuildSettings, type InsertRoleAssignment } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(discordId: string, xp: number): Promise<User>;
  addWarning(discordId: string): Promise<User>;

  // Command operations
  getCommand(name: string): Promise<Command | undefined>;
  getAllCommands(): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  deleteCommand(name: string): Promise<void>;

  // Guild settings
  getGuildSettings(guildId: string): Promise<GuildSettings | undefined>;
  setGuildSettings(settings: InsertGuildSettings): Promise<GuildSettings>;

  // Role assignments
  createRoleAssignment(assignment: InsertRoleAssignment): Promise<RoleAssignment>;
  getRoleAssignments(guildId: string): Promise<RoleAssignment[]>;
  deleteRoleAssignment(id: number): Promise<void>;
  updateRoleAssignment(id: number, assignment: Partial<InsertRoleAssignment>): Promise<RoleAssignment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private commands: Map<string, Command>;
  private settings: Map<string, GuildSettings>;
  private roleAssignments: Map<number, RoleAssignment>;
  private currentIds: { users: number; commands: number; settings: number; roleAssignments: number };

  constructor() {
    this.users = new Map();
    this.commands = new Map();
    this.settings = new Map();
    this.roleAssignments = new Map();
    this.currentIds = { users: 1, commands: 1, settings: 1, roleAssignments: 1 };
  }

  async getUser(discordId: string): Promise<User | undefined> {
    return this.users.get(discordId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = {
      id,
      discordId: insertUser.discordId,
      level: insertUser.level ?? 0,
      xp: insertUser.xp ?? 0,
      warnings: insertUser.warnings ?? 0
    };
    this.users.set(user.discordId, user);
    return user;
  }

  async updateUserXP(discordId: string, xp: number): Promise<User> {
    const user = await this.getUser(discordId);
    if (!user) throw new Error("User not found");

    const newXP = user.xp + xp;
    const level = Math.floor(Math.sqrt(newXP) / 10);

    const updatedUser: User = {
      ...user,
      xp: newXP,
      level
    };

    this.users.set(discordId, updatedUser);
    return updatedUser;
  }

  async addWarning(discordId: string): Promise<User> {
    const user = await this.getUser(discordId);
    if (!user) throw new Error("User not found");

    const updatedUser: User = {
      ...user,
      warnings: user.warnings + 1
    };

    this.users.set(discordId, updatedUser);
    return updatedUser;
  }

  async getCommand(name: string): Promise<Command | undefined> {
    return this.commands.get(name);
  }

  async getAllCommands(): Promise<Command[]> {
    return Array.from(this.commands.values());
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = this.currentIds.commands++;
    const command: Command = { ...insertCommand, id };
    this.commands.set(command.name, command);
    return command;
  }

  async deleteCommand(name: string): Promise<void> {
    this.commands.delete(name);
  }

  async getGuildSettings(guildId: string): Promise<GuildSettings | undefined> {
    return this.settings.get(guildId);
  }

  async setGuildSettings(insertSettings: InsertGuildSettings): Promise<GuildSettings> {
    const id = this.currentIds.settings++;
    const settings: GuildSettings = {
      id,
      guildId: insertSettings.guildId,
      welcomeChannel: insertSettings.welcomeChannel ?? null,
      welcomeMessage: insertSettings.welcomeMessage ?? null,
      levelChannel: insertSettings.levelChannel ?? null,
      moderationEnabled: insertSettings.moderationEnabled ?? 1
    };
    this.settings.set(settings.guildId, settings);
    return settings;
  }

  // Role assignment methods
  async createRoleAssignment(insertAssignment: InsertRoleAssignment): Promise<RoleAssignment> {
    const id = this.currentIds.roleAssignments++;
    const assignment: RoleAssignment = {
      id,
      guildId: insertAssignment.guildId,
      roleId: insertAssignment.roleId,
      emoji: insertAssignment.emoji,
      description: insertAssignment.description,
      messageId: insertAssignment.messageId ?? null,
      channelId: insertAssignment.channelId ?? null
    };
    this.roleAssignments.set(id, assignment);
    return assignment;
  }

  async getRoleAssignments(guildId: string): Promise<RoleAssignment[]> {
    return Array.from(this.roleAssignments.values())
      .filter(assignment => assignment.guildId === guildId);
  }

  async deleteRoleAssignment(id: number): Promise<void> {
    this.roleAssignments.delete(id);
  }

  async updateRoleAssignment(id: number, updates: Partial<InsertRoleAssignment>): Promise<RoleAssignment> {
    const existing = this.roleAssignments.get(id);
    if (!existing) throw new Error("Role assignment not found");

    const updated: RoleAssignment = {
      ...existing,
      ...updates,
      id // Ensure ID doesn't change
    };

    this.roleAssignments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();