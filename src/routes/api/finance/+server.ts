import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createLead } from '$lib/server/leads';
import { insertRow } from '$lib/server/supabase-rest';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();

		const firstName = (formData.get('firstName') as string)?.trim();
		const lastName = (formData.get('lastName') as string)?.trim();
		const email = (formData.get('email') as string)?.trim();
		const phone = (formData.get('phone') as string)?.trim();

		const errors: Record<string, string> = {};
		if (!firstName) errors.firstName = 'First name is required';
		if (!lastName) errors.lastName = 'Last name is required';
		if (!phone) errors.phone = 'Phone number is required';

		if (Object.keys(errors).length > 0) {
			return json({ success: false, errors }, { status: 400 });
		}

		const lead = await createLead({
			firstName,
			lastName,
			email,
			phone,
			source: 'WEBSITE',
			message: 'Finance pre-qualification application'
		});

		await insertRow('finance_applications', {
			lead_id: lead?.id ?? null,
			first_name: firstName,
			last_name: lastName,
			email: email || '',
			phone,
			employment_status: (formData.get('employmentStatus') as string) || null,
			monthly_income: Number(formData.get('monthlyIncome')) || null,
			housing_status: (formData.get('housingStatus') as string) || null,
			monthly_housing_payment: Number(formData.get('monthlyHousingPayment')) || null,
			status: 'SUBMITTED'
		});

		return json({ success: true });
	} catch (err) {
		console.error('Failed to create finance application:', err);
		return json({ success: false, errors: { _form: 'Something went wrong. Please try again.' } }, { status: 500 });
	}
};
