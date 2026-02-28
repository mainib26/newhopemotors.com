import { insertRow } from '$lib/server/supabase-rest';

interface CreateLeadInput {
	firstName: string;
	lastName?: string;
	email?: string;
	phone?: string;
	message?: string;
	source?: string;
	vehicleId?: string;
}

export async function createLead(input: CreateLeadInput) {
	const payload = {
		first_name: input.firstName,
		last_name: input.lastName || null,
		email: input.email || null,
		phone: input.phone || null,
		message: input.message || null,
		source: input.source || 'WEBSITE',
		vehicle_id: input.vehicleId || null,
		status: 'NEW'
	};

	return insertRow('leads', payload);
}

export function validateLeadInput(data: FormData): {
	valid: boolean;
	errors: Record<string, string>;
	values: CreateLeadInput;
} {
	const firstName = (data.get('firstName') as string)?.trim() || '';
	const lastName = (data.get('lastName') as string)?.trim() || '';
	const email = (data.get('email') as string)?.trim() || '';
	const phone = (data.get('phone') as string)?.trim() || '';
	const message = (data.get('message') as string)?.trim() || '';
	const vehicleId = (data.get('vehicleId') as string)?.trim() || '';
	const source = (data.get('source') as string)?.trim() || 'WEBSITE';

	const errors: Record<string, string> = {};

	if (!firstName) {
		errors.firstName = 'Name is required';
	}

	if (!email && !phone) {
		errors.phone = 'Please provide a phone number or email';
	}

	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = 'Please enter a valid email address';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
		values: { firstName, lastName, email, phone, message, vehicleId, source }
	};
}
