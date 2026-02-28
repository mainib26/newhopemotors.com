export function autoDealer() {
	return {
		'@context': 'https://schema.org',
		'@type': 'AutoDealer',
		name: 'New Hope Motors',
		description: 'Trusted used car dealership in McKinney, TX. Quality inspected vehicles, honest pricing, and personal service.',
		url: 'https://newhopemotors.com',
		telephone: '(972) 767-8434',
		address: {
			'@type': 'PostalAddress',
			streetAddress: '3343 FM 1827',
			addressLocality: 'McKinney',
			addressRegion: 'TX',
			postalCode: '75071',
			addressCountry: 'US'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: 33.2,
			longitude: -96.6
		},
		openingHoursSpecification: [
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '18:00' }
		],
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.9',
			reviewCount: '45',
			bestRating: '5'
		},
		priceRange: '$10,000 - $60,000'
	};
}

export function vehicleSchema(vehicle: {
	year: number;
	make: string;
	model: string;
	trim?: string | null;
	price: number;
	mileage?: number | null;
	vin?: string | null;
	exteriorColor?: string | null;
	engine?: string | null;
	transmission?: string | null;
	drivetrain?: string | null;
	condition?: string | null;
	description?: string | null;
	slug: string;
	photo?: string | null;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Vehicle',
		name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim ?? ''}`.trim(),
		manufacturer: vehicle.make,
		model: vehicle.model,
		vehicleModelDate: String(vehicle.year),
		mileageFromOdometer: vehicle.mileage ? {
			'@type': 'QuantitativeValue',
			value: vehicle.mileage,
			unitCode: 'SMI'
		} : undefined,
		vehicleIdentificationNumber: vehicle.vin ?? undefined,
		color: vehicle.exteriorColor ?? undefined,
		vehicleEngine: vehicle.engine ? { '@type': 'EngineSpecification', name: vehicle.engine } : undefined,
		vehicleTransmission: vehicle.transmission ?? undefined,
		driveWheelConfiguration: vehicle.drivetrain ?? undefined,
		itemCondition: vehicle.condition === 'EXCELLENT' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
		description: vehicle.description ?? undefined,
		image: vehicle.photo ?? undefined,
		url: `https://newhopemotors.com/vehicle/${vehicle.slug}`,
		offers: {
			'@type': 'Offer',
			price: vehicle.price,
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
			seller: { '@type': 'AutoDealer', name: 'New Hope Motors' }
		}
	};
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};
}
