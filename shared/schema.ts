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

export const chartSchema = z.object({
  id: z.string(),
  type: z.enum(['bar', 'line', 'pie']),
  dataRange: z.string(),
  labelRange: z.string().optional(),
  title: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })
});

export type Chart = z.infer<typeof chartSchema>;

export const spreadsheetSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  data: z.record(z.string(), z.record(z.string(), cellSchema)),
  _rowHeights: z.record(z.string(), z.number()).optional(),
  columnWidths: z.record(z.string(), z.number()).optional(),
  rowHeights: z.record(z.string(), z.number()).optional(),
  charts: z.array(chartSchema).optional(),
  lastModified: z.date().optional()
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