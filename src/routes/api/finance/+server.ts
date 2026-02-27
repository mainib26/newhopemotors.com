import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { createLead } from '$lib/server/leads';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const prisma = await db();

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

		// Create a lead first
		const lead = await createLead({
			firstName,
			lastName,
			email,
			phone,
			source: 'WEBSITE',
			message: 'Finance pre-qualification application'
		});

		// Create finance application
		await prisma.financeApplication.create({
			data: {
				leadId: lead.id,
				firstName,
				lastName,
				email: email || '',
				phone,
				employmentStatus: (formData.get('employmentStatus') as string) || null,
				monthlyIncome: Number(formData.get('monthlyIncome')) || null,
				housingStatus: (formData.get('housingStatus') as string) || null,
				monthlyHousingPayment: Number(formData.get('monthlyHousingPayment')) || null,
				status: 'SUBMITTED'
			}
		});

		return json({ success: true });
	} catch (err) {
		console.error('Failed to create finance application:', err);
		return json({ success: false, errors: { _form: 'Something went wrong. Please try again.' } }, { status: 500 });
	}
};
