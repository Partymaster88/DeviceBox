import { NextRequest, NextResponse } from 'next/server';
import { handleGitHubWebhook } from '@/lib/github-webhook';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256') || '';
    const event = request.headers.get('x-github-event') || '';
    const body = await request.text();
    const payload = JSON.parse(body);

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'GITHUB_WEBHOOK_SECRET nicht konfiguriert' },
        { status: 500 }
      );
    }

    const result = await handleGitHubWebhook(
      event,
      payload,
      signature,
      secret
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('GitHub Webhook Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

