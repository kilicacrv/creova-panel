'use server'

import { generateShareToken } from '@/lib/share-utils'

export async function getShareLink(clientId: string) {
  const token = await generateShareToken(clientId)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  return `${baseUrl}/share/ads/${clientId}?token=${token}`
}
