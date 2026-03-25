'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function uploadMedia(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const clientId = formData.get('client_id') as string
  const mediaUrl = formData.get('media_url') as string
  const mediaType = formData.get('media_type') as string
  const topicContext = formData.get('topic_context') as string

  const { error } = await supabase
    .from('media_production')
    .insert({
      client_id: clientId,
      editor_id: user.id,
      media_url,
      media_type,
      topic_context,
      status: 'pending_admin'
    })

  if (error) throw error
  revalidatePath('/team/media')
  revalidatePath('/admin/media')
}

export async function approveMedia(id: string) {
  const supabase = await createServerSupabaseClient()
  
  // 1. Get the media record
  const { data: media, error: fetchError } = await supabase
    .from('media_production')
    .select('*, clients(company_name)')
    .eq('id', id)
    .single()

  if (fetchError || !media) throw new Error('Media not found')

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

  if (updateError) throw updateError
  revalidatePath('/admin/media')
}

export async function rejectMedia(id: string, feedback: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('media_production')
    .update({ 
      status: 'rejected',
      admin_feedback: feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/media')
}

export async function cleanupMedia() {
  const supabase = await createServerSupabaseClient()
  
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  // Note: For real bucket cleanup, we would need to iterate and delete from storage too.
  // For now, we'll just delete the records. 
  // In a production app, we'd call supabase.storage.from('media-production').remove([list_of_paths])
  
  const { error } = await supabase
    .from('media_production')
    .delete()
    .lt('created_at', sevenDaysAgo.toISOString())

  if (error) throw error
  revalidatePath('/admin/media')
}

export async function deleteMediaItem(id: string, storagePath?: string) {
  const supabase = await createServerSupabaseClient()
  
  if (storagePath) {
    await supabase.storage.from('media-production').remove([storagePath])
  }

  const { error } = await supabase
    .from('media_production')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/media')
}
