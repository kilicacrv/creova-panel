import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const datePreset = searchParams.get('date_preset') || 'last_30d';
  const shareToken = searchParams.get('share_token');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
  }

  // 1. Authorization Check (Bypass if valid share_token)
  let isAuthorized = false;
  if (shareToken) {
    const { verifyShareToken } = await import('@/lib/share-utils');
    isAuthorized = verifyShareToken(shareToken, clientId);
  }

  if (!isAuthorized) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Check if user is admin or the client themselves
    const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'team' && profile?.client_id !== clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    // 1. Check Cache
    const { data: cacheData, error: cacheError } = await supabase
      .from('meta_cache')
      .select('*')
      .eq('client_id', clientId)
      .eq('date_preset', datePreset)
      .single();
      
    if (cacheError && cacheError.code !== 'PGRST116') {
      console.warn('Meta cache fetch error:', cacheError);
    }

    if (cacheData) {
      // TTL is 1 hour
      const isFresh = new Date(cacheData.updated_at).getTime() > Date.now() - 60 * 60 * 1000;
      if (isFresh) {
        return NextResponse.json({ data: cacheData.data, cached: true });
      }
    }

    // 2. Get Client Meta Info
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('meta_ad_account_id, meta_access_token')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const adAccountId = clientData.meta_ad_account_id;
    const accessToken = clientData.meta_access_token || process.env.META_SYSTEM_TOKEN;

    if (!adAccountId || !accessToken) {
      return NextResponse.json({ error: 'Meta account not connected', needs_oauth: true }, { status: 403 });
    }

    // Graph API expects ad account ID to be prefixed with 'act_'
    const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    // 3. Fetch from Meta API
    const baseUrl = `https://graph.facebook.com/v19.0/${accountId}/insights`;
    
    // Use Promise.all to fetch all data concurrently for speed
    const [summaryRes, dailyRes, campaignsRes, adsRes, demoRes, locRes] = await Promise.all([
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type&level=account`),
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=spend&time_increment=1&level=account`),
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=campaign_name,spend,status,impressions,clicks&level=campaign`),
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=ad_name,spend,actions&level=ad`),
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=reach&breakdowns=age,gender`),
      fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&fields=spend&breakdowns=region`)
    ]);

    const [summaryData, dailyData, campaignsData, adsData, demoData, locData] = await Promise.all([
      summaryRes.json(),
      dailyRes.json(),
      campaignsRes.json(),
      adsRes.json(),
      demoRes.json(),
      locRes.json()
    ]);

    // Check for Meta API errors
    if (summaryData.error) throw new Error(summaryData.error.message);

    // 4. Fetch Previous Period for Comparisons
    let previousSummary = {};
    try {
      const prevRes = await fetch(`${baseUrl}?access_token=${accessToken}&date_preset=${datePreset}&time_offset=1&fields=spend,impressions,reach,clicks,ctr,actions&level=account`);
      const prevData = await prevRes.json();
      previousSummary = prevData.data?.[0] || {};
    } catch (e) {
      console.warn('Failed to fetch previous period metrics');
    }

    const compiledData = {
      summary: summaryData.data?.[0] || {},
      previous_summary: previousSummary,
      daily: dailyData.data || [],
      campaigns: campaignsData.data || [],
      ads: adsData.data || [],
      demographics: demoData.data || [],
      locations: locData.data || []
    };

    // 5. Update Cache in Supabase
    await supabase
      .from('meta_cache')
      .upsert({
        client_id: clientId,
        date_preset: datePreset,
        data: compiledData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'client_id,date_preset' });

    return NextResponse.json({ data: compiledData, cached: false });

  } catch (error: any) {
    console.error('Meta API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
