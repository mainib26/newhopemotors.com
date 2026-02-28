import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchTable } from '$lib/server/supabase-rest';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();
	const now = new Date();
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

	const [activeVehicles, newLeadsToday, totalLeads, appointmentsToday, soldThisMonth, recentLeadsRes] = await Promise.all([
		supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
		supabase
			.from('leads')
			.select('id', { count: 'exact', head: true })
			.gte('created_at', startOfDay),
		supabase.from('leads').select('id', { count: 'exact', head: true }),
		supabase
			.from('appointments')
			.select('id', { count: 'exact', head: true })
			.gte('date', startOfDay)
			.lt('date', nextDay),
		supabase
			.from('vehicles')
			.select('id', { count: 'exact', head: true })
			.eq('status', 'SOLD')
			.gte('updated_at', startOfMonth),
		supabase
			.from('leads')
			.select('id,first_name,last_name,email,phone,status,source,created_at,vehicle_id')
			.order('created_at', { ascending: false })
			.limit(10)
	]);

	const vehicleIds = Array.from(new Set((recentLeadsRes.data ?? []).map((lead) => lead.vehicle_id).filter(Boolean))) as string[];
	const vehicleMap = await fetchVehicleSummaries(vehicleIds);

	const recentLeads = (recentLeadsRes.data ?? []).map((lead) => ({
		id: lead.id,
		name: `${lead.first_name} ${lead.last_name ?? ''}`.trim(),
		email: lead.email,
		phone: lead.phone,
		status: lead.status,
		source: lead.source,
		vehicle: lead.vehicle_id ? formatVehicle(vehicleMap.get(lead.vehicle_id)) : null,
		createdAt: lead.created_at
	}));

	const statusCountsRows = await fetchTable<{ status: string; count: number }>('leads', {
		select: 'status,count:status',
		group: 'status'
	});

	const pipeline = Object.fromEntries(statusCountsRows.map((row: any) => [row.status, Number(row.count ?? 0)]));

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
