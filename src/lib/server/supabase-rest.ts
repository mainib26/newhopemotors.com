import { env } from '$env/dynamic/private';

type InsertResult<T> = T & { id?: string };

interface SupabaseError extends Error {
	status?: number;
}

export async function insertRow<T extends Record<string, any>>(table: string, payload: T): Promise<InsertResult<T>> {
	const url = env.SUPABASE_URL;
	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) {
		throw new Error('Supabase REST credentials are not configured');
	}

	const response = await fetch(`${url}/rest/v1/${table}`, {
		method: 'POST',
		headers: {
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			'Content-Type': 'application/json',
			Prefer: 'return=representation'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const message = await response.text();
		const error: SupabaseError = new Error(`Supabase request failed: ${response.status}`);
		error.status = response.status;
		console.error('[supabase-rest]', message);
		throw error;
	}

	const data = await response.json();
	return (Array.isArray(data) ? data[0] : data) as InsertResult<T>;
}

const baseUrl = env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path: string, options: RequestInit = {}) {
	if (!baseUrl || !serviceRoleKey) {
		throw new Error('Supabase REST credentials are not configured');
	}
	const response = await fetch(`${baseUrl}${path}`, {
		...options,
		headers: {
			apikey: serviceRoleKey,
			Authorization: `Bearer ${serviceRoleKey}`,
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});
	if (!response.ok) {
		const message = await response.text();
		console.error('[supabase-rest]', message);
		throw new Error(`Supabase request failed: ${response.status}`);
	}
	return response;
}

export async function fetchTable<T>(table: string, searchParams?: Record<string, string>) {
	const url = new URL(`${baseUrl}/rest/v1/${table}`);
	if (searchParams) {
		Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
	}
	const response = await supabaseRequest(url.pathname + url.search);
	return (await response.json()) as T[];
}
