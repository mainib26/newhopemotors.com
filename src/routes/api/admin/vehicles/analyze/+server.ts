import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

const ANALYSIS_PROMPT = `You are a vehicle identification expert. Analyze these vehicle photos and extract as much information as possible.

Look carefully for:
- VIN number (on windshield VIN plate, door jamb sticker, or any visible label)
- Year, Make, Model, Trim (from badges, emblems, body style)
- Body type (sedan, SUV, truck, wagon, coupe, convertible, van, hatchback)
- Exterior color and interior color
- Mileage (from odometer if visible)
- Engine and transmission info (from any visible stickers or badges)
- Drivetrain (AWD/4WD/FWD/RWD — from badges or stickers)
- Condition assessment based on visible wear, paint, interior state
- Notable features visible in photos (sunroof, leather seats, alloy wheels, backup camera, navigation, roof rack, tow package, etc.)

Return ONLY valid JSON with this exact structure (use null for fields you cannot determine):
{
  "vin": "string or null",
  "year": "number or null",
  "make": "string or null",
  "model": "string or null",
  "trim": "string or null",
  "bodyType": "SEDAN|SUV|TRUCK|WAGON|COUPE|CONVERTIBLE|VAN|HATCHBACK or null",
  "exteriorColor": "string or null",
  "interiorColor": "string or null",
  "mileage": "number or null",
  "engine": "string or null",
  "transmission": "AUTOMATIC|MANUAL|CVT or null",
  "drivetrain": "FWD|RWD|AWD|4WD or null",
  "condition": "EXCELLENT|GOOD|FAIR or null",
  "features": ["array of visible features"],
  "description": "A compelling 2-3 sentence dealer description for this vehicle"
}`;

async function decodeVinNHTSA(vin: string): Promise<Record<string, string | number | null>> {
	try {
		const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
		const data = await res.json();
		const get = (id: number) => {
			const val = data.Results?.find((r: any) => r.VariableId === id)?.Value;
			return val && val !== 'Not Applicable' ? val : null;
		};

		return {
			year: get(29) ? parseInt(get(29) as string) : null,
			make: get(26),
			model: get(28),
			trim: get(38),
			bodyType: mapNHTSABodyType(get(5)),
			engine: formatEngine(get(11), get(9)),
			transmission: mapNHTSATransmission(get(37)),
			drivetrain: mapNHTSADrivetrain(get(15)),
			fuelType: get(24)
		};
	} catch {
		return {};
	}
}

function mapNHTSABodyType(value: string | null): string | null {
	if (!value) return null;
	const lower = value.toLowerCase();
	if (lower.includes('sedan')) return 'SEDAN';
	if (lower.includes('suv') || lower.includes('sport utility')) return 'SUV';
	if (lower.includes('truck') || lower.includes('pickup')) return 'TRUCK';
	if (lower.includes('wagon')) return 'WAGON';
	if (lower.includes('coupe')) return 'COUPE';
	if (lower.includes('convertible')) return 'CONVERTIBLE';
	if (lower.includes('van')) return 'VAN';
	if (lower.includes('hatchback')) return 'HATCHBACK';
	return null;
}

function mapNHTSATransmission(value: string | null): string | null {
	if (!value) return null;
	const lower = value.toLowerCase();
	if (lower.includes('manual')) return 'MANUAL';
	if (lower.includes('cvt')) return 'CVT';
	if (lower.includes('automatic')) return 'AUTOMATIC';
	return null;
}

function mapNHTSADrivetrain(value: string | null): string | null {
	if (!value) return null;
	const lower = value.toLowerCase();
	if (lower.includes('4x4') || lower.includes('4wd')) return '4WD';
	if (lower.includes('awd') || lower.includes('all wheel')) return 'AWD';
	if (lower.includes('rwd') || lower.includes('rear')) return 'RWD';
	if (lower.includes('fwd') || lower.includes('front')) return 'FWD';
	return null;
}

function formatEngine(displacement: string | null, cylinders: string | null): string | null {
	if (!displacement && !cylinders) return null;
	const parts = [];
	if (displacement) parts.push(`${displacement}L`);
	if (cylinders) parts.push(`${cylinders}-Cyl`);
	return parts.join(' ') || null;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
		throw error(403, 'Unauthorized');
	}

	const apiKey = env.CLAUDE_API_KEY;
	if (!apiKey) {
		throw error(500, 'AI service not configured');
	}

	const { images } = await request.json();
	if (!images || !Array.isArray(images) || images.length === 0) {
		throw error(400, 'At least one image is required');
	}

	if (images.length > 8) {
		throw error(400, 'Maximum 8 images allowed');
	}

	// Build multi-image content for Claude Vision
	const imageContent = images.map((dataUrl: string) => {
		const match = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
		if (!match) throw error(400, 'Invalid image format — expected base64 data URL');
		return {
			type: 'image' as const,
			source: {
				type: 'base64' as const,
				media_type: match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
				data: match[2]
			}
		};
	});

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
				max_tokens: 1024,
				system: ANALYSIS_PROMPT,
				messages: [
					{
						role: 'user',
						content: [
							...imageContent,
							{
								type: 'text',
								text: `Analyze these ${images.length} vehicle photo(s). Extract all identifiable information and return JSON only.`
							}
						]
					}
				]
			})
		});

		if (!response.ok) {
			const errBody = await response.text();
			console.error('Claude API error:', response.status, errBody);
			throw error(502, 'AI analysis failed');
		}

		const data = await response.json();
		const rawText = data.content?.[0]?.text ?? '';

		// Parse JSON from response (handle markdown code blocks)
		const jsonMatch = rawText.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw error(502, 'AI returned invalid response');
		}

		let analysis;
		try {
			analysis = JSON.parse(jsonMatch[0]);
		} catch {
			console.error('AI returned unparseable JSON:', rawText.slice(0, 500));
			throw error(502, 'AI returned an unreadable response — try again or enter details manually');
		}

		// If VIN was found, cross-reference with NHTSA
		let vinDecoded: Record<string, string | number | null> | null = null;
		if (analysis.vin && analysis.vin.length === 17) {
			vinDecoded = await decodeVinNHTSA(analysis.vin);

			// Fill gaps: use NHTSA data where AI returned null
			for (const [key, value] of Object.entries(vinDecoded)) {
				if (value && (analysis[key] === null || analysis[key] === undefined)) {
					analysis[key] = value;
				}
			}
		}

		return json({
			...analysis,
			vinDecoded
		});
	} catch (err: any) {
		if (err?.status) throw err; // Re-throw SvelteKit errors
		console.error('Analysis error:', err);
		throw error(500, 'Failed to analyze photos');
	}
};
