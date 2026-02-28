import type { PageServerLoad } from './$types';
import { fetchActiveVehicles } from '$lib/server/vehicles';

export const load: PageServerLoad = async () => {
	const vehicles = await fetchActiveVehicles();
	return { featuredVehicles: vehicles.slice(0, 6) };
};
