import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import type { AppointmentStatus, AppointmentType } from '@prisma/client';

const APPOINTMENT_TYPES: AppointmentType[] = ['TEST_DRIVE', 'CONSULTATION', 'FINANCE_REVIEW'];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];

const isAppointmentType = (value: string): value is AppointmentType => APPOINTMENT_TYPES.includes(value as AppointmentType);
const isAppointmentStatus = (value: string): value is AppointmentStatus => APPOINTMENT_STATUSES.includes(value as AppointmentStatus);

export const load: PageServerLoad = async ({ url }) => {
	const prisma = await db();

	const status = url.searchParams.get('status') ?? '';
	const dateStr = url.searchParams.get('date') ?? '';

	const where: any = {};
	if (status) where.status = status;
	if (dateStr) {
		const date = new Date(dateStr);
		const nextDay = new Date(date);
		nextDay.setDate(nextDay.getDate() + 1);
		where.date = { gte: date, lt: nextDay };
	}

	const appointments = await prisma.appointment.findMany({
		where,
		include: {
			lead: { select: { firstName: true, lastName: true, phone: true } },
			vehicle: { select: { year: true, make: true, model: true } }
		},
		orderBy: { date: 'asc' }
	});

	const leads = await prisma.lead.findMany({
		where: { status: { not: 'LOST' } },
		select: { id: true, firstName: true, lastName: true },
		orderBy: { createdAt: 'desc' },
		take: 50
	});

	const vehicles = await prisma.vehicle.findMany({
		where: { status: 'ACTIVE' },
		select: { id: true, year: true, make: true, model: true },
		orderBy: { createdAt: 'desc' }
	});

	return {
		appointments: appointments.map((a) => ({
			id: a.id,
			type: a.type,
			status: a.status,
			date: a.date.toISOString(),
			leadName: a.lead ? `${a.lead.firstName} ${a.lead.lastName ?? ''}`.trim() : '—',
			leadPhone: a.lead?.phone ?? '',
			vehicle: a.vehicle ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}` : null,
			notes: a.notes
		})),
		leads: leads.map((l) => ({ id: l.id, name: `${l.firstName} ${l.lastName ?? ''}`.trim() })),
		vehicles: vehicles.map((v) => ({ id: v.id, label: `${v.year} ${v.make} ${v.model}` })),
		filters: { status, date: dateStr }
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const leadId = formData.get('leadId')?.toString();
		const vehicleId = formData.get('vehicleId')?.toString() || null;
		const typeValue = formData.get('type')?.toString() || 'TEST_DRIVE';
		const dateStr = formData.get('date')?.toString();

		if (!leadId || !dateStr || !isAppointmentType(typeValue)) {
			return fail(400, { error: 'Valid lead, date, and type are required' });
		}

		const [_, timePart = '00:00'] = dateStr.split('T');
		const prisma = await db();
		await prisma.appointment.create({
			data: {
				leadId,
				vehicleId,
				type: typeValue,
				date: new Date(dateStr),
				startTime: timePart.substring(0, 5),
				status: 'SCHEDULED',
				notes: formData.get('notes')?.toString() || null
			}
		});

		return { created: true };
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const statusValue = formData.get('status')?.toString() ?? '';
		if (!id || !isAppointmentStatus(statusValue)) return fail(400);

		const prisma = await db();
		await prisma.appointment.update({ where: { id }, data: { status: statusValue } });
		return { updated: true };
	}
};
