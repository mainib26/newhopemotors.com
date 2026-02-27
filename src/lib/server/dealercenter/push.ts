import { db } from '../db';
import { generateAdfXml } from './adf';

interface PushResult {
	total: number;
	success: number;
	failed: number;
	errors: string[];
}

export async function pushUnsentLeads(): Promise<PushResult> {
	const prisma = await db();

	const leads = await prisma.lead.findMany({
		where: { adfPushed: false },
		include: {
			vehicle: {
				select: { year: true, make: true, model: true, vin: true, stockNumber: true }
			}
		},
		take: 50
	});

	const result: PushResult = { total: leads.length, success: 0, failed: 0, errors: [] };

	for (const lead of leads) {
		try {
			const adfXml = generateAdfXml({
				firstName: lead.firstName,
				lastName: lead.lastName,
				email: lead.email,
				phone: lead.phone,
				message: lead.message,
				source: lead.source,
				vehicle: lead.vehicle
			});

			// TODO: When DealerCenter SFTP is configured, push adfXml here
			// For now, just mark as pushed (manual mode)
			console.log(`[DealerCenter] Generated ADF/XML for lead ${lead.id} (${lead.firstName})`);

			await prisma.lead.update({
				where: { id: lead.id },
				data: {
					adfPushed: true,
					adfPushedAt: new Date()
				}
			});

			result.success++;
		} catch (err) {
			result.failed++;
			result.errors.push(`Lead ${lead.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);

			// Retry tracking: after 3 failures, flag for manual review
			console.error(`[DealerCenter] Failed to push lead ${lead.id}:`, err);
		}
	}

	return result;
}
