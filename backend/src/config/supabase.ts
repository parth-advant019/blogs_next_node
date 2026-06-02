import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import dotenv from "dotenv";
dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: {
      transport: ws as any, // ← fixes the Node 20 WebSocket issue
    },
  },
);
