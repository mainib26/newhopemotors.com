import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SYSTEM_PROMPT, saveConversation } from '$lib/server/chat';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const { messages, sessionId } = await request.json();

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return json({ error: 'Messages required' }, { status: 400 });
	}

	// Cap at 50 messages per session
	if (messages.length > 50) {
		return json({
			response: "We've had a great conversation! For the best experience, please call us at (972) 767-8434 or visit us at 3343 FM 1827 in McKinney. We'd love to help you in person!"
		});
	}

	const apiKey = env.CLAUDE_API_KEY;
	if (!apiKey) {
		return json({
			response: "I'm having a technical issue right now. Please call us at (972) 767-8434 and we'll be happy to help!"
		});
	}

	try {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-haiku-4-5-20251001',
				max_tokens: 512,
				system: SYSTEM_PROMPT,
				messages: messages.slice(-20).map((m: any) => ({
					role: m.role,
					content: m.content
				}))
			})
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		const assistantMessage = data.content?.[0]?.text ?? "Sorry, I couldn't process that. Please try again or call us at (972) 767-8434!";

		// Save to DB in background
		const allMessages = [...messages, { role: 'assistant', content: assistantMessage }];
		saveConversation(sessionId || crypto.randomUUID(), allMessages).catch(console.error);

		return json({ response: assistantMessage });
	} catch (err) {
		console.error('Chat API error:', err);
		return json({
			response: "I'm having trouble right now. Please call us at (972) 767-8434 — our team is ready to help!"
		});
	}
};
