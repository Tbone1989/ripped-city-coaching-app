import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '../types.ts';

// Manually define Json type to circumvent potential import issues with some bundlers/TypeScript versions.
// The recursive definition was causing "Type instantiation is excessively deep" errors.
// Simplifying to `any` for the database boundary resolves the compiler issue.
type Json = any;

// By defining a specific 'ClientRow' for Supabase with 'Json' for complex types,
// we prevent the "type instantiation is excessively deep" error. The rest of the app
// can still use the fully-typed 'Client' interface by casting the results from Supabase.
export type ClientRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  goal: string;
  status: 'prospect' | 'active' | 'inactive';
  paymentStatus?: 'unpaid' | 'paid';
  profile: Json;
  intakeData: Json;
  progress: Json;
  generatedPlans: Json;
  payments: Json;
  communication: Json;
  bloodworkHistory: Json;
  clientTestimonials: Json;
  bloodDonationStatus: Json;
  holisticHealth: Json;
};

// Define explicit Insert and Update types to reduce TS compiler complexity
export type ClientInsert = Omit<ClientRow, 'id' | 'created_at'>;
export type ClientUpdate = Partial<Omit<ClientRow, 'id' | 'created_at'>>;


export type Database = {
  public: {
    Tables: {
      clients: {
        Row: ClientRow;
        Insert: ClientInsert;
        Update: ClientUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// The Supabase URL and Key MUST be obtained exclusively from environment variables.
// The app's execution environment is responsible for providing these.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Conditionally initialize Supabase client to prevent crash when env vars are missing
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null;
