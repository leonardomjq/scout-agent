import { z } from "zod";

export const BookmarkSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  card_id: z.string(),
  created_at: z.string().datetime(),
});
