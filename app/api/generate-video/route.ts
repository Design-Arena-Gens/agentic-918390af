import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

export async function POST(request: NextRequest) {
  try {
    const { topic, videoStyle } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Generate video script using OpenAI
    const scriptPrompt = getScriptPrompt(topic, videoStyle)

    let videoScript = ''
    let videoTitle = ''
    let videoDescription = ''

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative video script writer for YouTube faceless videos. Generate engaging, informative content in Hindi/Hinglish.'
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      })

      const content = completion.choices[0].message.content || ''

      // Parse the response
      const lines = content.split('\n')
      videoTitle = lines.find(l => l.includes('शीर्षक:') || l.includes('Title:'))?.split(':')[1]?.trim() || topic
      videoDescription = lines.find(l => l.includes('विवरण:') || l.includes('Description:'))?.split(':')[1]?.trim() || `${topic} के बारे में वीडियो`

      // Get script content (everything after the metadata)
      const scriptStart = content.indexOf('स्क्रिप्ट:') || content.indexOf('Script:')
      videoScript = scriptStart > -1 ? content.substring(scriptStart).split(':')[1].trim() : content

    } catch (apiError) {
      console.warn('OpenAI API not configured, using demo content')
      // Demo fallback
      videoTitle = `${topic} - जानिए रोचक जानकारी`
      videoDescription = `इस वीडियो में हम ${topic} के बारे में दिलचस्प जानकारी देंगे।`
      videoScript = `नमस्कार दोस्तों! आज हम बात करेंगे ${topic} के बारे में। यह एक बहुत ही रोचक विषय है। इस वीडियो में हम इसके बारे में विस्तार से जानेंगे। तो चलिए शुरू करते हैं!`
    }

    // Generate audio using TTS (text-to-speech)
    // In production, you would use a service like ElevenLabs, Google TTS, or Azure TTS
    // For demo purposes, we'll simulate this

    // Create video metadata
    const videoId = `video_${Date.now()}`
    const videoData = {
      id: videoId,
      title: videoTitle,
      description: videoDescription,
      script: videoScript,
      style: videoStyle,
      duration: '2:30',
      status: 'generated',
      createdAt: new Date().toISOString(),
      thumbnail: '/placeholder-thumbnail.jpg',
    }

    return NextResponse.json(videoData)
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    )
  }
}

function getScriptPrompt(topic: string, style: string): string {
  const stylePrompts: Record<string, string> = {
    facts: 'रोचक तथ्यों के साथ एक जानकारीपूर्ण स्क्रिप्ट बनाएं',
    story: 'एक आकर्षक कहानी के रूप में स्क्रिप्ट लिखें',
    motivation: 'प्रेरणादायक और उत्साहवर्धक स्क्रिप्ट तैयार करें',
    educational: 'शैक्षिक और सीखने योग्य सामग्री के साथ स्क्रिप्ट बनाएं',
    entertainment: 'मनोरंजक और आकर्षक स्क्रिप्ट लिखें',
  }

  return `
विषय: ${topic}
स्टाइल: ${stylePrompts[style] || stylePrompts.facts}

कृपया एक YouTube faceless video के लिए 2-3 मिनट की स्क्रिप्ट बनाएं। निम्नलिखित प्रारूप में दें:

शीर्षक: [एक आकर्षक शीर्षक]
विवरण: [वीडियो का संक्षिप्त विवरण]
स्क्रिप्ट: [पूरी वीडियो स्क्रिप्ट हिंदी/हिंग्लिश में]

स्क्रिप्ट engaging, informative और दर्शकों को engaged रखने वाली होनी चाहिए।
  `
}
