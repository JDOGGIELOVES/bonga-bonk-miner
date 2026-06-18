import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, prompt, category, guidance, name } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid prompt (at least 10 characters).' },
        { status: 400 }
      );
    }

    // In production, you could:
    // - Send email via Resend / SendGrid
    // - Save to database (Supabase, Vercel Postgres, etc.)
    // - Add to a moderation queue
    console.log('New prompt submission received:', {
      title: title || 'Untitled',
      prompt: prompt.slice(0, 100) + '...',
      category: category || 'General',
      guidance: guidance || 'None',
      name: name || 'Anonymous',
      timestamp: new Date().toISOString(),
    });

    // For now, we just acknowledge it.
    // Future: You can manually review and add great ones to lib/prompts.ts or categoryContent.
    return NextResponse.json({
      success: true,
      message: 'Thanks for contributing! We review submissions regularly and will feature the best ones.',
    });
  } catch (error) {
    console.error('Submit prompt error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}
