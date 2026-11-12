// COMMUNITY TIER LIST — backed by Upstash Redis (needs a real shared store
// since votes have to aggregate across every user, not just one device).
//
// Setup (one-time):
//   npm install @upstash/redis
//   Vercel dashboard → your project → Storage → Create Database → Upstash
//   for Redis (Marketplace integration auto-sets the env vars below for you)
//   — or create a DB directly at upstash.com and paste the REST URL/token in
//   manually. Either way you need these two env vars in Vercel + .env.local:
//     UPSTASH_REDIS_REST_URL
//     UPSTASH_REDIS_REST_TOKEN
//
// Data shape: one Redis hash per character, e.g. "tier:Ryu" -> { S: '12', A: '4', ... }

import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TIERS = ['S', 'A', 'B', 'C', 'D'] as const
type Tier = (typeof TIERS)[number]

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function GET() {
  const redis = getRedis()
  if (!redis) return Response.json({ error: 'Tier list backend not configured yet — see INTEGRATION notes in route.ts' }, { status: 503 })
  try {
    const keys = await redis.keys('tier:*')
    const out: Record<string, Record<Tier, number>> = {}
    await Promise.all(keys.map(async (key) => {
      const character = key.replace('tier:', '')
      const hash = (await redis.hgetall(key)) as Record<string, string> | null
      out[character] = TIERS.reduce((acc, t) => ({ ...acc, [t]: Number(hash?.[t] || 0) }), {} as Record<Tier, number>)
    }))
    return Response.json({ votes: out })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const redis = getRedis()
  if (!redis) return Response.json({ error: 'Tier list backend not configured yet — see INTEGRATION notes in route.ts' }, { status: 503 })
  try {
    const { character, tier, prevTier } = await req.json()
    if (!character || !TIERS.includes(tier)) return Response.json({ error: 'bad request' }, { status: 400 })
    const key = `tier:${character}`
    await redis.hincrby(key, tier, 1)
    if (prevTier && TIERS.includes(prevTier) && prevTier !== tier) {
      await redis.hincrby(key, prevTier, -1)
    }
    const hash = (await redis.hgetall(key)) as Record<string, string> | null
    const counts = TIERS.reduce((acc, t) => ({ ...acc, [t]: Number(hash?.[t] || 0) }), {} as Record<Tier, number>)
    return Response.json({ character, counts })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}
