import { NextResponse } from 'next/server';

/**
 * NEXZZA Gaming Companion Route Handler
 * Calls Gemini 3 Flash to provide game tips, patch breakdowns, and tactical advice.
 */
export async function POST(req: Request) {
  try {
    const { prompt, gameName, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are NEXZZA AI, an elite esports analyst and gaming co-pilot.
Provide concise, tactical, high-impact answers formatted cleanly in markdown.
Game context: ${gameName || 'Competitive Gaming'}. ${context || ''}`;

    const apiKey = ""; // Populated automatically at runtime or configured in environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to retrieve tactical intel.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}