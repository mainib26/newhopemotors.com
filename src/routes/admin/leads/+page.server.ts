import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import { fetchVehicleSummaries } from '$lib/server/admin-vehicles';
import { fetchTable } from '$lib/server/supabase-rest';

const adminClient = () => getSupabaseAdminClient();

type LeadRow = {
	id: string;
	first_name: string;
	last_name: string | null;
	email: string | null;
	phone: string | null;
	status: string;
	source: string;
	vehicle_id: string | null;
	assigned_to_id: string | null;
	created_at: string;
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
		.from('leads')
		.select('id,first_name,last_name,email,phone,status,source,vehicle_id,assigned_to_id,created_at')
		.order('created_at', { ascending: false })
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

	const vehicleIds = Array.from(new Set(leads.map((lead) => lead.vehicle_id).filter(Boolean))) as string[];
	const vehicleMap = await fetchVehicleSummaries(vehicleIds);

	const assigneeIds = Array.from(new Set(leads.map((lead) => lead.assigned_to_id).filter(Boolean))) as string[];
	const assignedUsers = await fetchAssignedUsers(assigneeIds);

	const leadData = leads.map((lead) => ({
		id: lead.id,
		name: `${lead.first_name} ${lead.last_name ?? ''}`.trim(),
		email: lead.email,
		phone: lead.phone,
		status: lead.status,
		source: lead.source,
		vehicle: lead.vehicle_id ? formatVehicle(vehicleMap.get(lead.vehicle_id)) : null,
		assignedTo: lead.assigned_to_id ? assignedUsers.get(lead.assigned_to_id) ?? null : null,
		createdAt: lead.created_at
	}));

	const statusCountsRows = await fetchTable<{ status: string; count: number }>('leads', {
		select: 'status,count:status',
		group: 'status'
	});

	const statusCounts = Object.fromEntries(statusCountsRows.map((row: any) => [row.status, Number(row.count ?? 0)]));

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
		next = next.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
	}
	return next;
}

async function countLeads(filters: { status?: string; source?: string; search?: string }) {
	const supabase = adminClient();
	let query = supabase.from('leads').select('id', { count: 'exact', head: true });
	query = applyLeadFilters(query, filters);
	const { count } = await query;
	return count ?? 0;
}

async function fetchAssignedUsers(ids: string[]) {
	const supabase = adminClient();
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await supabase.from('users').select('id,name').in('id', ids);
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
