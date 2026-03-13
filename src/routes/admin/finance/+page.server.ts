import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { FINANCE_STATUSES, type FinanceStatus } from '$lib/constants/enums';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();

	const applicationsRes = await supabase
		.from('FinanceApplications')
		.select('id,leadId,firstName,lastName,email,phone,status,vehicleId,createdAt')
		.order('createdAt', { ascending: false })
		.limit(50);

	if (applicationsRes.error) {
		console.error('Failed to load finance applications', applicationsRes.error.message);
	}

	const vehicleMap = await fetchVehicleSummaries(
		Array.from(new Set((applicationsRes.data ?? []).map((app) => app.vehicleId).filter(Boolean))) as string[]
	);

	return {
		applications: (applicationsRes.data ?? []).map((a) => ({
			id: a.id,
			firstName: a.firstName,
			lastName: a.lastName,
			email: a.email,
			phone: a.phone,
			status: a.status,
			vehicleInterest: a.vehicleId ? formatVehicle(vehicleMap.get(a.vehicleId)) : null,
			createdAt: a.createdAt
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
		await supabase.from('FinanceApplications').update({ status: statusValue }).eq('id', id);
		return { updated: true };
	}
};

function formatVehicle(vehicle?: { year: number; make: string; model: string } | null) {
	if (!vehicle) return null;
	return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}
