import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(year: number, make: string, model: string, trim: string | null, vin: string): string {
	const parts = [year, make, model, trim].filter(Boolean).map(p => String(p).toLowerCase().replace(/\s+/g, '-'));
	const vinSuffix = vin.slice(-8).toLowerCase();
	return `${parts.join('-')}-${vinSuffix}`;
}

const vehicles = [
	{
		vin: '5TFDY5F13MX265432',
		stockNumber: 'NH001',
		year: 2021,
		make: 'Toyota',
		model: 'Tundra',
		trim: 'SR5',
		bodyType: 'TRUCK' as const,
		exteriorColor: 'Magnetic Gray',
		interiorColor: 'Graphite',
		mileage: 38500,
		engine: '5.7L V8',
		transmission: 'Automatic',
		drivetrain: '4WD',
		price: 38995,
		internetPrice: 37495,
		condition: 'EXCELLENT' as const,
		description: 'One-owner Toyota Tundra SR5 in excellent condition. Well-maintained with full service records. Features include Toyota Safety Sense, backup camera, and Bluetooth connectivity.',
		features: JSON.stringify(['Toyota Safety Sense', 'Backup Camera', 'Bluetooth', 'Bed Liner', 'Tow Package', 'Running Boards', 'LED Headlights'])
	},
	{
		vin: '1GCUYDED5MZ324567',
		stockNumber: 'NH002',
		year: 2021,
		make: 'Chevrolet',
		model: 'Silverado 1500',
		trim: 'LT',
		bodyType: 'TRUCK' as const,
		exteriorColor: 'Summit White',
		interiorColor: 'Jet Black',
		mileage: 42100,
		engine: '5.3L V8',
		transmission: 'Automatic',
		drivetrain: '4WD',
		price: 36995,
		internetPrice: 35995,
		condition: 'GOOD' as const,
		description: 'Clean Chevrolet Silverado 1500 LT with the popular 5.3L V8. Great truck for work or play with a clean Carfax report.',
		features: JSON.stringify(['Apple CarPlay', 'Android Auto', 'Trailering Package', 'Remote Start', 'Heated Seats', 'Spray-In Bed Liner'])
	},
	{
		vin: '5TDKZ3DC8MS123456',
		stockNumber: 'NH003',
		year: 2021,
		make: 'Toyota',
		model: 'Highlander',
		trim: 'XLE',
		bodyType: 'SUV' as const,
		exteriorColor: 'Blueprint',
		interiorColor: 'Black',
		mileage: 29800,
		engine: '3.5L V6',
		transmission: 'Automatic',
		drivetrain: 'AWD',
		price: 35995,
		internetPrice: 34995,
		condition: 'EXCELLENT' as const,
		description: 'Premium Toyota Highlander XLE with third-row seating. Perfect family SUV with low mileage and loaded with features.',
		features: JSON.stringify(['Third Row Seating', 'Sunroof', 'Leather Seats', 'Navigation', 'Blind Spot Monitor', 'Power Liftgate', 'JBL Audio'])
	},
	{
		vin: '5NPD84LF2MH456789',
		stockNumber: 'NH004',
		year: 2021,
		make: 'Hyundai',
		model: 'Elantra',
		trim: 'SEL',
		bodyType: 'SEDAN' as const,
		exteriorColor: 'Phantom Black',
		interiorColor: 'Gray',
		mileage: 35200,
		engine: '2.0L 4-Cylinder',
		transmission: 'CVT',
		drivetrain: 'FWD',
		price: 19995,
		internetPrice: 18995,
		condition: 'GOOD' as const,
		description: 'Stylish Hyundai Elantra SEL with excellent fuel economy. Great commuter car with a 10-year powertrain warranty.',
		features: JSON.stringify(['Apple CarPlay', 'Android Auto', 'Blind Spot Monitor', 'Lane Keep Assist', 'Wireless Phone Charger'])
	},
	{
		vin: '1G1YY22G5P5108765',
		stockNumber: 'NH005',
		year: 2023,
		make: 'Chevrolet',
		model: 'Corvette',
		trim: 'Stingray',
		bodyType: 'COUPE' as const,
		exteriorColor: 'Torch Red',
		interiorColor: 'Adrenaline Red',
		mileage: 8200,
		engine: '6.2L V8',
		transmission: 'Automatic',
		drivetrain: 'RWD',
		price: 62995,
		internetPrice: 61995,
		condition: 'EXCELLENT' as const,
		description: 'Low-mileage C8 Corvette Stingray in stunning Torch Red. Mid-engine performance with everyday drivability. A head-turner!',
		features: JSON.stringify(['Performance Exhaust', 'Head-Up Display', 'Bose Audio', 'GT2 Seats', 'Magnetic Ride Control', 'Front Lift System'])
	},
	{
		vin: 'JF2SKASC8MH567890',
		stockNumber: 'NH006',
		year: 2021,
		make: 'Subaru',
		model: 'Forester',
		trim: 'Premium',
		bodyType: 'SUV' as const,
		exteriorColor: 'Crystal White Pearl',
		interiorColor: 'Gray',
		mileage: 31400,
		engine: '2.5L 4-Cylinder',
		transmission: 'CVT',
		drivetrain: 'AWD',
		price: 27995,
		internetPrice: 26995,
		condition: 'GOOD' as const,
		description: 'Reliable Subaru Forester Premium with standard AWD. Great for Texas weather and weekend adventures.',
		features: JSON.stringify(['EyeSight Driver Assist', 'Panoramic Sunroof', 'Heated Seats', 'Roof Rails', 'Automatic Climate Control'])
	},
	{
		vin: '1HGCY1F38PA890123',
		stockNumber: 'NH007',
		year: 2023,
		make: 'Honda',
		model: 'Accord',
		trim: 'Sport',
		bodyType: 'SEDAN' as const,
		exteriorColor: 'Meteorite Gray',
		interiorColor: 'Black',
		mileage: 18900,
		engine: '1.5L Turbo',
		transmission: 'CVT',
		drivetrain: 'FWD',
		price: 29995,
		internetPrice: 28995,
		condition: 'EXCELLENT' as const,
		description: 'Nearly new Honda Accord Sport with low miles. The gold standard in midsize sedans — reliable, efficient, and fun to drive.',
		features: JSON.stringify(['Honda Sensing Suite', 'Wireless Apple CarPlay', 'Android Auto', 'Adaptive Cruise Control', 'Sport Pedals', '19-inch Wheels'])
	},
	{
		vin: 'WA1AAAFY7M2345678',
		stockNumber: 'NH008',
		year: 2021,
		make: 'Audi',
		model: 'Q5',
		trim: 'Premium Plus',
		bodyType: 'SUV' as const,
		exteriorColor: 'Navarra Blue',
		interiorColor: 'Okapi Brown',
		mileage: 41200,
		engine: '2.0L Turbo',
		transmission: 'Automatic',
		drivetrain: 'AWD',
		price: 34995,
		internetPrice: 33995,
		condition: 'GOOD' as const,
		description: 'Luxury Audi Q5 Premium Plus with quattro AWD. Beautiful Navarra Blue with brown leather interior. Premium audio and tech package.',
		features: JSON.stringify(['Virtual Cockpit', 'Bang & Olufsen Audio', 'Panoramic Sunroof', 'Navigation', 'Heated/Cooled Seats', 'Power Liftgate'])
	},
	{
		vin: '3C4PDCAB5MT901234',
		stockNumber: 'NH009',
		year: 2021,
		make: 'Jeep',
		model: 'Wrangler',
		trim: 'Sahara',
		bodyType: 'SUV' as const,
		exteriorColor: 'Sarge Green',
		interiorColor: 'Black',
		mileage: 33700,
		engine: '3.6L V6',
		transmission: 'Automatic',
		drivetrain: '4WD',
		price: 39995,
		internetPrice: 38995,
		condition: 'GOOD' as const,
		description: 'Iconic Jeep Wrangler Sahara Unlimited in Sarge Green. 4-door with removable top and doors. Trail-rated and ready for adventure.',
		features: JSON.stringify(['Removable Hard Top', 'Trail Rated', 'LED Lighting', 'Alpine Audio', 'Uconnect 8.4"', 'Heated Steering Wheel'])
	},
	{
		vin: 'YV4A22PL5N1234567',
		stockNumber: 'NH010',
		year: 2022,
		make: 'Volvo',
		model: 'V60',
		trim: 'T5 Momentum',
		bodyType: 'WAGON' as const,
		exteriorColor: 'Crystal White',
		interiorColor: 'Charcoal',
		mileage: 22500,
		engine: '2.0L Turbo',
		transmission: 'Automatic',
		drivetrain: 'FWD',
		price: 33995,
		internetPrice: 32995,
		condition: 'EXCELLENT' as const,
		description: 'Elegant Volvo V60 wagon — the perfect blend of style, safety, and practicality. Low mileage and impeccably maintained.',
		features: JSON.stringify(['Pilot Assist', 'Harman Kardon Audio', 'Panoramic Roof', 'Heated Seats', 'City Safety', 'Apple CarPlay'])
	}
];

