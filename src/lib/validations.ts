import { z } from 'zod'

export const shoppingItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
})

export const shoppingItemUpdateSchema = z.object({
  checked: z.boolean(),
})

export const choreSchema = z.object({
  title: z.string().min(1).max(200),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

export const choreUpdateSchema = z.object({
  completed: z.boolean(),
})

export const deviceStatusSchema = z.object({
  status: z.enum(['on', 'off', 'locked']),
})

export const deviceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  room: z.string().min(1).max(100),
  status: z.enum(['on', 'off', 'locked']).default('off'),
  value: z.number().int().min(0).max(100).default(0),
  online: z.boolean().default(false),
})
