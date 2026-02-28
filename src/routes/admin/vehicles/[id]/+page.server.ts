import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getAdminVehicle, updateAdminVehicle, deleteAdminVehicle } from '$lib/server/admin-vehicles';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const vehicle = await getAdminVehicle(params.id);
    return {
      vehicle: {
        ...vehicle,
        createdAt: new Date(vehicle.createdAt).toISOString(),
        updatedAt: new Date(vehicle.updatedAt).toISOString()
      }
    };
  } catch (err) {
    console.error('Failed to load vehicle', err);
    const message = err instanceof Error ? err.message.toLowerCase() : '';
    throw error(message.includes('not found') ? 404 : 500, 'Vehicle not found');
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const formData = await request.formData();
    const errors: Record<string, string> = {};

    const year = parseInt(formData.get('year')?.toString() ?? '', 10);
    const make = formData.get('make')?.toString().trim() ?? '';
    const model = formData.get('model')?.toString().trim() ?? '';
    const price = parseFloat(formData.get('price')?.toString() ?? '');

    if (!year || year < 1900 || year > 2035) errors.year = 'Valid year required';
    if (!make) errors.make = 'Make is required';
    if (!model) errors.model = 'Model is required';
    if (!price || price <= 0) errors.price = 'Valid price required';

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors });
    }

    const mileage = parseInt(formData.get('mileage')?.toString() ?? '', 10) || null;
    const featuresRaw = formData
      .get('features')
      ?.toString()
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean) ?? [];

    await updateAdminVehicle(params.id, {
      vin: formData.get('vin')?.toString().trim() || null,
      stockNumber: formData.get('stockNumber')?.toString().trim() || null,
      year,
      make,
      model,
      trim: formData.get('trim')?.toString().trim() || null,
      bodyType: formData.get('bodyType')?.toString() || null,
      condition: formData.get('condition')?.toString() || null,
      status: formData.get('status')?.toString() || 'ACTIVE',
      mileage,
      engine: formData.get('engine')?.toString().trim() || null,
      transmission: formData.get('transmission')?.toString() || null,
      drivetrain: formData.get('drivetrain')?.toString() || null,
      exteriorColor: formData.get('exteriorColor')?.toString().trim() || null,
      interiorColor: formData.get('interiorColor')?.toString().trim() || null,
      price,
      internetPrice: parseFloat(formData.get('internetPrice')?.toString() ?? '') || null,
      description: formData.get('description')?.toString().trim() || null,
      features: featuresRaw,
      carfaxUrl: formData.get('carfaxUrl')?.toString().trim() || null,
      autoCheckUrl: formData.get('autoCheckUrl')?.toString().trim() || null
    });

    return { success: true };
  },

  delete: async ({ params }) => {
    await deleteAdminVehicle(params.id);
    throw redirect(302, '/admin/vehicles');
  }
};
