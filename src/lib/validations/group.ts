import { z } from 'zod';

export const createGroupFormSchema = z.object({
  name: z.string({ required_error: 'Musisz podać nazwę grupy' }).min(3, 'Minimalna długość to 3 znaki'),
});
