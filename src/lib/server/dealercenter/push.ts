import { getSupabaseAdminClient } from '$lib/server/supabase';
import { generateAdfXml } from './adf';

interface PushResult {
	total: number;
	success: number;
	failed: number;
	errors: string[];
}

const adminClient = () => getSupabaseAdminClient();

type LeadRecord = {
	id: string;
	first_name: string;
	last_name: string | null;
	email: string | null;
	phone: string | null;
	message: string | null;
	source: string;
	vehicle_id: string | null;
};

type VehicleSummary = {
	id: string;
	year: number;
	make: string;
	model: string;
	vin: string | null;
	stock_number: string | null;
};

export async function pushUnsentLeads(): Promise<PushResult> {
	const supabase = adminClient();

	const { data: leads, error } = await supabase
		.from('leads')
		.select('id,first_name,last_name,email,phone,message,source,vehicle_id')
		.eq('adf_pushed', false)
		.limit(50);

	if (error || !leads) {
		return { total: 0, success: 0, failed: 0, errors: [error?.message ?? 'Failed to load leads'] };
	}

	const vehicleIds = Array.from(new Set(leads.map((l) => l.vehicle_id).filter(Boolean))) as string[];
	const vehicleMap = new Map<string, VehicleSummary>();
	if (vehicleIds.length) {
		const { data: vehicles, error: vehicleError } = await supabase
			.from('Vehicles')
			.select('id,year,make,model,vin,stock_number')
			.in('id', vehicleIds);
		if (!vehicleError && vehicles) {
			vehicles.forEach((v) => vehicleMap.set(v.id, v as VehicleSummary));
		}
	}

	const result: PushResult = { total: leads.length, success: 0, failed: 0, errors: [] };

	for (const lead of leads as LeadRecord[]) {
		try {
			const vehicle = lead.vehicle_id ? vehicleMap.get(lead.vehicle_id) : undefined;
			generateAdfXml({
				firstName: lead.first_name,
				lastName: lead.last_name ?? undefined,
				email: lead.email ?? undefined,
				phone: lead.phone ?? undefined,
				message: lead.message ?? undefined,
				source: lead.source,
				vehicle: vehicle
					? {
						year: vehicle.year,
						make: vehicle.make,
						model: vehicle.model,
						vin: vehicle.vin ?? undefined,
						stockNumber: (vehicle as any).stockNumber ?? vehicle.stock_number ?? undefined
					}
					: undefined
			});

			await supabase
				.from('leads')
				.update({ adf_pushed: true, adf_pushed_at: new Date().toISOString() })
				.eq('id', lead.id);

			result.success++;
		} catch (err) {
			result.failed++;
			result.errors.push(`Lead ${lead.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
			console.error('[DealerCenter] Failed to push lead', lead.id, err);
		}
	}

	return result;
}
