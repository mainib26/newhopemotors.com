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
	firstName: string;
	lastName: string | null;
	email: string | null;
	phone: string | null;
	message: string | null;
	source: string;
	vehicleId: string | null;
};

type VehicleSummary = {
	id: string;
	year: number;
	make: string;
	model: string;
	vin: string | null;
	stockNumber: string | null;
};

export async function pushUnsentLeads(): Promise<PushResult> {
	const supabase = adminClient();

	const { data: leads, error } = await supabase
		.from('Leads')
		.select('id,firstName,lastName,email,phone,message,source,vehicleId')
		.eq('adfPushed', false)
		.limit(50);

	if (error || !leads) {
		return { total: 0, success: 0, failed: 0, errors: [error?.message ?? 'Failed to load leads'] };
	}

	const vehicleIds = Array.from(new Set(leads.map((l) => l.vehicleId).filter(Boolean))) as string[];
	const vehicleMap = new Map<string, VehicleSummary>();
	if (vehicleIds.length) {
		const { data: vehicles, error: vehicleError } = await supabase
			.from('Vehicles')
			.select('id,year,make,model,vin,stockNumber')
			.in('id', vehicleIds);
		if (!vehicleError && vehicles) {
			vehicles.forEach((v) => vehicleMap.set(v.id, v as VehicleSummary));
		}
	}

	const result: PushResult = { total: leads.length, success: 0, failed: 0, errors: [] };

	for (const lead of leads as LeadRecord[]) {
		try {
			const vehicle = lead.vehicleId ? vehicleMap.get(lead.vehicleId) : undefined;
			generateAdfXml({
				firstName: lead.firstName,
				lastName: lead.lastName ?? undefined,
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
						stockNumber: vehicle.stockNumber ?? undefined
					}
					: undefined
			});

			await supabase
				.from('Leads')
				.update({ adfPushed: true, adfPushedAt: new Date().toISOString() })
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
