import { z } from 'zod';

export const pushEventSchema = z.object({
  title: z.string(),
  body: z.string(),
  url: z.string().optional(),
});

export const notificationEventSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z.object({
    url: z.string().optional(),
  }),
});
