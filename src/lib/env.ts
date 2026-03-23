import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(
        `Environment validation failed:\n${messages.join('\n')}`
      )
    }
    throw error
  }
}

export const env = validateEnv()
export type Env = z.infer<typeof envSchema>
