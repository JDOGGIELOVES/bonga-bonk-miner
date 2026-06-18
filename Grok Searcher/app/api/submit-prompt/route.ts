import { NextResponse } from 'next/server';
import { Resend } from 'resend';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Simple in-memory rate limiting (resets on cold start in serverless)
const submissionTimes = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SUBMISSIONS_PER_WINDOW = 3;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Honeypot for spam
    const honeypot = formData.get('website') as string;
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Thanks!' }); // Silently accept
    }

    const title = formData.get('title') as string || 'Untitled';
    const prompt = formData.get('prompt') as string;
    const category = formData.get('category') as string || 'General';
    const guidance = formData.get('guidance') as string || '';
    const name = formData.get('name') as string || 'Anonymous';

    // Basic validation
    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid prompt (at least 10 characters).' },
        { status: 400 }
      );
    }

    // Rate limiting (based on IP or fallback)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastSubmission = submissionTimes.get(ip) || 0;

    if (now - lastSubmission < RATE_LIMIT_WINDOW) {
      const count = (submissionTimes.get(ip + '_count') || 0) + 1;
      submissionTimes.set(ip + '_count', count);
      if (count > MAX_SUBMISSIONS_PER_WINDOW) {
        return NextResponse.json(
          { error: 'Too many submissions. Please wait a minute and try again.' },
          { status: 429 }
        );
      }
    } else {
      submissionTimes.set(ip, now);
      submissionTimes.set(ip + '_count', 1);
    }

    // Handle optional file uploads (screenshots, prompt files)
    const files = formData.getAll('files') as File[];
    const attachments: Array<{ filename: string; content: Buffer }> = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        continue;
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // Send notification email via Resend (if configured)
    const emailTo = process.env.CONTACT_EMAIL || 'your-email@example.com';
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Grok Searcher <onboarding@resend.dev>',
          to: emailTo,
          subject: `New Prompt Submission: ${title}`,
          html: `
            <h2>New Grok Prompt Submission</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Submitted by:</strong> ${name}</p>
            <p><strong>Guidance:</strong> ${guidance || 'None provided'}</p>
            <h3>Prompt:</h3>
            <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${prompt}</pre>
            ${attachments.length > 0 ? `<p><strong>Attachments:</strong> ${attachments.map(a => a.filename).join(', ')}</p>` : ''}
            <p>Submitted at: ${new Date().toISOString()}</p>
          `,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      } catch (emailErr) {
        console.error('Resend email failed:', emailErr);
      }
    } else {
      console.log('RESEND_API_KEY not set — submission logged only (configure for email notifications)');
    }

    // Log for review
    console.log('New prompt submission:', {
      title,
      prompt: prompt.slice(0, 150) + (prompt.length > 150 ? '...' : ''),
      category,
      guidance,
      name,
      files: attachments.map(f => f.filename),
      timestamp: new Date().toISOString(),
    });

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
