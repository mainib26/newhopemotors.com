import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
	if (adminClient) {
		return adminClient;
	}

	const supabaseUrl = env.SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
	}

	adminClient = createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	return adminClient;
}

export async function updateSupabaseUserActiveState(email: string, supabaseId: string | null, isActive: boolean) {
	const client = getSupabaseAdminClient();
	let targetId = supabaseId || null;

	if (!targetId) {
		const { data, error } = await (client as any).auth.admin.listUsers({ email });
		if (error) {
			console.error('Failed to look up Supabase user by email', email, error.message);
		} else {
			targetId = data?.users?.[0]?.id ?? null;
		}
	}

	if (!targetId) {
		console.warn(`Supabase user not found for ${email}; skipping active-state sync`);
		return;
	}

	const { error: updateError } = await (client as any).auth.admin.updateUserById(targetId, {
		app_metadata: { disabled: !isActive }
	});

	if (updateError) {
		console.error('Failed to update Supabase user active state', email, updateError.message);
	}
}
