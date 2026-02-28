import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { FINANCE_STATUSES, type FinanceStatus } from '$lib/constants/enums';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();

	const applicationsRes = await supabase
		.from('finance_applications')
		.select('id,lead_id,first_name,last_name,email,phone,status,vehicle_id,created_at')
		.order('created_at', { ascending: false })
		.limit(50);

	if (applicationsRes.error) {
		console.error('Failed to load finance applications', applicationsRes.error.message);
	}

	const vehicleMap = await fetchVehicleSummaries(
		Array.from(new Set((applicationsRes.data ?? []).map((app) => app.vehicle_id).filter(Boolean))) as string[]
	);

	return {
		applications: (applicationsRes.data ?? []).map((a) => ({
			id: a.id,
			firstName: a.first_name,
			lastName: a.last_name,
			email: a.email,
			phone: a.phone,
			status: a.status,
			vehicleInterest: a.vehicle_id ? formatVehicle(vehicleMap.get(a.vehicle_id)) : null,
			createdAt: a.created_at
		}))
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const statusValue = formData.get('status')?.toString() ?? '';
		if (!id || !FINANCE_STATUSES.includes(statusValue as FinanceStatus)) return fail(400);

		const supabase = adminClient();
		await supabase.from('finance_applications').update({ status: statusValue }).eq('id', id);
		return { updated: true };
	}
};

function formatVehicle(vehicle?: { year: number; make: string; model: string } | null) {
	if (!vehicle) return null;
	return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}
