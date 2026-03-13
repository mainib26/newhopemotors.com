import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';
import { LEAD_STATUSES } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();
	const now = new Date();
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

	const [activeVehicles, newLeadsToday, totalLeads, appointmentsToday, soldThisMonth, recentLeadsRes] = await Promise.all([
		supabase.from('Vehicles').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
		supabase
			.from('Leads')
			.select('id', { count: 'exact', head: true })
			.gte('createdAt', startOfDay),
		supabase.from('Leads').select('id', { count: 'exact', head: true }),
		supabase
			.from('Appointments')
			.select('id', { count: 'exact', head: true })
			.gte('date', startOfDay)
			.lt('date', nextDay),
		supabase
			.from('Vehicles')
			.select('id', { count: 'exact', head: true })
			.eq('status', 'SOLD')
			.gte('updatedAt', startOfMonth),
		supabase
			.from('Leads')
			.select('id,firstName,lastName,email,phone,status,source,createdAt,vehicleId')
			.order('createdAt', { ascending: false })
			.limit(10)
	]);

	const vehicleIds = Array.from(new Set((recentLeadsRes.data ?? []).map((lead) => lead.vehicleId).filter(Boolean))) as string[];
	const vehicleMap = await fetchVehicleSummaries(vehicleIds);

	const recentLeads = (recentLeadsRes.data ?? []).map((lead) => ({
		id: lead.id,
		name: `${lead.firstName} ${lead.lastName ?? ''}`.trim(),
		email: lead.email,
		phone: lead.phone,
		status: lead.status,
		source: lead.source,
		vehicle: lead.vehicleId ? formatVehicle(vehicleMap.get(lead.vehicleId)) : null,
		createdAt: lead.createdAt
	}));

	const statusCounts = await Promise.all(
		LEAD_STATUSES.map((s) =>
			supabase.from('Leads').select('id', { count: 'exact', head: true }).eq('status', s)
		)
	);
	const pipeline = Object.fromEntries(LEAD_STATUSES.map((s, i) => [s, statusCounts[i].count ?? 0]));

	return {
		stats: {
			totalVehicles: activeVehicles.count ?? 0,
			activeVehicles: activeVehicles.count ?? 0,
			newLeadsToday: newLeadsToday.count ?? 0,
			totalLeads: totalLeads.count ?? 0,
			appointmentsToday: appointmentsToday.count ?? 0,
			soldThisMonth: soldThisMonth.count ?? 0
		},
		pipeline,
		recentLeads
	};
};

function formatVehicle(vehicle?: { year: number; make: string; model: string } | undefined | null) {
	if (!vehicle) return null;
	return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}
