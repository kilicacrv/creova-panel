import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // We embedded the client_id directly in the state param

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state parameters from Meta.' }, { status: 400 });
  }

  const clientId = state; 
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = new URL('/api/meta/callback', origin).toString();

  try {
    // 1. Exchange the short-lived Auth Code for a short-lived Access Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_APP_SECRET}&code=${code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived (60 days) token
    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    
    const longTokenRes = await fetch(longTokenUrl);
    const longTokenData = await longTokenRes.json();

    if (longTokenData.error) {
      throw new Error(longTokenData.error.message);
    }

    const longLivedToken = longTokenData.access_token;

    // 3. Save the token securely to Supabase under the respective Client
    const { error: dbError } = await supabase
      .from('clients')
      .update({ meta_access_token: longLivedToken })
      .eq('id', clientId);

    if (dbError) throw new Error(dbError.message);

    // 4. Redirect the user back to the Campaigns page natively
    return NextResponse.redirect(new URL('/admin/campaigns', origin));
  } catch (error: any) {
    console.error('Meta OAuth Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
