import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpreadsheetSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all spreadsheets (list)
  app.get('/api/spreadsheets', async (req, res) => {
    const spreadsheets = await storage.getAllSpreadsheets();
    res.json(spreadsheets.map(s => ({ id: s.id, name: s.name || `Spreadsheet ${s.id}` })));
  });
  
  app.get('/api/spreadsheets/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const spreadsheet = await storage.getSpreadsheet(id);
    
    if (!spreadsheet) {
      res.status(404).json({ message: 'Spreadsheet not found' });
      return;
    }
    
    res.json(spreadsheet);
  });

  app.post('/api/spreadsheets', async (req, res) => {
    const validation = insertSpreadsheetSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ message: 'Invalid spreadsheet data' });
      return;
    }
    
    const spreadsheet = await storage.createSpreadsheet(validation.data);
    res.status(201).json(spreadsheet);
  });

  app.patch('/api/spreadsheets/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const validation = insertSpreadsheetSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ message: 'Invalid update data' });
      return;
    }
    
    try {
      const spreadsheet = await storage.updateSpreadsheet(id, validation.data);
      res.json(spreadsheet);
    } catch (error) {
      res.status(404).json({ message: 'Spreadsheet not found' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
