'use client'

import { useState } from 'react'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [videoStyle, setVideoStyle] = useState('facts')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setMessage('कृपया एक विषय दर्ज करें')
      return
    }

    setLoading(true)
    setMessage('वीडियो बना रहे हैं...')

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, videoStyle }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('वीडियो सफलतापूर्वक बन गया!')
        setGeneratedVideos(prev => [data, ...prev])
        setTopic('')
      } else {
        setMessage(`त्रुटि: ${data.error}`)
      }
    } catch (error) {
      setMessage('वीडियो बनाने में त्रुटि हुई')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (videoId: string) => {
    setLoading(true)
    setMessage('YouTube पर अपलोड हो रहा है...')

    try {
      const response = await fetch('/api/upload-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`सफलतापूर्वक अपलोड हो गया! YouTube ID: ${data.youtubeId}`)
      } else {
        setMessage(`अपलोड त्रुटि: ${data.error}`)
      }
    } catch (error) {
      setMessage('YouTube पर अपलोड करने में त्रुटि')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 YouTube Faceless Video Agent
          </h1>
          <p className="text-xl text-gray-300">
            AI से अपने फेसलेस YouTube चैनल के लिए वीडियो बनाएं और अपलोड करें
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">नया वीडियो बनाएं</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-medium">विषय</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="जैसे: 'दिलचस्प विज्ञान तथ्य' या 'प्रेरणादायक कहानी'"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">वीडियो स्टाइल</label>
              <select
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="facts">तथ्य और जानकारी</option>
                <option value="story">कहानी</option>
                <option value="motivation">प्रेरणादायक</option>
                <option value="educational">शैक्षिक</option>
                <option value="entertainment">मनोरंजन</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {loading ? '⏳ प्रोसेसिंग...' : '🚀 वीडियो बनाएं'}
            </button>
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('त्रुटि') || message.includes('Error')
                ? 'bg-red-500/20 border border-red-500/50'
                : 'bg-green-500/20 border border-green-500/50'
            }`}>
              <p className="text-white text-center">{message}</p>
            </div>
          )}
        </div>

        {generatedVideos.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">तैयार वीडियो</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedVideos.map((video, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                  <p className="text-gray-300 mb-4 text-sm">{video.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="text-gray-400 text-sm">
                      <span className="font-medium">अवधि:</span> {video.duration}
                    </div>
                    <div className="text-gray-400 text-sm">
                      <span className="font-medium">स्टाइल:</span> {video.style}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpload(video.id)}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    📤 YouTube पर अपलोड करें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📋 सेटअप निर्देश</h3>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>1. <strong>YouTube API:</strong> Google Cloud Console से YouTube Data API v3 सक्षम करें</p>
            <p>2. <strong>OAuth Credentials:</strong> OAuth 2.0 credentials बनाएं और डाउनलोड करें</p>
            <p>3. <strong>Environment Variables:</strong> <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> में API keys सेट करें</p>
            <p>4. <strong>OpenAI API:</strong> content generation के लिए OpenAI API key चाहिए</p>
          </div>
        </div>
      </div>
    </main>
  )
}
