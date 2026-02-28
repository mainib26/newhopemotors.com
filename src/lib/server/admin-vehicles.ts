import { env } from '$env/dynamic/private';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const VEHICLE_BUCKET = env.SUPABASE_VEHICLE_BUCKET || 'vehicle-photos';
const PHOTO_FIELDS = 'id,vehicleId,url,supabasePath,sortOrder,isPrimary,alt';
const VEHICLE_SELECT = [
  'id',
  'vin',
  'stockNumber',
  'year',
  'make',
  'model',
  'trim',
  'bodyType',
  'exteriorColor',
  'interiorColor',
  'mileage',
  'engine',
  'transmission',
  'drivetrain',
  'price',
  'internetPrice',
  'bookValue',
  'condition',
  'status',
  'description',
  'features',
  'carfaxUrl',
  'autoCheckUrl',
  'slug',
  'createdAt',
  'updatedAt',
  'listedAt',
  'soldAt',
  `photos:vehicle_photos(${PHOTO_FIELDS})`
].join(',');

export type VehicleSummary = {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
};

export type AdminVehiclePhoto = {
  id: string;
  vehicleId: string;
  url: string;
  supabasePath: string | null;
  sortOrder: number;
  isPrimary: boolean;
  alt: string | null;
};

export type AdminVehicle = {
  id: string;
  vin: string | null;
  stockNumber: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  bodyType: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  price: number;
  internetPrice: number | null;
  bookValue: number | null;
  condition: string | null;
  status: string;
  description: string | null;
  features: string[];
  carfaxUrl: string | null;
  autoCheckUrl: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  listedAt: string | null;
  soldAt: string | null;
  photos: AdminVehiclePhoto[];
};

export type VehicleFilters = {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export type VehiclePayload = {
  vin?: string | null;
  stockNumber?: string | null;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  bodyType?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  mileage?: number | null;
  engine?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  price: number;
  internetPrice?: number | null;
  bookValue?: number | null;
  condition?: string | null;
  status?: string;
  description?: string | null;
  features?: string[];
  carfaxUrl?: string | null;
  autoCheckUrl?: string | null;
  slug?: string;
};

const supabase = (() => {
	let client: ReturnType<typeof getSupabaseAdminClient> | null = null;
	return () => {
		if (!client) {
			client = getSupabaseAdminClient();
		}
		return client;
	};
})();

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeVehicle(record: any): AdminVehicle {
  const photos: AdminVehiclePhoto[] = (record.photos ?? [])
    .map((photo: any) => ({
      id: photo.id,
      vehicleId: photo.vehicleId,
      url: photo.url,
      supabasePath: photo.supabasePath ?? null,
      sortOrder: photo.sortOrder ?? 0,
      isPrimary: Boolean(photo.isPrimary),
      alt: photo.alt ?? null
    }))
    .sort((a: AdminVehiclePhoto, b: AdminVehiclePhoto) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    id: record.id,
    vin: record.vin ?? null,
    stockNumber: record.stockNumber ?? null,
    year: record.year,
    make: record.make,
    model: record.model,
    trim: record.trim ?? null,
    bodyType: record.bodyType ?? null,
    exteriorColor: record.exteriorColor ?? null,
    interiorColor: record.interiorColor ?? null,
    mileage: record.mileage ?? null,
    engine: record.engine ?? null,
    transmission: record.transmission ?? null,
    drivetrain: record.drivetrain ?? null,
    price: record.price,
    internetPrice: record.internetPrice ?? null,
    bookValue: record.bookValue ?? null,
    condition: record.condition ?? null,
    status: record.status,
    description: record.description ?? null,
    features: parseFeatures(record.features),
    carfaxUrl: record.carfaxUrl ?? null,
    autoCheckUrl: record.autoCheckUrl ?? null,
    slug: record.slug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    listedAt: record.listedAt ?? null,
    soldAt: record.soldAt ?? null,
    photos
  };
}

export function generateVehicleSlug(year: number, make: string, model: string, trim: string, vin: string): string {
  const slugBase = [year, make, model, trim]
    .filter(Boolean)
    .map((part) => String(part).toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .filter(Boolean)
    .join('-');
  const vinSuffix = vin ? vin.slice(-6) : Math.random().toString(36).slice(2, 8);
  return `${slugBase}-${vinSuffix}`.replace(/-+/g, '-');
}

export async function listAdminVehicles(filters: VehicleFilters): Promise<{ vehicles: AdminVehicle[]; total: number; page: number; perPage: number }> {
	const client = supabase();
  const perPage = filters.perPage ?? 20;
  const page = filters.page ?? 1;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = client
    .from('vehicles')
    .select(VEHICLE_SELECT, { count: 'exact' })
    .order('createdAt', { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    const search = filters.search.trim().replace(/,/g, '.');
    query = query.or(
      [
        `make.ilike.%${search}%`,
        `model.ilike.%${search}%`,
        `vin.ilike.%${search}%`,
        `stockNumber.ilike.%${search}%`
      ].join(',')
    );
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`Failed to load vehicles: ${error.message}`);
  }

  return {
    vehicles: (data ?? []).map(normalizeVehicle),
    total: count ?? 0,
    page,
    perPage
  };
}

export async function getAdminVehicle(id: string): Promise<AdminVehicle> {
	const client = supabase();
  const { data, error } = await client
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeVehicle(data);
}

export async function createAdminVehicle(payload: VehiclePayload): Promise<AdminVehicle> {
	const client = supabase();
  const insertPayload = {
    ...payload,
    features: JSON.stringify(payload.features ?? [])
  };

  const { data, error } = await client.from('vehicles').insert(insertPayload).select(VEHICLE_SELECT).single();
  if (error) {
    throw new Error(`Failed to create vehicle: ${error.message}`);
  }
  return normalizeVehicle(data);
}

export async function updateAdminVehicle(id: string, payload: VehiclePayload): Promise<AdminVehicle> {
	const client = supabase();
  const updatePayload = {
    ...payload,
    features: JSON.stringify(payload.features ?? [])
  };

  const { data, error } = await client
    .from('vehicles')
    .update(updatePayload)
    .eq('id', id)
    .select(VEHICLE_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update vehicle: ${error.message}`);
  }

  return normalizeVehicle(data);
}

export async function deleteAdminVehicle(id: string): Promise<void> {
	const client = supabase();
  const { data: photos } = await client
    .from('vehicle_photos')
    .select('id,supabasePath')
    .eq('vehicleId', id);

  if (photos?.length) {
    const paths = photos.map((photo: { supabasePath: string | null }) => photo.supabasePath).filter(Boolean) as string[];
    if (paths.length) {
      await client.storage.from(VEHICLE_BUCKET).remove(paths);
    }
    await client.from('vehicle_photos').delete().eq('vehicleId', id);
  }

  const { error } = await client.from('vehicles').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete vehicle: ${error.message}`);
  }
}

function getFileExtension(file: File) {
  if (file.name && file.name.includes('.')) {
    return file.name.split('.').pop() ?? 'jpg';
  }
  if (file.type) {
    return file.type.split('/').pop() ?? 'jpg';
  }
  return 'jpg';
}

export async function uploadVehiclePhotos(vehicleId: string, files: File[]): Promise<AdminVehiclePhoto[]> {
	const client = supabase();
  if (!files.length) {
    return [];
  }

  const { count } = await client
    .from('vehicle_photos')
    .select('id', { count: 'exact', head: true })
    .eq('vehicleId', vehicleId);

  const startIndex = count ?? 0;
  const storage = client.storage.from(VEHICLE_BUCKET);
  const uploaded: AdminVehiclePhoto[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.size || !file.type.startsWith('image/')) continue;

    const path = `${vehicleId}/${crypto.randomUUID()}.${getFileExtension(file)}`;
    const { error: uploadError } = await storage.upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false
    });
    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    const publicUrl = storage.getPublicUrl(path).data.publicUrl;
    const { data, error } = await client
      .from('vehicle_photos')
      .insert({
        vehicleId,
        url: publicUrl,
        supabasePath: path,
        sortOrder: startIndex + i,
        isPrimary: startIndex === 0 && i === 0,
        alt: `Vehicle photo ${startIndex + i + 1}`
      })
      .select(PHOTO_FIELDS)
      .single();

    if (error) {
      throw new Error(`Failed to save photo metadata: ${error.message}`);
    }

    uploaded.push({
      id: data.id,
      vehicleId: data.vehicleId,
      url: data.url,
      supabasePath: data.supabasePath ?? null,
      sortOrder: data.sortOrder ?? 0,
      isPrimary: Boolean(data.isPrimary),
      alt: data.alt ?? null
    });
  }

  return uploaded;
}

