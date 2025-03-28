import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShowSchema, insertCallSchema, insertGroupSchema } from "@shared/schema";
import type { Call } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // put application routes here
  // prefix all routes with /api

  // Shows routes
  app.get("/api/shows", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const shows = await storage.getShowsForUser(userId);
    res.json(shows);
  });

  app.get("/api/shows/:id", isAuthenticated, async (req, res) => {
    const showId = parseInt(req.params.id);
    const show = await storage.getShow(showId);
    
    // Check if show belongs to the authenticated user
    if (!show || show.userId !== req.user!.id) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.json(show);
  });

  app.post("/api/shows", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
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

  app.put("/api/shows/:id", isAuthenticated, async (req, res) => {
    try {
      const showId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify that this show belongs to the authenticated user
      const existingShow = await storage.getShow(showId);
      if (!existingShow || existingShow.userId !== userId) {
        return res.status(404).json({ message: "Show not found" });
      }
      
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
  
  // Add PATCH endpoint for partial updates (same implementation as PUT but follows RESTful conventions)
  app.patch("/api/shows/:id", isAuthenticated, async (req, res) => {
    try {
      const showId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify that this show belongs to the authenticated user
      const existingShow = await storage.getShow(showId);
      if (!existingShow || existingShow.userId !== userId) {
        return res.status(404).json({ message: "Show not found" });
      }
      
      // Process date string if needed
      let updateData = { ...req.body };
      if (typeof updateData.startTime === 'string') {
        updateData.startTime = new Date(updateData.startTime);
      }
      
      const showData = insertShowSchema.omit({ userId: true }).partial().parse(updateData);
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

  app.delete("/api/shows/:id", isAuthenticated, async (req, res) => {
    const showId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    // Verify that this show belongs to the authenticated user
    const existingShow = await storage.getShow(showId);
    if (!existingShow || existingShow.userId !== userId) {
      return res.status(404).json({ message: "Show not found" });
    }
    
    const deleted = await storage.deleteShow(showId);
    if (!deleted) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(204).send();
  });

  // Groups routes
  app.get("/api/groups", isAuthenticated, async (req, res) => {
    const defaultGroups = await storage.getDefaultGroups();
    res.json(defaultGroups);
  });

  app.get("/api/shows/:showId/groups", isAuthenticated, async (req, res) => {
    const showId = parseInt(req.params.showId);
    const userId = req.user!.id;
    
    // Verify that this show belongs to the authenticated user
    const existingShow = await storage.getShow(showId);
    if (!existingShow || existingShow.userId !== userId) {
      return res.status(404).json({ message: "Show not found" });
    }
    
    const groups = await storage.getGroupsForShow(showId);
    res.json(groups);
  });

  app.post("/api/groups", isAuthenticated, async (req, res) => {
    try {
      // If this is a show-specific group, verify user owns the show
      if (req.body.showId) {
        const showId = parseInt(req.body.showId);
        const userId = req.user!.id;
        
        const existingShow = await storage.getShow(showId);
        if (!existingShow || existingShow.userId !== userId) {
          return res.status(404).json({ message: "Show not found" });
        }
      }
      
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
  app.get("/api/calls", isAuthenticated, async (req, res) => {
    // Get all calls for all shows
    const userId = req.user!.id;
    const shows = await storage.getShowsForUser(userId);
    let allCalls: Call[] = [];
    
    // Collect calls for each show
    for (const show of shows) {
      const calls = await storage.getCallsForShow(show.id);
      allCalls = [...allCalls, ...calls];
    }
    
    res.json(allCalls);
  });
  
  app.get("/api/shows/:showId/calls", isAuthenticated, async (req, res) => {
    const showId = parseInt(req.params.showId);
    const userId = req.user!.id;
    
    // Verify that this show belongs to the authenticated user
    const existingShow = await storage.getShow(showId);
    if (!existingShow || existingShow.userId !== userId) {
      return res.status(404).json({ message: "Show not found" });
    }
    
    const calls = await storage.getCallsForShow(showId);
    res.json(calls);
  });

  app.post("/api/calls", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const showId = parseInt(req.body.showId);
      
      // Verify that this show belongs to the authenticated user
      const existingShow = await storage.getShow(showId);
      if (!existingShow || existingShow.userId !== userId) {
        return res.status(404).json({ message: "Show not found" });
      }
      
      // With our updated schema, we'll pass the groupIds directly
      // The storage layer will handle converting the array to a string
      const callData = insertCallSchema.parse(req.body);
      const call = await storage.createCall(callData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating call:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/calls/:id", isAuthenticated, async (req, res) => {
    try {
      const callId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // First, get the call to check what show it belongs to
      const existingCall = await storage.getCall(callId);
      if (!existingCall) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      // Then check if the user owns the show this call belongs to
      const existingShow = await storage.getShow(existingCall.showId);
      if (!existingShow || existingShow.userId !== userId) {
        return res.status(404).json({ message: "Call not found" });
      }
      
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

  app.delete("/api/calls/:id", isAuthenticated, async (req, res) => {
    const callId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    // First, get the call to check what show it belongs to
    const existingCall = await storage.getCall(callId);
    if (!existingCall) {
      return res.status(404).json({ message: "Call not found" });
    }
    
    // Then check if the user owns the show this call belongs to
    const existingShow = await storage.getShow(existingCall.showId);
    if (!existingShow || existingShow.userId !== userId) {
      return res.status(404).json({ message: "Call not found" });
    }
    
    const deleted = await storage.deleteCall(callId);
    if (!deleted) {
      return res.status(404).json({ message: "Call not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
