import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  role?: string;
  discordId?: string;
  discordUsername?: string;
  discordAvatar?: string;
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  in_game_name: string | null;
  playtime_hours: number;
  level: number;
  experience_points: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}
