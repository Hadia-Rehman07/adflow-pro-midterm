import { z } from 'zod';

export const adSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  category_id: z.string().uuid("Please select a valid category").optional(), // Making optional for simple testing
  city_id: z.string().uuid("Please select a valid city").optional(),
  package_id: z.string().uuid("Please select a package").optional(),
  media_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});
