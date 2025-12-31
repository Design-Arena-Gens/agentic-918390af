import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const OAuth2 = google.auth.OAuth2

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if YouTube credentials are configured
    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        error: 'YouTube API credentials not configured',
        message: 'Please set up YouTube API credentials in environment variables',
        demoMode: true,
        youtubeId: 'DEMO_' + Math.random().toString(36).substring(7),
      })
    }

    // Create OAuth2 client
    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    // Initialize YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    })

    // In a real implementation, you would:
    // 1. Generate the actual video file (using FFmpeg, Canvas, etc.)
    // 2. Upload the video to YouTube using youtube.videos.insert()
    // 3. Return the actual YouTube video ID

    // For demo purposes, we simulate the upload
    const uploadResult = {
      youtubeId: 'SIMULATED_' + Math.random().toString(36).substring(7),
      url: 'https://youtube.com/watch?v=example',
      status: 'uploaded',
      message: 'Demo mode: Video would be uploaded to YouTube in production',
    }

    return NextResponse.json(uploadResult)
  } catch (error) {
    console.error('YouTube upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload to YouTube', details: String(error) },
      { status: 500 }
    )
  }
}

// Helper function to actually upload video (for production use)
async function uploadVideoToYouTube(
  youtube: any,
  videoFilePath: string,
  title: string,
  description: string
) {
  const fs = require('fs')

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title,
        description: description,
        tags: ['AI Generated', 'Faceless Video', 'Automated'],
        categoryId: '22', // People & Blogs
        defaultLanguage: 'hi',
        defaultAudioLanguage: 'hi',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoFilePath),
    },
  })

  return response.data
}
