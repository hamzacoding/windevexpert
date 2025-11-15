import { NextRequest, NextResponse } from 'next/server'

// Simple SVG placeholder generator that works with Next/Image
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ width: string; height: string }> }
) {
  try {
    const { width, height } = await context.params
    const w = Math.max(1, Math.min(3000, parseInt(width, 10) || 400))
    const h = Math.max(1, Math.min(3000, parseInt(height, 10) || 250))

    const fontSize = Math.max(12, Math.floor(Math.min(w, h) / 8))
    const text = 'Image indisponible'

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ede7f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="#c7d2fe" stroke-width="2" rx="8" ry="8"/>
  <g fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif" text-anchor="middle">
    <text x="50%" y="50%" dominant-baseline="middle" font-size="${fontSize}">${text}</text>
  </g>
</svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Placeholder API error:', error)
    return NextResponse.json({ error: 'Failed to generate placeholder' }, { status: 500 })
  }
}