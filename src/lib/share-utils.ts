import crypto from 'crypto'

export async function generateShareToken(clientId: string) {
  const secret = process.env.META_APP_SECRET || 'creova_secret_123'
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  const payload = `${expiresAt}.${clientId}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}.${signature}`).toString('base64')
}

export function verifyShareToken(token: string, clientId: string) {
  const secret = process.env.META_APP_SECRET || 'creova_secret_123'
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [expiresAt, cid, signature] = decoded.split('.')
    
    if (cid !== clientId) return false
    if (Date.now() > parseInt(expiresAt)) return false
    
    const payload = `${expiresAt}.${cid}`
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return signature === expectedSignature
  } catch (e) {
    return false
  }
}
