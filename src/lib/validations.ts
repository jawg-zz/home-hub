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
