import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cellSchema = z.object({
  value: z.string().optional(),
  formula: z.string().optional(),
  type: z.enum(['text', 'number', 'date', 'boolean']).optional(),
  format: z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    fontSize: z.number().optional(),
    color: z.string().optional()
  }).optional()
});

export type Cell = z.infer<typeof cellSchema>;

export const spreadsheetSchema = z.object({
  id: z.number(),
  data: z.record(z.string(), z.record(z.string(), cellSchema)),
  columnWidths: z.record(z.string(), z.number()).optional(),
  rowHeights: z.record(z.string(), z.number()).optional()
});

export type Spreadsheet = z.infer<typeof spreadsheetSchema>;

export const spreadsheets = pgTable("spreadsheets", {
  id: serial("id").primaryKey(),
  data: jsonb("data").notNull().$type<Record<string, Record<string, Cell>>>(),
  columnWidths: jsonb("column_widths").$type<Record<string, number>>(),
  rowHeights: jsonb("row_heights").$type<Record<string, number>>()
});

export const insertSpreadsheetSchema = createInsertSchema(spreadsheets).pick({
  data: true,
  columnWidths: true,
  rowHeights: true
});

export type InsertSpreadsheet = z.infer<typeof insertSpreadsheetSchema>;
export type SpreadsheetSelect = typeof spreadsheets.$inferSelect;