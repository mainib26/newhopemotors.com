import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';
import { LEAD_STATUSES, type LeadStatus } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ params }) => {
	const supabase = adminClient();

	const { data: lead, error: leadError } = await supabase
		.from('Leads')
		.select('id,firstName,lastName,email,phone,status,source,message,vehicleId,assignedToId,createdAt,updatedAt')
		.eq('id', params.id)
		.maybeSingle();

	if (leadError) {
		console.error('Failed to load lead', leadError.message);
	}
	if (!lead) throw error(404, 'Lead not found');

	const vehicleMap = lead.vehicleId ? await fetchVehicleSummaries([lead.vehicleId]) : new Map();

	const [notesRes, appointmentsRes] = await Promise.all([
		supabase
			.from('LeadNotes')
			.select('id,authorId,content,createdAt')
			.eq('leadId', params.id)
			.order('createdAt', { ascending: false }),
		supabase
			.from('Appointments')
			.select('id,type,status,date,notes,vehicleId,createdAt,updatedAt')
			.eq('leadId', params.id)
			.order('date', { ascending: false })
	]);

	const noteAuthorIds = Array.from(new Set((notesRes.data ?? []).map((note) => note.authorId))).filter(Boolean) as string[];
	const appointmentVehicleIds = Array.from(new Set((appointmentsRes.data ?? []).map((appt) => appt.vehicleId).filter(Boolean))) as string[];

	const [authors, appointmentVehicles] = await Promise.all([
		fetchUsersByIds(noteAuthorIds),
		fetchVehicleSummaries(appointmentVehicleIds)
	]);

	const notes = (notesRes.data ?? []).map((note) => ({
		id: note.id,
		content: note.content,
		createdAt: note.createdAt,
		author: note.authorId ? authors.get(note.authorId) ?? 'Unknown' : 'System'
	}));

	const appointments = (appointmentsRes.data ?? []).map((appt) => {
		const summary = appt.vehicleId ? appointmentVehicles.get(appt.vehicleId) : null;
		return {
			id: appt.id,
			type: appt.type,
			status: appt.status,
			date: appt.date,
			createdAt: appt.createdAt,
			updatedAt: appt.updatedAt,
			notes: appt.notes,
			vehicle: appt.vehicleId && summary ? { id: appt.vehicleId, ...summary } : null
		};
	});

	const leadUsers = await fetchActiveUsers();

	const vehicleSummary = lead.vehicleId ? vehicleMap.get(lead.vehicleId) : null;

	return {
		lead: {
			id: lead.id,
			firstName: lead.firstName,
			lastName: lead.lastName,
			email: lead.email,
			phone: lead.phone,
			status: lead.status,
			source: lead.source,
			message: lead.message,
			vehicleId: lead.vehicleId,
			vehicle: lead.vehicleId && vehicleSummary
				? { id: lead.vehicleId, ...vehicleSummary }
				: null,
			assignedToId: lead.assignedToId,
			createdAt: lead.createdAt,
			updatedAt: lead.updatedAt,
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
		await supabase.from('Leads').update({ status: statusValue }).eq('id', params.id);
		return { updated: true };
	},

	assign: async ({ request, params }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString() || null;

		const supabase = adminClient();
		await supabase.from('Leads').update({ assignedToId: userId }).eq('id', params.id);
		return { updated: true };
	},

	addNote: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();
		if (!content) return fail(400, { noteError: 'Note cannot be empty' });

		const supabase = adminClient();
		await supabase.from('LeadNotes').insert({
			id: crypto.randomUUID(),
			leadId: params.id,
			authorId: locals.user!.id,
			content
		});
		return { noteAdded: true };
	}
};

async function fetchUsersByIds(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('Users').select('id,name').in('id', ids);
	if (error || !data) {
		console.error('Failed to load users by ids', error?.message);
		return new Map();
	}
	return new Map(data.map((user) => [user.id, user.name]));
}

async function fetchActiveUsers() {
	const { data, error } = await adminClient()
		.from('Users')
		.select('id,name')
		.eq('isActive', true)
		.order('name', { ascending: true });
	if (error || !data) {
		console.error('Failed to load users', error?.message);
		return [] as { id: string; name: string }[];
	}
	return data;
}
