import { fetchTable } from '$lib/server/supabase-rest';

export type VehicleRecord = {
	id: string;
	slug: string;
	vin: string;
	stockNumber: string;
	year: number;
	make: string;
	model: string;
	trim?: string | null;
	bodyType: string;
	exteriorColor?: string | null;
	interiorColor?: string | null;
	mileage: number;
	engine?: string | null;
	transmission?: string | null;
	drivetrain?: string | null;
	price: number;
	internetPrice?: number | null;
	condition: string;
	status: string;
	description?: string | null;
	features?: string | string[];
	carfaxUrl?: string | null;
	autoCheckUrl?: string | null;
	listedAt: string;
	photos?: { id: string; url: string; alt: string; isPrimary?: boolean }[];
};

const mapVehicle = (record: VehicleRecord) => ({
	id: record.id,
	slug: record.slug,
	vin: record.vin,
	stockNumber: record.stockNumber,
	year: record.year,
	make: record.make,
	model: record.model,
	trim: record.trim ?? null,
	bodyType: record.bodyType,
	exteriorColor: record.exteriorColor ?? null,
	interiorColor: record.interiorColor ?? null,
	mileage: record.mileage,
	engine: record.engine ?? null,
	transmission: record.transmission ?? null,
	drivetrain: record.drivetrain ?? null,
	price: record.price,
	internetPrice: record.internetPrice ?? null,
	condition: record.condition,
	status: record.status,
	description: record.description ?? null,
	features: Array.isArray(record.features)
		? record.features
		: record.features
		? (JSON.parse(record.features) as string[])
		: [],
	carfaxUrl: record.carfaxUrl ?? null,
	autoCheckUrl: record.autoCheckUrl ?? null,
	listedAt: record.listedAt,
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
				'id,slug,vin,stockNumber,year,make,model,trim,bodyType,exteriorColor,interiorColor,mileage,engine,transmission,drivetrain,price,internetPrice,condition,status,description,features,carfaxUrl,autoCheckUrl,listedAt,photos',
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
				'id,slug,vin,stockNumber,year,make,model,trim,bodyType,exteriorColor,interiorColor,mileage,engine,transmission,drivetrain,price,internetPrice,condition,status,description,features,carfaxUrl,autoCheckUrl,listedAt,photos',
			slug: `eq.${slug}`,
			limit: '1'
		});
		return rows.length ? mapVehicle(rows[0]) : null;
	} catch (err) {
		console.warn('Failed to fetch vehicle detail', err);
		return null;
	}
}
