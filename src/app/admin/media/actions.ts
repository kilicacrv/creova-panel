'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Admin permissions required' }
  }
  return { supabase, user }
}

export async function uploadMedia(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required' }

  const clientId = formData.get('client_id') as string
  const media_url = formData.get('media_url') as string
  const media_type = formData.get('media_type') as string
  const topicContext = formData.get('topic_context') as string

  const { error: insertError } = await supabase
    .from('media_production')
    .insert({
      client_id: clientId,
      editor_id: user.id,
      media_url,
      media_type,
      topic_context: topicContext,
      status: 'pending_admin'
    })

  if (insertError) return { error: insertError.message }
  revalidatePath('/team/media')
  revalidatePath('/admin/media')
  return { success: true }
}

export async function approveMedia(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  // 1. Get the media record
  const { data: media, error: fetchError } = await supabase
    .from('media_production')
    .select('*, clients(company_name)')
    .eq('id', id)
    .single()

  if (fetchError || !media) return { error: fetchError?.message || 'Media not found' }

  // 2. Call Gemini to generate a caption
  let generatedCaption = ''
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (apiKey) {
    try {
      const prompt = `You are a social media expert for an agency. 
We have a ${media.media_type} for our client "${(media.clients as any)?.company_name}".
The context/topic is: ${media.topic_context || 'General brand awareness'}.
Please generate 3 different engaging captions (Short, Medium, Long) with relevant hashtags.
Keep it professional yet engaging for a premium agency.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1000 }
        })
      })

      const data = await response.json()
      generatedCaption = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Caption generation failed.'
    } catch (e) {
      console.error('Gemini Error:', e)
      generatedCaption = 'AI Generation Error. Please write manually.'
    }
  } else {
    generatedCaption = '[Mock Caption] Gemini API Key missing. Please approve to see flow.'
  }

  // 3. Update status and caption
  const { error: updateError } = await supabase
    .from('media_production')
    .update({ 
      status: 'ready',
      generated_caption: generatedCaption,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) return { error: updateError.message }
  revalidatePath('/admin/media')
  return { success: true }
}

export async function rejectMedia(id: string, feedback: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error: updateError } = await supabase
    .from('media_production')
    .update({ 
      status: 'rejected',
      admin_feedback: feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) return { error: updateError.message }
  revalidatePath('/admin/media')
  return { success: true }
}

export async function cleanupMedia() {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { error: deleteError } = await supabase
    .from('media_production')
    .delete()
    .lt('created_at', sevenDaysAgo.toISOString())

  if (deleteError) return { error: deleteError.message }
  revalidatePath('/admin/media')
  return { success: true }
}

export async function deleteMediaItem(id: string, storagePath?: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  if (storagePath) {
    await supabase.storage.from('media-production').remove([storagePath])
  }

  const { error: deleteError } = await supabase
    .from('media_production')
    .delete()
    .eq('id', id)

  if (deleteError) return { error: deleteError.message }
  revalidatePath('/admin/media')
  return { success: true }
}
