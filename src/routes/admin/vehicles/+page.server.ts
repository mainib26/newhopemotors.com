import type { PageServerLoad } from './$types';
import { listAdminVehicles } from '$lib/server/admin-vehicles';

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('status') ?? '';
	const search = url.searchParams.get('q') ?? '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const perPage = 20;

	const { vehicles, total } = await listAdminVehicles({
		status: status || undefined,
		search: search || undefined,
		page,
		perPage
	});

	return {
		vehicles: vehicles.map((v) => ({
			id: v.id,
			stockNumber: v.stockNumber,
			year: v.year,
			make: v.make,
			model: v.model,
			trim: v.trim,
			price: v.price,
			status: v.status,
			mileage: v.mileage ?? 0,
			photo: v.photos[0]?.url ?? null,
			daysOnLot: Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000)
		})),
		total,
		page,
		totalPages: Math.ceil(total / perPage),
		filters: { status, search }
	};
};
