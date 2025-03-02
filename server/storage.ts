import type { Spreadsheet, InsertSpreadsheet } from "@shared/schema";

export interface IStorage {
  getAllSpreadsheets(): Promise<Spreadsheet[]>;
  getSpreadsheet(id: number): Promise<Spreadsheet | undefined>;
  createSpreadsheet(spreadsheet: InsertSpreadsheet): Promise<Spreadsheet>;
  updateSpreadsheet(id: number, spreadsheet: Partial<Spreadsheet>): Promise<Spreadsheet>;
}

export class MemStorage implements IStorage {
  private spreadsheets: Map<number, Spreadsheet>;
  private currentId: number;

  constructor() {
    this.spreadsheets = new Map();
    this.currentId = 1;
  }
  
  async getAllSpreadsheets(): Promise<Spreadsheet[]> {
    return Array.from(this.spreadsheets.values());
  }

  async getSpreadsheet(id: number): Promise<Spreadsheet | undefined> {
    return this.spreadsheets.get(id);
  }

  async createSpreadsheet(spreadsheet: InsertSpreadsheet): Promise<Spreadsheet> {
    const id = this.currentId++;
    const newSpreadsheet: Spreadsheet = { id, ...spreadsheet };
    this.spreadsheets.set(id, newSpreadsheet);
    return newSpreadsheet;
  }

  async updateSpreadsheet(id: number, updates: Partial<Spreadsheet>): Promise<Spreadsheet> {
    const existing = this.spreadsheets.get(id);
    if (!existing) throw new Error('Spreadsheet not found');
    
    const updated = { ...existing, ...updates };
    this.spreadsheets.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
