import { z } from "zod"

const userStatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("invited"),
  z.literal("suspended"),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal("ADMIN"),
  z.literal("USER")
])

const userSchema = z.object({
  id: z.coerce.number(),
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string(),
  role: userRoleSchema,

  // Optional legacy fields to keep template components working
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  status: userStatusSchema.optional(),
  createdAt: z.coerce.date().optional(),
  lastLoginAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
