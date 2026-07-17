// src/types/user.types.ts
import { z } from "zod"

export const UserSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
})
export type UserSettings = z.infer<typeof UserSettingsSchema>
