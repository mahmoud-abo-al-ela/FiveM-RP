import { z } from "zod";

// Database Types for Supabase
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface StoreItem {
  id: number;
  category: string;
  name: string;
  description: string | null;
  price: string;
  metadata: string | null;
  available: boolean;
  popular: boolean;
}

export interface ServerStatus {
  id: number;
  online: boolean;
  current_players: number;
  max_players: number;
  ping: number;
  updated_at: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  category: string;
  preview: string;
  content: string | null;
  published_at: string;
}

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertStoreItemSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  metadata: z.string().optional(),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
});

export const insertServerStatusSchema = z.object({
  online: z.boolean().default(true),
  current_players: z.number().default(0),
  max_players: z.number().default(200),
  ping: z.number().default(0),
});

export const insertNewsArticleSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  preview: z.string().min(1),
  content: z.string().optional(),
});

// Insert Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;
export type InsertServerStatus = z.infer<typeof insertServerStatusSchema>;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
