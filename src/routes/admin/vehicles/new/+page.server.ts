import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import {
  createAdminVehicle,
  generateVehicleSlug,
  uploadVehiclePhotos
} from '$lib/server/admin-vehicles';

export const actions: Actions = {
  default: async ({ request }) => {
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

    const vin = formData.get('vin')?.toString().trim() ?? '';
    const trim = formData.get('trim')?.toString().trim() ?? '';
    const features = formData
      .get('features')
      ?.toString()
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean) ?? [];

    const vehicle = await createAdminVehicle({
      vin: vin || null,
      stockNumber: formData.get('stockNumber')?.toString().trim() || null,
      year,
      make,
      model,
      trim: trim || null,
      bodyType: formData.get('bodyType')?.toString() || null,
      condition: formData.get('condition')?.toString() || null,
      status: formData.get('status')?.toString() || 'ACTIVE',
      mileage: parseInt(formData.get('mileage')?.toString() ?? '', 10) || null,
      engine: formData.get('engine')?.toString().trim() || null,
      transmission: formData.get('transmission')?.toString() || null,
      drivetrain: formData.get('drivetrain')?.toString() || null,
      exteriorColor: formData.get('exteriorColor')?.toString().trim() || null,
      interiorColor: formData.get('interiorColor')?.toString().trim() || null,
      price,
      internetPrice: parseFloat(formData.get('internetPrice')?.toString() ?? '') || null,
      description: formData.get('description')?.toString().trim() || null,
      features,
      slug: generateVehicleSlug(year, make, model, trim, vin),
      carfaxUrl: formData.get('carfaxUrl')?.toString().trim() || null,
      autoCheckUrl: formData.get('autoCheckUrl')?.toString().trim() || null
    });

    const photoFiles = formData.getAll('photos') as File[];
    if (photoFiles.length) {
      await uploadVehiclePhotos(vehicle.id, photoFiles);
    }

    throw redirect(302, `/admin/vehicles/${vehicle.id}`);
  }
};
