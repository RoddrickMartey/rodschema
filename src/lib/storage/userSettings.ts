// src/lib/storage/userSettings.ts
import { UserSettingsSchema, type UserSettings } from "@/types/user.types"

const STORAGE_KEY = "rodschema:user-settings"

export const userSettingsStorage = {
  get(): UserSettings | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = UserSettingsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  },
  set(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
