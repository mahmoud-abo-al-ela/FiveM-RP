"use client"

import { createClient } from "./supabase/client";

const supabase = createClient();
import type {
  User,
  StoreItem,
  ServerStatus,
  InsertUser,
  InsertStoreItem,
  InsertServerStatus,
} from "@/db/schema";

// Users
export const getUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*");
  
  if (error) throw error;
  return data as User[];
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as User;
};

export const createUser = async (user: InsertUser) => {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
};

// Store Items
export const getStoreItems = async () => {
  const { data, error } = await supabase
    .from("store_items")
    .select("*")
    .eq("available", true)
    .order("popular", { ascending: false });
  
  if (error) throw error;
  return data as StoreItem[];
};

export const getStoreItemsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from("store_items")
    .select("*")
    .eq("category", category)
    .eq("available", true);
  
  if (error) throw error;
  return data as StoreItem[];
};

export const createStoreItem = async (item: InsertStoreItem) => {
  const { data, error } = await supabase
    .from("store_items")
    .insert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data as StoreItem;
};

// Server Status
export const getServerStatus = async () => {
  const { data, error } = await supabase
    .from("server_status")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as ServerStatus;
};

export const updateServerStatus = async (status: InsertServerStatus) => {
  const { data, error } = await supabase
    .from("server_status")
    .insert(status)
    .select()
    .single();
  
  if (error) throw error;
  return data as ServerStatus;
};