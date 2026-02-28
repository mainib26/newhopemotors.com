import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { fetchActiveVehicles, fetchVehicleBySlug } from '$lib/server/vehicles';

export const load: PageServerLoad = async ({ params }) => {
	const vehicle = await fetchVehicleBySlug(params.slug);
	if (!vehicle) {
		throw error(404, 'Vehicle not found');
	}

	if (vehicle.status === 'SOLD') {
		throw redirect(302, '/inventory');
	}

	const allActive = await fetchActiveVehicles();
	const similar = allActive
		.filter((v) => v.slug !== vehicle.slug && (v.bodyType === vehicle.bodyType || v.make === vehicle.make))
		.slice(0, 4);

	return { vehicle, similar };
};
