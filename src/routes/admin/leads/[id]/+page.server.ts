import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';
import { LEAD_STATUSES, type LeadStatus } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ params }) => {
	const supabase = adminClient();

	const { data: lead, error: leadError } = await supabase
		.from('leads')
		.select('id,first_name,last_name,email,phone,status,source,message,vehicle_id,assigned_to_id,created_at,updated_at')
		.eq('id', params.id)
		.maybeSingle();

	if (leadError) {
		console.error('Failed to load lead', leadError.message);
	}
	if (!lead) throw error(404, 'Lead not found');

	const vehicleMap = lead.vehicle_id ? await fetchVehicleSummaries([lead.vehicle_id]) : new Map();

	const [notesRes, appointmentsRes] = await Promise.all([
		supabase
			.from('lead_notes')
			.select('id,author_id,content,created_at')
			.eq('lead_id', params.id)
			.order('created_at', { ascending: false }),
		supabase
			.from('appointments')
			.select('id,type,status,date,notes,vehicle_id,created_at,updated_at')
			.eq('lead_id', params.id)
			.order('date', { ascending: false })
	]);

	const noteAuthorIds = Array.from(new Set((notesRes.data ?? []).map((note) => note.author_id))).filter(Boolean) as string[];
	const appointmentVehicleIds = Array.from(new Set((appointmentsRes.data ?? []).map((appt) => appt.vehicle_id).filter(Boolean))) as string[];

	const [authors, appointmentVehicles] = await Promise.all([
		fetchUsersByIds(noteAuthorIds),
		fetchVehicleSummaries(appointmentVehicleIds)
	]);

	const notes = (notesRes.data ?? []).map((note) => ({
		id: note.id,
		content: note.content,
		createdAt: note.created_at,
		author: note.author_id ? authors.get(note.author_id) ?? 'Unknown' : 'System'
	}));

	const appointments = (appointmentsRes.data ?? []).map((appt) => {
		const summary = appt.vehicle_id ? appointmentVehicles.get(appt.vehicle_id) : null;
		return {
			id: appt.id,
			type: appt.type,
			status: appt.status,
			date: appt.date,
			createdAt: appt.created_at,
			updatedAt: appt.updated_at,
			notes: appt.notes,
			vehicle: appt.vehicle_id && summary ? { id: appt.vehicle_id, ...summary } : null
		};
	});

	const leadUsers = await fetchActiveUsers();

	const vehicleSummary = lead.vehicle_id ? vehicleMap.get(lead.vehicle_id) : null;

	return {
		lead: {
			id: lead.id,
			firstName: lead.first_name,
			lastName: lead.last_name,
			email: lead.email,
			phone: lead.phone,
			status: lead.status,
			source: lead.source,
			message: lead.message,
			vehicleId: lead.vehicle_id,
			vehicle: lead.vehicle_id && vehicleSummary
				? { id: lead.vehicle_id, ...vehicleSummary }
				: null,
			assignedToId: lead.assigned_to_id,
			createdAt: lead.created_at,
			updatedAt: lead.updated_at,
			notes,
			appointments
		},
		users: leadUsers
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const formData = await request.formData();
		const statusValue = formData.get('status')?.toString() ?? '';
		if (!LEAD_STATUSES.includes(statusValue as LeadStatus)) {
			return fail(400, { error: 'Invalid status' });
		}

		const supabase = adminClient();
		await supabase.from('leads').update({ status: statusValue }).eq('id', params.id);
		return { updated: true };
	},

	assign: async ({ request, params }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString() || null;

		const supabase = adminClient();
		await supabase.from('leads').update({ assigned_to_id: userId }).eq('id', params.id);
		return { updated: true };
	},

	addNote: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();
		if (!content) return fail(400, { noteError: 'Note cannot be empty' });

		const supabase = adminClient();
		await supabase.from('lead_notes').insert({
			lead_id: params.id,
			author_id: locals.user!.id,
			content
		});
		return { noteAdded: true };
	}
};

async function fetchUsersByIds(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('users').select('id,name').in('id', ids);
	if (error || !data) {
		console.error('Failed to load users by ids', error?.message);
		return new Map();
	}
	return new Map(data.map((user) => [user.id, user.name]));
}

async function fetchActiveUsers() {
	const { data, error } = await adminClient()
		.from('users')
		.select('id,name')
		.eq('is_active', true)
		.order('name', { ascending: true });
	if (error || !data) {
		console.error('Failed to load users', error?.message);
		return [] as { id: string; name: string }[];
	}
	return data;
}
