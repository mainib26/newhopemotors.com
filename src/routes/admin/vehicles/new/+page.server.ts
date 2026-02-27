import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';

function generateSlug(year: number, make: string, model: string, trim: string, vin: string): string {
	const parts = [year, make, model, trim].filter(Boolean).map(String);
	const slug = parts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
	const vinSuffix = vin ? vin.slice(-6) : Math.random().toString(36).slice(2, 8);
	return `${slug}-${vinSuffix}`;
}

export const actions: Actions = {
	default: async ({ request }) => {
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

		const vin = formData.get('vin')?.toString().trim() ?? '';
		const trim = formData.get('trim')?.toString().trim() ?? '';

		const prisma = await db();

		const vehicle = await prisma.vehicle.create({
			data: {
				vin: vin || null,
				stockNumber: formData.get('stockNumber')?.toString().trim() || null,
				year,
				make,
				model,
				trim: trim || null,
				bodyType: formData.get('bodyType')?.toString() || null,
				condition: formData.get('condition')?.toString() || null,
				status: formData.get('status')?.toString() || 'AVAILABLE',
				mileage: parseInt(formData.get('mileage')?.toString() ?? '') || null,
				engine: formData.get('engine')?.toString().trim() || null,
				transmission: formData.get('transmission')?.toString() || null,
				drivetrain: formData.get('drivetrain')?.toString() || null,
				exteriorColor: formData.get('exteriorColor')?.toString().trim() || null,
				interiorColor: formData.get('interiorColor')?.toString().trim() || null,
				price,
				internetPrice: parseFloat(formData.get('internetPrice')?.toString() ?? '') || null,
				description: formData.get('description')?.toString().trim() || null,
				features: formData.get('features')?.toString().split('\n').map(f => f.trim()).filter(Boolean) ?? [],
				slug: generateSlug(year, make, model, trim, vin)
			}
		});

		throw redirect(302, `/admin/vehicles/${vehicle.id}`);
	}
};
