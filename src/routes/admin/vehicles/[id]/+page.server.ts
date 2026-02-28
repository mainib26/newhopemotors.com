import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const prisma = await db();
	const vehicle = await prisma.vehicle.findUnique({
		where: { id: params.id },
		include: { photos: { orderBy: { sortOrder: 'asc' } } }
	});

	if (!vehicle) throw error(404, 'Vehicle not found');

	// Normalize features from Json field (may be string or array)
	let features: string[] = [];
	if (Array.isArray(vehicle.features)) {
		features = vehicle.features;
	} else if (typeof vehicle.features === 'string') {
		try { features = JSON.parse(vehicle.features); } catch { features = []; }
	}

	return {
		vehicle: {
			...vehicle,
			features,
			createdAt: vehicle.createdAt.toISOString(),
			updatedAt: vehicle.updatedAt.toISOString()
		}
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};

		const year = parseInt(formData.get('year')?.toString() ?? '');
		const make = formData.get('make')?.toString().trim() ?? '';
		const model = formData.get('model')?.toString().trim() ?? '';
		const price = parseFloat(formData.get('price')?.toString() ?? '');

		if (!year || year < 1900 || year > 2030) errors.year = 'Valid year required';
		if (!make) errors.make = 'Make is required';
		if (!model) errors.model = 'Model is required';
		if (!price || price <= 0) errors.price = 'Valid price required';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		const prisma = await db();
		const status = formData.get('status')?.toString() || 'ACTIVE';

		const mileage = parseInt(formData.get('mileage')?.toString() ?? '') || 0;
		const featuresRaw = formData.get('features')?.toString().split('\n').map(f => f.trim()).filter(Boolean) ?? [];

		await prisma.vehicle.update({
			where: { id: params.id },
			data: {
				vin: formData.get('vin')?.toString().trim() || undefined,
				stockNumber: formData.get('stockNumber')?.toString().trim() || null,
				year,
				make,
				model,
				trim: formData.get('trim')?.toString().trim() || null,
				bodyType: (formData.get('bodyType')?.toString() || 'SEDAN') as any,
				condition: (formData.get('condition')?.toString() || 'GOOD') as any,
				status: status as any,
				mileage,
				engine: formData.get('engine')?.toString().trim() || null,
				transmission: formData.get('transmission')?.toString() || null,
				drivetrain: formData.get('drivetrain')?.toString() || null,
				exteriorColor: formData.get('exteriorColor')?.toString().trim() || null,
				interiorColor: formData.get('interiorColor')?.toString().trim() || null,
				price,
				internetPrice: parseFloat(formData.get('internetPrice')?.toString() ?? '') || null,
				description: formData.get('description')?.toString().trim() || null,
				features: JSON.stringify(featuresRaw)
			}
		});

		return { success: true };
	},

	delete: async ({ params }) => {
		const prisma = await db();
		await prisma.vehiclePhoto.deleteMany({ where: { vehicleId: params.id } });
		await prisma.vehicle.delete({ where: { id: params.id } });
		throw redirect(302, '/admin/vehicles');
	}
};
