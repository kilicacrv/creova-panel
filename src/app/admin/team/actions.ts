'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string

  const { error } = await supabase.from('profiles').update({
    full_name: fullName,
    role
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/team')
}
