import { 
  users, type User, type InsertUser,
  shows, type Show, type InsertShow,
  groups, type Group, type InsertGroup,
  calls, type Call, type InsertCall
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Show methods
  getShow(id: number): Promise<Show | undefined>;
  getShowsForUser(userId: number): Promise<Show[]>;
  createShow(show: InsertShow): Promise<Show>;
  updateShow(id: number, show: Partial<InsertShow>): Promise<Show | undefined>;
  deleteShow(id: number): Promise<boolean>;
  
  // Group methods
  getGroupsForShow(showId: number): Promise<Group[]>;
  getDefaultGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Call methods
  getCallsForShow(showId: number): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call | undefined>;
  deleteCall(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shows: Map<number, Show>;
  private groups: Map<number, Group>;
  private calls: Map<number, Call>;
  private userId: number;
  private showId: number;
  private groupId: number;
  private callId: number;

  constructor() {
    this.users = new Map();
    this.shows = new Map();
    this.groups = new Map();
    this.calls = new Map();
    this.userId = 1;
    this.showId = 1;
    this.groupId = 1;
    this.callId = 1;
    
    // Initialize default groups
    this.createDefaultGroups();
  }

  private createDefaultGroups() {
    const defaultGroups = [
      { name: "Cast", isCustom: 0, showId: null },
      { name: "Crew", isCustom: 0, showId: null }
    ];
    
    defaultGroups.forEach(group => {
      this.createGroup(group as InsertGroup);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Show methods
  async getShow(id: number): Promise<Show | undefined> {
    return this.shows.get(id);
  }

  async getShowsForUser(userId: number): Promise<Show[]> {
    return Array.from(this.shows.values()).filter(
      (show) => show.userId === userId
    );
  }

  async createShow(insertShow: InsertShow): Promise<Show> {
    const id = this.showId++;
    // Make sure description is null if undefined
    const description = insertShow.description === undefined ? null : insertShow.description;
    const show: Show = { 
      ...insertShow, 
      id,
      description 
    };
    this.shows.set(id, show);
    
    // Add default "Crew" group for the show
    await this.createGroup({ name: "Crew", isCustom: 1, showId: id });
    
    return show;
  }

  async updateShow(
    id: number,
    updates: Partial<InsertShow>
  ): Promise<Show | undefined> {
    const show = this.shows.get(id);
    if (!show) return undefined;

    const updatedShow = { ...show, ...updates };
    this.shows.set(id, updatedShow);
    return updatedShow;
  }

  async deleteShow(id: number): Promise<boolean> {
    // Delete associated calls first
    const callsToDelete = Array.from(this.calls.values()).filter(
      (call) => call.showId === id
    );
    callsToDelete.forEach((call) => this.calls.delete(call.id));
    
    // Delete associated custom groups
    const groupsToDelete = Array.from(this.groups.values()).filter(
      (group) => group.showId === id
    );
    groupsToDelete.forEach((group) => this.groups.delete(group.id));
    
    return this.shows.delete(id);
  }

  // Group methods
  async getGroupsForShow(showId: number): Promise<Group[]> {
    // Return default groups and custom groups for this show
    return Array.from(this.groups.values()).filter(
      (group) => group.isCustom === 0 || group.showId === showId
    );
  }

  async getDefaultGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(
      (group) => group.isCustom === 0
    );
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.groupId++;
    // Make sure showId is null if undefined
    const showId = insertGroup.showId === undefined ? null : insertGroup.showId;
    const group: Group = { 
      ...insertGroup, 
      id,
      showId
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(
    id: number,
    updates: Partial<InsertGroup>
  ): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;

    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    const group = this.groups.get(id);
    if (!group) return false;
    
    // Only allow deletion of custom groups
    if (group.isCustom === 0) return false;
    
    // Update any calls using this group to use the "Cast" group
    const castGroup = Array.from(this.groups.values()).find(
      (g) => g.name === "Cast" && g.isCustom === 0
    );
    
    if (castGroup) {
      // Update calls that have this group in their groupIds
      Array.from(this.calls.values()).forEach((call) => {
        // Parse groupIds if it's a string
        const groupIdsArray = typeof call.groupIds === 'string' 
          ? JSON.parse(call.groupIds) as number[] 
          : call.groupIds;
        
        // Check if this group is in the array
        if (groupIdsArray.includes(id)) {
          // Remove the group from the array and add the Cast group if not already there
          const updatedGroupIds = groupIdsArray
            .filter(gId => gId !== id)
            .concat(groupIdsArray.includes(castGroup.id) ? [] : [castGroup.id]);
          
          // Update the call
          this.calls.set(call.id, { 
            ...call, 
            groupIds: JSON.stringify(updatedGroupIds) 
          });
        }
      });
    }
    
    return this.groups.delete(id);
  }

  // Call methods
  async getCallsForShow(showId: number): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(
      (call) => call.showId === showId
    );
  }

  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.callId++;
    
    // Prepare the call data with proper handling of fields
    const processedCall = {
      ...insertCall,
      title: insertCall.title || 'Untitled Call',  // Default title if none provided
      description: insertCall.description || null, // Make sure description is null if not provided
      // groupIds is already handled by the schema transformation
    };
    
    const call: Call = { 
      id,
      title: processedCall.title,
      description: processedCall.description,
      minutesBefore: processedCall.minutesBefore,
      groupIds: processedCall.groupIds,
      showId: processedCall.showId,
      sendNotification: processedCall.sendNotification || 0
    };
    
    this.calls.set(id, call);
    return call;
  }

  async updateCall(
    id: number,
    updates: Partial<InsertCall>
  ): Promise<Call | undefined> {
    const call = this.calls.get(id);
    if (!call) return undefined;
    
    // Process updates with proper handling of fields
    const processedUpdates = { 
      // Handle description updates properly
      description: updates.description !== undefined ? updates.description || null : call.description,
      
      // Include other possible updates  
      title: updates.title !== undefined ? updates.title : call.title,
      minutesBefore: updates.minutesBefore !== undefined ? updates.minutesBefore : call.minutesBefore,
      showId: updates.showId !== undefined ? updates.showId : call.showId,
      
      // groupIds is already transformed by the schema if it's an array
      groupIds: updates.groupIds !== undefined ? updates.groupIds : call.groupIds,
      
      // Handle sendNotification
      sendNotification: updates.sendNotification !== undefined 
        ? (updates.sendNotification ? 1 : 0) 
        : call.sendNotification
    };

    const updatedCall: Call = {
      id,
      title: processedUpdates.title,
      description: processedUpdates.description,
      minutesBefore: processedUpdates.minutesBefore,
      groupIds: processedUpdates.groupIds,
      showId: processedUpdates.showId,
      sendNotification: processedUpdates.sendNotification
    };
    
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  async deleteCall(id: number): Promise<boolean> {
    return this.calls.delete(id);
  }
}

// Import database libraries
import { db } from "./db";
import { pool } from "./db";
import { eq, and, or } from "drizzle-orm";

// Keep the original IStorage interface without sessionStore
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Show methods
  getShow(id: number): Promise<Show | undefined>;
  getShowsForUser(userId: number): Promise<Show[]>;
  createShow(show: InsertShow): Promise<Show>;
  updateShow(id: number, show: Partial<InsertShow>): Promise<Show | undefined>;
  deleteShow(id: number): Promise<boolean>;
  
  // Group methods
  getGroupsForShow(showId: number): Promise<Group[]>;
  getDefaultGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Call methods
  getCallsForShow(showId: number): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call | undefined>;
  deleteCall(id: number): Promise<boolean>;
}

// Add the DatabaseStorage class implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default groups if they don't exist
    this.initializeDefaultGroups();
  }
  
  private async initializeDefaultGroups() {
    // Check if default groups exist
    const existingGroups = await db.select().from(groups).where(eq(groups.isCustom, 0));
    
    if (existingGroups.length === 0) {
      // Create default groups
      const defaultGroups = [
        { name: "Cast", isCustom: 0, showId: null },
        { name: "Crew", isCustom: 0, showId: null }
      ];
      
      for (const group of defaultGroups) {
        await db.insert(groups).values(group);
      }
    }
  }
  
  // User methods
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
  
  // Show methods
  async getShow(id: number): Promise<Show | undefined> {
    const [show] = await db.select().from(shows).where(eq(shows.id, id));
    return show;
  }
  
  async getShowsForUser(userId: number): Promise<Show[]> {
    return await db.select().from(shows).where(eq(shows.userId, userId));
  }
  
  async createShow(insertShow: InsertShow): Promise<Show> {
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Insert the show
      const [show] = await tx.insert(shows).values(insertShow).returning();
      
      // Add default show-specific group
      await tx.insert(groups).values({ name: "Crew", isCustom: 1, showId: show.id });
      
      return show;
    });
    
    return result;
  }
  
  async updateShow(id: number, updates: Partial<InsertShow>): Promise<Show | undefined> {
    const [updatedShow] = await db.update(shows)
      .set(updates)
      .where(eq(shows.id, id))
      .returning();
    
    return updatedShow;
  }
  
  async deleteShow(id: number): Promise<boolean> {
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Delete associated calls first
      await tx.delete(calls).where(eq(calls.showId, id));
      
      // Delete associated custom groups
      await tx.delete(groups).where(eq(groups.showId, id));
      
      // Delete the show
      const deleted = await tx.delete(shows).where(eq(shows.id, id)).returning();
      
      return deleted.length > 0;
    });
    
    return result;
  }
  
  // Group methods
  async getGroupsForShow(showId: number): Promise<Group[]> {
    // Return default groups (system-wide) and custom groups for this show
    return await db.select().from(groups).where(
      or(
        eq(groups.isCustom, 0),
        eq(groups.showId, showId)
      )
    );
  }
  
  async getDefaultGroups(): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.isCustom, 0));
  }
  
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(insertGroup).returning();
    return group;
  }
  
  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const [updatedGroup] = await db.update(groups)
      .set(updates)
      .where(eq(groups.id, id))
      .returning();
    
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Get the group
      const [group] = await tx.select().from(groups).where(eq(groups.id, id));
      
      // Only allow deletion of custom groups
      if (!group || group.isCustom === 0) {
        return false;
      }
      
      // Find the Cast group
      const [castGroup] = await tx.select().from(groups).where(
        and(
          eq(groups.name, "Cast"),
          eq(groups.isCustom, 0)
        )
      );
      
      // Update calls with this group
      if (castGroup) {
        // Get all calls that include this group
        const callsWithGroup = await tx.select().from(calls);
        
        // Update each call to replace the deleted group with the Cast group
        for (const call of callsWithGroup) {
          // Parse the groupIds string to an array
          const groupIds = JSON.parse(call.groupIds) as number[];
          
          if (groupIds.includes(id)) {
            // Remove the group being deleted
            const updatedGroupIds = groupIds
              .filter(gId => gId !== id)
              .concat(groupIds.includes(castGroup.id) ? [] : [castGroup.id]);
            
            // Update the call
            await tx.update(calls)
              .set({ groupIds: JSON.stringify(updatedGroupIds) })
              .where(eq(calls.id, call.id));
          }
        }
      }
      
      // Delete the group
      const deleted = await tx.delete(groups).where(eq(groups.id, id)).returning();
      
      return deleted.length > 0;
    });
    
    return result;
  }
  
  // Call methods
  async getCallsForShow(showId: number): Promise<Call[]> {
    return await db.select().from(calls).where(eq(calls.showId, showId));
  }
  
  async getCall(id: number): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call;
  }
  
  async createCall(insertCall: InsertCall): Promise<Call> {
    const [call] = await db.insert(calls).values(insertCall).returning();
    return call;
  }
  
  async updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const [updatedCall] = await db.update(calls)
      .set(updates)
      .where(eq(calls.id, id))
      .returning();
    
    return updatedCall;
  }
  
  async deleteCall(id: number): Promise<boolean> {
    const deleted = await db.delete(calls).where(eq(calls.id, id)).returning();
    return deleted.length > 0;
  }
}

// Initialize appropriate storage implementation
// For development testing, using MemStorage
// export const storage = new MemStorage();

// For production use with PostgreSQL database
export const storage = new DatabaseStorage();
