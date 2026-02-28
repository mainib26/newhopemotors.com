import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, type AppointmentStatus, type AppointmentType } from '$lib/constants/enums';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ url }) => {
	const supabase = adminClient();

	const status = url.searchParams.get('status') ?? '';
	const dateStr = url.searchParams.get('date') ?? '';

	let appointmentsQuery = supabase
		.from('appointments')
		.select('id,type,status,date,notes,lead_id,vehicle_id,created_at')
		.order('date', { ascending: true });

	if (status) {
		appointmentsQuery = appointmentsQuery.eq('status', status);
	}

	if (dateStr) {
		const date = new Date(dateStr);
		const next = new Date(date);
		next.setDate(next.getDate() + 1);
		appointmentsQuery = appointmentsQuery.gte('date', date.toISOString()).lt('date', next.toISOString());
	}

	const [appointmentsRes, leadsRes, vehiclesRes] = await Promise.all([
		appointmentsQuery,
		supabase
			.from('leads')
			.select('id,first_name,last_name')
			.neq('status', 'LOST')
			.order('created_at', { ascending: false })
			.limit(50),
		supabase
			.from('Vehicles')
			.select('id,year,make,model')
			.eq('status', 'ACTIVE')
			.order('created_at', { ascending: false })
	]);

	const appointmentLeadIds = Array.from(new Set((appointmentsRes.data ?? []).map((appt) => appt.lead_id).filter(Boolean))) as string[];
	const [leadMap, vehicleMap] = await Promise.all([
		fetchLeadsByIds(appointmentLeadIds),
		fetchVehicleSummaries(
			Array.from(new Set((appointmentsRes.data ?? []).map((appt) => appt.vehicle_id).filter(Boolean))) as string[]
		)
	]);

	return {
		appointments: (appointmentsRes.data ?? []).map((a) => ({
			id: a.id,
			type: a.type,
			status: a.status,
			date: a.date,
			leadName: a.lead_id ? leadMap.get(a.lead_id)?.name ?? 'Lead' : 'Lead',
			leadPhone: a.lead_id ? leadMap.get(a.lead_id)?.phone ?? undefined : undefined,
			vehicle: a.vehicle_id ? formatVehicle(vehicleMap.get(a.vehicle_id)) : null,
			notes: a.notes
		})),
		leads: (leadsRes.data ?? []).map((l) => ({ id: l.id, name: `${l.first_name} ${l.last_name ?? ''}`.trim() })),
		vehicles: (vehiclesRes.data ?? []).map((v) => ({ id: v.id, label: `${v.year} ${v.make} ${v.model}` })),
		filters: { status, date: dateStr }
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const leadId = formData.get('leadId')?.toString();
		const vehicleId = formData.get('vehicleId')?.toString() || null;
		const typeValue = formData.get('type')?.toString() || 'TEST_DRIVE';
		const dateStr = formData.get('date')?.toString();

		if (!leadId || !dateStr || !APPOINTMENT_TYPES.includes(typeValue as AppointmentType)) {
			return fail(400, { error: 'Lead, date, and type are required' });
		}

		const [, timePart = '00:00'] = dateStr.split('T');
		const supabase = adminClient();
		await supabase.from('appointments').insert({
			lead_id: leadId,
			vehicle_id: vehicleId,
			type: typeValue,
			date: new Date(dateStr).toISOString(),
			start_time: timePart.substring(0, 5),
			status: 'SCHEDULED',
			notes: formData.get('notes')?.toString() || null
		});

		return { created: true };
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const statusValue = formData.get('status')?.toString() ?? '';
		if (!id || !APPOINTMENT_STATUSES.includes(statusValue as AppointmentStatus)) return fail(400);

		const supabase = adminClient();
		await supabase.from('appointments').update({ status: statusValue }).eq('id', id);
		return { updated: true };
	}
};

function formatVehicle(vehicle?: { year: number; make: string; model: string } | null) {
	if (!vehicle) return null;
	return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

async function fetchLeadsByIds(ids: string[]) {
	if (!ids.length) return new Map<string, { name: string; phone: string | null }>();
	const { data, error } = await adminClient()
		.from('leads')
		.select('id,first_name,last_name,phone')
		.in('id', ids);
	if (error || !data) {
		console.error('Failed to load leads by ids', error?.message);
		return new Map();
	}
	return new Map(
		data.map((lead) => [lead.id, { name: `${lead.first_name} ${lead.last_name ?? ''}`.trim(), phone: lead.phone }])
	);
}
