import { z } from 'zod';

export const pushSchema = z.object({
  title: z.string(),
  body: z.string(),
});
