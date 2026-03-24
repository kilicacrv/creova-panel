'use server'

export async function generateCopy(formData: FormData) {
  const prompt = formData.get('prompt') as string
  const type = formData.get('type') as string
  const tone = formData.get('tone') as string

  const apiKey = process.env.OPENAI_API_KEY
  
  const systemPrompt = `You are an expert agency copywriter. 
The user needs: ${type}.
The tone should be: ${tone}.
Generate High-converting, engaging, and professional copy based on their prompt.
Do not use generic intros. Output only the requested copy.`

  // If we have an API key, we call OpenAI directly via fetch
  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o', // or gpt-3.5-turbo
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        })
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message)
      }

      return data.choices[0].message.content
    } catch (e: any) {
      console.error('OpenAI API Error:', e)
      return `Error generating copy: ${e.message}`
    }
  }

  // Fallback Mock Mode
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return `[Mock AI Response - No OPENAI_API_KEY found in .env]

Here is a brilliant piece of ${tone} ${type} for your campaign:

"🚀 Ready to scale your business to the next level? 
We've partnered with industry leaders to bring you the best strategies for 2024. 
Don't get left behind—click the link in our bio to learn more! #Growth #AgencyLife"

(To see real AI generations, add OPENAI_API_KEY to your Vercel/local environment variables.)`
}
