import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShowSchema, insertCallSchema, insertGroupSchema } from "@shared/schema";
import type { Call } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Shows routes
  app.get("/api/shows", async (req, res) => {
    // For now, we're assuming a default user ID of 1 since we don't have auth yet
    const userId = 1;
    const shows = await storage.getShowsForUser(userId);
    res.json(shows);
  });

  app.get("/api/shows/:id", async (req, res) => {
    const showId = parseInt(req.params.id);
    const show = await storage.getShow(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.json(show);
  });

  app.post("/api/shows", async (req, res) => {
    try {
      const userId = 1; // Default user ID
      
      // Parse the startTime string to Date if it's a string
      let formData = { ...req.body, userId };
      if (typeof formData.startTime === 'string') {
        formData.startTime = new Date(formData.startTime);
      }
      
      const showData = insertShowSchema.parse(formData);
      const show = await storage.createShow(showData);
      res.status(201).json(show);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/shows/:id", async (req, res) => {
    try {
      const showId = parseInt(req.params.id);
      const showData = insertShowSchema.omit({ userId: true }).partial().parse(req.body);
      const show = await storage.updateShow(showId, showData);
      if (!show) {
        return res.status(404).json({ message: "Show not found" });
      }
      res.json(show);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/shows/:id", async (req, res) => {
    const showId = parseInt(req.params.id);
    const deleted = await storage.deleteShow(showId);
    if (!deleted) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(204).send();
  });

  // Groups routes
  app.get("/api/groups", async (req, res) => {
    const defaultGroups = await storage.getDefaultGroups();
    res.json(defaultGroups);
  });

  app.get("/api/shows/:showId/groups", async (req, res) => {
    const showId = parseInt(req.params.showId);
    const groups = await storage.getGroupsForShow(showId);
    res.json(groups);
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/groups/:id", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const groupData = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(groupId, groupData);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    const groupId = parseInt(req.params.id);
    const deleted = await storage.deleteGroup(groupId);
    if (!deleted) {
      return res.status(404).json({ message: "Group not found or cannot be deleted" });
    }
    res.status(204).send();
  });

  // Calls routes
  app.get("/api/calls", async (req, res) => {
    // Get all calls for all shows
    const shows = await storage.getShowsForUser(1); // Default user ID
    let allCalls: Call[] = [];
    
    // Collect calls for each show
    for (const show of shows) {
      const calls = await storage.getCallsForShow(show.id);
      allCalls = [...allCalls, ...calls];
    }
    
    res.json(allCalls);
  });
  
  app.get("/api/shows/:showId/calls", async (req, res) => {
    const showId = parseInt(req.params.showId);
    const calls = await storage.getCallsForShow(showId);
    res.json(calls);
  });

  app.post("/api/calls", async (req, res) => {
    try {
      // Check if we have the new format with groupIds array
      if (Array.isArray(req.body.groupIds) && req.body.groupIds.length > 0) {
        // Handle multiple groupIds by creating a call for each group
        const { groupIds, ...callBase } = req.body;
        const createdCalls: Call[] = [];

        // Create a call for each selected group
        for (const groupId of groupIds) {
          const callData = insertCallSchema.parse({
            ...callBase,
            groupId: groupId
          });
          const call = await storage.createCall(callData);
          createdCalls.push(call);
        }
        
        // Return the first call as the primary response
        // The client can refetch to get all calls if needed
        res.status(201).json(createdCalls[0]);
      } else {
        // Original single group behavior
        const callData = insertCallSchema.parse(req.body);
        const call = await storage.createCall(callData);
        res.status(201).json(call);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/calls/:id", async (req, res) => {
    try {
      const callId = parseInt(req.params.id);
      const callData = insertCallSchema.partial().parse(req.body);
      const call = await storage.updateCall(callId, callData);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/calls/:id", async (req, res) => {
    const callId = parseInt(req.params.id);
    const deleted = await storage.deleteCall(callId);
    if (!deleted) {
      return res.status(404).json({ message: "Call not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
