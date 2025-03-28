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
      { name: "All", isCustom: 0, showId: null },
      { name: "Cast", isCustom: 0, showId: null },
      { name: "Crew", isCustom: 0, showId: null },
      { name: "Staff", isCustom: 0, showId: null },
      { name: "Guests", isCustom: 0, showId: null }
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
    
    // Update any calls using this group to use the "All" group
    const allGroup = Array.from(this.groups.values()).find(
      (g) => g.name === "All" && g.isCustom === 0
    );
    
    if (allGroup) {
      // Update calls that have this group in their groupIds
      Array.from(this.calls.values()).forEach((call) => {
        // Parse groupIds if it's a string
        const groupIdsArray = typeof call.groupIds === 'string' 
          ? JSON.parse(call.groupIds) as number[] 
          : call.groupIds;
        
        // Check if this group is in the array
        if (groupIdsArray.includes(id)) {
          // Remove the group from the array and add the All group if not already there
          const updatedGroupIds = groupIdsArray
            .filter(gId => gId !== id)
            .concat(groupIdsArray.includes(allGroup.id) ? [] : [allGroup.id]);
          
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
    
    // Ensure groupIds is stored as a string if it's an array
    const processedCall = {
      ...insertCall,
      groupIds: Array.isArray(insertCall.groupIds) 
        ? JSON.stringify(insertCall.groupIds) 
        : insertCall.groupIds
    };
    
    const call: Call = { ...processedCall, id };
    this.calls.set(id, call);
    return call;
  }

  async updateCall(
    id: number,
    updates: Partial<InsertCall>
  ): Promise<Call | undefined> {
    const call = this.calls.get(id);
    if (!call) return undefined;
    
    // Process groupIds if it's being updated
    const processedUpdates = { 
      ...updates,
      groupIds: updates.groupIds !== undefined 
        ? (Array.isArray(updates.groupIds) 
          ? JSON.stringify(updates.groupIds) 
          : updates.groupIds)
        : call.groupIds
    };

    const updatedCall = { ...call, ...processedUpdates };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  async deleteCall(id: number): Promise<boolean> {
    return this.calls.delete(id);
  }
}

export const storage = new MemStorage();
