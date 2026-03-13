import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';
import { LEAD_STATUSES } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();

type LeadRow = {
	id: string;
	firstName: string;
	lastName: string | null;
	email: string | null;
	phone: string | null;
	status: string;
	source: string;
	vehicleId: string | null;
	assignedToId: string | null;
	createdAt: string;
};

export const load: PageServerLoad = async ({ url }) => {
	const supabase = adminClient();
	const status = url.searchParams.get('status') ?? '';
	const source = url.searchParams.get('source') ?? '';
	const search = url.searchParams.get('q')?.trim() ?? '';
	const view = url.searchParams.get('view') ?? 'table';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
	const perPage = 25;

	const rangeStart = (pageNum - 1) * perPage;
	const rangeEnd = rangeStart + perPage - 1;

	const baseQuery = supabase
		.from('Leads')
		.select('id,firstName,lastName,email,phone,status,source,vehicleId,assignedToId,createdAt')
		.order('createdAt', { ascending: false })
		.range(rangeStart, rangeEnd);

	const leadsQuery = applyLeadFilters(baseQuery, { status, source, search });
	const [{ data: leadRows, error }, totalCount] = await Promise.all([
		leadsQuery,
		countLeads({ status, source, search })
	]);

	if (error) {
		console.error('Failed to load leads', error.message);
	}

	const leads: LeadRow[] = (leadRows as LeadRow[] | null) ?? [];

	const vehicleIds = Array.from(new Set(leads.map((lead) => lead.vehicleId).filter(Boolean))) as string[];
	const vehicleMap = await fetchVehicleSummaries(vehicleIds);

	const assigneeIds = Array.from(new Set(leads.map((lead) => lead.assignedToId).filter(Boolean))) as string[];
	const assignedUsers = await fetchAssignedUsers(assigneeIds);

	const leadData = leads.map((lead) => ({
		id: lead.id,
		name: `${lead.firstName} ${lead.lastName ?? ''}`.trim(),
		email: lead.email,
		phone: lead.phone,
		status: lead.status,
		source: lead.source,
		vehicle: lead.vehicleId ? formatVehicle(vehicleMap.get(lead.vehicleId)) : null,
		assignedTo: lead.assignedToId ? assignedUsers.get(lead.assignedToId) ?? null : null,
		createdAt: lead.createdAt
	}));

	const statusCountResults = await Promise.all(
		LEAD_STATUSES.map((s) =>
			adminClient().from('Leads').select('id', { count: 'exact', head: true }).eq('status', s)
		)
	);
	const statusCounts = Object.fromEntries(LEAD_STATUSES.map((s, i) => [s, statusCountResults[i].count ?? 0]));

	return {
		leads: leadData,
		total: totalCount ?? 0,
		page: pageNum,
		totalPages: Math.ceil((totalCount ?? 0) / perPage) || 1,
		statusCounts,
		filters: { status, source, search, view }
	};
};

function applyLeadFilters(query: any, filters: { status?: string; source?: string; search?: string }) {
	let next = query;
	if (filters.status) {
		next = next.eq('status', filters.status);
	}
	if (filters.source) {
		next = next.eq('source', filters.source);
	}
	if (filters.search) {
		const term = `%${filters.search}%`;
		next = next.or(`firstName.ilike.${term},lastName.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
	}
	return next;
}

async function countLeads(filters: { status?: string; source?: string; search?: string }) {
	const supabase = adminClient();
	let query = supabase.from('Leads').select('id', { count: 'exact', head: true });
	query = applyLeadFilters(query, filters);
	const { count } = await query;
	return count ?? 0;
}

async function fetchAssignedUsers(ids: string[]) {
	const supabase = adminClient();
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await supabase.from('Users').select('id,name').in('id', ids);
	if (error || !data) {
		console.error('Failed to load assigned users', error?.message);
		return new Map();
	}
	return new Map(data.map((user) => [user.id, user.name]));
}

function formatVehicle(vehicle?: { year: number; make: string; model: string } | null) {
	if (!vehicle) return null;
	return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}
