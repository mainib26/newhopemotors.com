import { fetchTable } from '$lib/server/supabase-rest';

export type VehicleRecord = {
	id: string;
	slug: string;
	vin: string;
	stock_number: string;
	year: number;
	make: string;
	model: string;
	trim?: string | null;
	body_type: string;
	exterior_color?: string | null;
	interior_color?: string | null;
	mileage: number;
	engine?: string | null;
	transmission?: string | null;
	drivetrain?: string | null;
	price: number;
	internet_price?: number | null;
	condition: string;
	status: string;
	description?: string | null;
	features?: string[];
	carfax_url?: string | null;
	auto_check_url?: string | null;
	listed_at: string;
	photos?: { id: string; url: string; alt: string; isPrimary?: boolean }[];
};

const mapVehicle = (record: VehicleRecord) => ({
	id: record.id,
	slug: record.slug,
	vin: record.vin,
	stockNumber: record.stock_number,
	year: record.year,
	make: record.make,
	model: record.model,
	trim: record.trim ?? null,
	bodyType: record.body_type,
	exteriorColor: record.exterior_color ?? null,
	interiorColor: record.interior_color ?? null,
	mileage: record.mileage,
	engine: record.engine ?? null,
	transmission: record.transmission ?? null,
	drivetrain: record.drivetrain ?? null,
	price: record.price,
	internetPrice: record.internet_price ?? null,
	condition: record.condition,
	status: record.status,
	description: record.description ?? null,
	features: record.features ?? [],
	carfaxUrl: record.carfax_url ?? null,
	autoCheckUrl: record.auto_check_url ?? null,
	listedAt: record.listed_at,
	photos: (record.photos ?? []).map((p) => ({
		id: p.id,
		url: p.url,
		alt: p.alt,
		isPrimary: p.isPrimary ?? false
	}))
});

export async function fetchActiveVehicles() {
	try {
		const rows = await fetchTable<VehicleRecord>('vehicles', {
			select:
				'id,slug,vin,stock_number,year,make,model,trim,body_type,exterior_color,interior_color,mileage,engine,transmission,drivetrain,price,internet_price,condition,status,description,features,carfax_url,auto_check_url,listed_at,photos',
			status: 'eq.ACTIVE',
			order: 'listed_at.desc'
		});
		return rows.map(mapVehicle);
	} catch (err) {
		console.warn('Failed to fetch vehicles from Supabase', err);
		return [];
	}
}

export async function fetchVehicleBySlug(slug: string) {
	try {
		const rows = await fetchTable<VehicleRecord>('vehicles', {
			select:
				'id,slug,vin,stock_number,year,make,model,trim,body_type,exterior_color,interior_color,mileage,engine,transmission,drivetrain,price,internet_price,condition,status,description,features,carfax_url,auto_check_url,listed_at,photos',
			slug: `eq.${slug}`,
			limit: '1'
		});
		return rows.length ? mapVehicle(rows[0]) : null;
	} catch (err) {
		console.warn('Failed to fetch vehicle detail', err);
		return null;
	}
}
