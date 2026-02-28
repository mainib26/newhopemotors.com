import type { PageServerLoad } from './$types';
import { fetchActiveVehicles } from '$lib/server/vehicles';

const PER_PAGE = 12;

const sorters: Record<string, (a: any, b: any) => number> = {
	newest: (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
	'price-low': (a, b) => a.price - b.price,
	'price-high': (a, b) => b.price - a.price,
	'mileage-low': (a, b) => a.mileage - b.mileage,
	'mileage-high': (a, b) => b.mileage - a.mileage
};

export const load: PageServerLoad = async ({ url }) => {
	const vehicles = await fetchActiveVehicles();

	const q = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
	const make = url.searchParams.get('make')?.trim().toLowerCase() ?? '';
	const bodyType = url.searchParams.get('bodyType')?.trim() ?? '';
	const minPrice = Number(url.searchParams.get('minPrice')) || 0;
	const maxPrice = Number(url.searchParams.get('maxPrice')) || 0;
	const minYear = Number(url.searchParams.get('minYear')) || 0;
	const maxYear = Number(url.searchParams.get('maxYear')) || 0;
	const maxMileage = Number(url.searchParams.get('maxMileage')) || 0;
	const sortKey = url.searchParams.get('sort') || 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	let filtered = vehicles;

	if (q) {
		filtered = filtered.filter((v) =>
			`${v.make} ${v.model} ${v.trim ?? ''} ${v.description ?? ''}`.toLowerCase().includes(q)
		);
	}
	if (make) {
		filtered = filtered.filter((v) => v.make.toLowerCase() === make);
	}
	if (bodyType) {
		filtered = filtered.filter((v) => v.bodyType === bodyType);
	}
	if (minPrice) filtered = filtered.filter((v) => v.price >= minPrice);
	if (maxPrice) filtered = filtered.filter((v) => v.price <= maxPrice);
	if (minYear) filtered = filtered.filter((v) => v.year >= minYear);
	if (maxYear) filtered = filtered.filter((v) => v.year <= maxYear);
	if (maxMileage) filtered = filtered.filter((v) => v.mileage <= maxMileage);

	const sorter = sorters[sortKey] ?? sorters.newest;
	filtered = filtered.sort(sorter);

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const pageVehicles = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

	const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();
	const bodyTypes = Array.from(new Set(vehicles.map((v) => v.bodyType))).sort();

	return {
		vehicles: pageVehicles,
		total,
		page: currentPage,
		totalPages,
		makes,
		bodyTypes,
		filters: { q, make, bodyType, minPrice, maxPrice, minYear, maxYear, maxMileage, sort: sortKey }
	};
};
