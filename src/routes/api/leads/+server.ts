import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createLead, validateLeadInput } from '$lib/server/leads';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const { valid, errors, values } = validateLeadInput(formData);

		if (!valid) {
			return json({ success: false, errors }, { status: 400 });
		}

		const lead = await createLead(values);

		return json({ success: true, leadId: lead.id });
	} catch (err) {
		console.error('Failed to create lead:', err);
		return json({ success: false, errors: { _form: 'Something went wrong. Please try again.' } }, { status: 500 });
	}
};