const leads = [
	{ firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '(972) 555-1234', source: 'WEBSITE' as const, status: 'NEW' as const, message: 'Interested in the Toyota Tundra. Can I schedule a test drive this weekend?' },
	{ firstName: 'Mike', lastName: 'Chen', email: 'mchen@email.com', phone: '(469) 555-5678', source: 'CHAT' as const, status: 'CONTACTED' as const, message: 'Looking for an SUV for my family, budget around $35K' },
	{ firstName: 'Lisa', lastName: 'Martinez', email: 'lisa.m@email.com', phone: '(214) 555-9012', source: 'WEBSITE' as const, status: 'APPOINTMENT_SET' as const, message: 'Want to see the Honda Accord Sport' },
	{ firstName: 'James', lastName: 'Williams', email: 'jwilliams@email.com', phone: '(972) 555-3456', source: 'FACEBOOK' as const, status: 'NEW' as const, message: 'Just moved to McKinney, need a reliable car' },
	{ firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', phone: '(469) 555-7890', source: 'WEBSITE' as const, status: 'SHOWED' as const, message: 'Interested in financing the Jeep Wrangler' }
];

async function main() {
	console.log('Seeding database...');

	// Clean existing data
	await prisma.chatMessage.deleteMany();
	await prisma.chatConversation.deleteMany();
	await prisma.leadNote.deleteMany();
	await prisma.appointment.deleteMany();
	await prisma.financeApplication.deleteMany();
	await prisma.lead.deleteMany();
	await prisma.vehiclePhoto.deleteMany();
	await prisma.vehicle.deleteMany();
	await prisma.session.deleteMany();
	await prisma.page.deleteMany();
	await prisma.user.deleteMany();

	// Create admin user
	const admin = await prisma.user.create({
		data: {
			email: 'daniel@newhopemotors.com',
			supabaseId: null,
			name: 'Daniel',
			role: 'ADMIN',
			passwordHash: 'supabase-managed',
			isActive: true
		}
	});
	console.log(`Created admin user: ${admin.email}`);

	// Create vehicles with photos
	for (const v of vehicles) {
		const slug = generateSlug(v.year, v.make, v.model, v.trim, v.vin);
		const vehicle = await prisma.vehicle.create({
			data: {
				...v,
				slug,
				photos: {
					create: {
						url: `https://placehold.co/800x600/2D5F3E/FAFAF7?text=${v.year}+${v.make}+${v.model}`,
						sortOrder: 0,
						isPrimary: true,
						alt: `${v.year} ${v.make} ${v.model} ${v.trim}`
					}
				}
			}
		});
		console.log(`Created vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
	}

	// Get first vehicle for lead associations
	const firstVehicle = await prisma.vehicle.findFirst();

	// Create leads
	for (const l of leads) {
		const lead = await prisma.lead.create({
			data: {
				...l,
				vehicleId: firstVehicle?.id
			}
		});
		console.log(`Created lead: ${lead.firstName} ${lead.lastName}`);
	}

	console.log('\nSeed complete!');
	console.log(`- 1 admin user`);
	console.log(`- ${vehicles.length} vehicles with photos`);
	console.log(`- ${leads.length} leads`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
