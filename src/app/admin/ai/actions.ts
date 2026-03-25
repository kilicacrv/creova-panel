'use server'

export async function generateCopy(formData: FormData) {
  const prompt = formData.get('prompt') as string
  const type = formData.get('type') as string
  const tone = formData.get('tone') as string

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  const systemPrompt = `You are an expert agency copywriter. 
The user needs: ${type}.
The tone should be: ${tone}.
Generate High-converting, engaging, and professional copy based on their prompt.
Do not use generic intros. Output only the requested copy.`

  // If we have an API key, we call Google Gemini via fetch
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Input: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message)
      }

      // Gemini structure: data.candidates[0].content.parts[0].text
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated."
    } catch (e: any) {
      console.error('Gemini API Error:', e)
      return `Error generating copy with Gemini: ${e.message}`
    }
  }

  // Fallback Mock Mode
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return `[Mock Gemini AI Response - No GOOGLE_GENERATIVE_AI_API_KEY found]

Here is a brilliant piece of ${tone} ${type} for your campaign (Generated via Gemini Mock):

"🚀 Ready to scale your business to the next level with Gemini? 
We've partnered with industry leaders to bring you the best strategies for 2024. 
Don't get left behind—click the link in our bio to learn more! #Growth #AgencyLife"

(To see real Gemini generations, add GOOGLE_GENERATIVE_AI_API_KEY to your Vercel/local environment variables.)`
}
