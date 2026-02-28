import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

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
	photos: { id: string; url: string; alt: string | null; isPrimary?: boolean }[];
};

type VehicleRow = {
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
	createdAt: string;
	updatedAt: string;
	listedAt?: string | null;
};

type PhotoRow = {
	id: string;
	vehicleId: string;
	url: string;
	alt: string | null;
	isPrimary?: boolean | null;
	sortOrder?: number | null;
};

const mapVehicle = (record: VehicleRow, photos: PhotoRow[]): VehicleRecord => ({
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
	listedAt: record.listedAt ?? record.createdAt,
	photos: photos
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
		.map((p) => ({
			id: p.id,
			url: p.url,
			alt: p.alt,
			isPrimary: Boolean(p.isPrimary)
		}))
});

async function fetchPhotos(vehicleIds: string[]) {
	const client = adminClient();
	if (!vehicleIds.length) return new Map<string, PhotoRow[]>();

	const { data, error } = await client
		.from('VehiclePhoto')
		.select('id,vehicleId,url,alt,isPrimary,sortOrder')
		.in('vehicleId', vehicleIds);

	if (error || !data) {
		console.warn('Failed to fetch vehicle photos', error?.message);
		return new Map();
	}

	const grouped = new Map<string, PhotoRow[]>();
	for (const photo of data as PhotoRow[]) {
		if (!grouped.has(photo.vehicleId)) grouped.set(photo.vehicleId, []);
		grouped.get(photo.vehicleId)!.push(photo);
	}
	return grouped;
}

export async function fetchActiveVehicles() {
	const client = adminClient();
	const { data, error } = await client
		.from('Vehicles')
		.select(
			'id,slug,vin,stockNumber,year,make,model,trim,bodyType,exteriorColor,interiorColor,mileage,engine,transmission,drivetrain,price,internetPrice,condition,status,description,features,carfaxUrl,autoCheckUrl,createdAt,updatedAt'
		)
		.eq('status', 'ACTIVE')
		.order('createdAt', { ascending: false });

	if (error || !data) {
		console.error('Failed to fetch vehicles from Supabase', JSON.stringify(error));
		return [];
	}

	const photos = await fetchPhotos((data as VehicleRow[]).map((row) => row.id));
	return (data as VehicleRow[]).map((row) => mapVehicle(row, photos.get(row.id) ?? []));
}

export async function fetchVehicleBySlug(slug: string) {
	const client = adminClient();
	const { data, error } = await client
		.from('Vehicles')
		.select(
			'id,slug,vin,stockNumber,year,make,model,trim,bodyType,exteriorColor,interiorColor,mileage,engine,transmission,drivetrain,price,internetPrice,condition,status,description,features,carfaxUrl,autoCheckUrl,createdAt,updatedAt'
		)
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.warn('Failed to fetch vehicle detail', error.message);
		return null;
	}

	if (!data) return null;

	const photos = await fetchPhotos([data.id]);
	return mapVehicle(data as VehicleRow, photos.get(data.id) ?? []);
}