export async function deleteVehiclePhoto(photoId: string): Promise<void> {
	const client = supabase();
  const storage = client.storage.from(VEHICLE_BUCKET);
  const { data, error } = await client
    .from('vehicle_photos')
    .select('id,vehicleId,supabasePath,isPrimary')
    .eq('id', photoId)
    .single();

  if (error || !data) {
    throw new Error('Photo not found');
  }

  if (data.supabasePath) {
    await storage.remove([data.supabasePath]);
  }

  await client.from('vehicle_photos').delete().eq('id', photoId);

  if (data.isPrimary) {
    const { data: first } = await client
      .from('vehicle_photos')
      .select('id')
      .eq('vehicleId', data.vehicleId)
      .order('sortOrder', { ascending: true })
      .limit(1)
      .single();

    if (first) {
      await client.from('vehicle_photos').update({ isPrimary: true }).eq('id', first.id);
    }
  }
}

export async function reorderVehiclePhotos(order: string[]): Promise<void> {
	const client = supabase();
  await Promise.all(
    order.map((photoId, index) => client.from('vehicle_photos').update({ sortOrder: index }).eq('id', photoId))
  );
}

export async function markPrimaryPhoto(photoId: string, vehicleId: string): Promise<void> {
	const client = supabase();
  await client.from('vehicle_photos').update({ isPrimary: false }).eq('vehicleId', vehicleId);
  await client.from('vehicle_photos').update({ isPrimary: true }).eq('id', photoId);
}

export async function fetchVehicleSummaries(ids: string[]): Promise<Map<string, VehicleSummary>> {
	const client = supabase();
	if (!ids.length) {
		return new Map<string, { year: number; make: string; model: string }>();
	}

	const { data, error } = await client
		.from('vehicles')
		.select('id,year,make,model,trim')
		.in('id', ids);

	if (error || !data) {
		console.error('Failed to fetch vehicle summaries', error?.message);
		return new Map();
	}

	return new Map(data.map((v: any) => [v.id, { year: v.year, make: v.make, model: v.model, trim: v.trim ?? null }]));
}
