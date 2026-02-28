interface LeadData {
	firstName: string;
	lastName?: string | null;
	email?: string | null;
	phone?: string | null;
	message?: string | null;
	source: string;
	vehicle?: {
		year: number;
		make: string;
		model: string;
		vin?: string | null;
		stockNumber?: string | null;
	} | null;
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function generateAdfXml(lead: LeadData): string {
	const timestamp = new Date().toISOString();

	let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?adf version="1.0"?>
<adf>
  <prospect status="new">
    <requestdate>${timestamp}</requestdate>
    <vehicle interest="buy" status="used">
`;

	if (lead.vehicle) {
		xml += `      <year>${lead.vehicle.year}</year>\n`;
		xml += `      <make>${escapeXml(lead.vehicle.make)}</make>\n`;
		xml += `      <model>${escapeXml(lead.vehicle.model)}</model>\n`;
		if (lead.vehicle.vin) xml += `      <vin>${escapeXml(lead.vehicle.vin)}</vin>\n`;
		if (lead.vehicle.stockNumber) xml += `      <stock>${escapeXml(lead.vehicle.stockNumber)}</stock>\n`;
	}

	xml += `    </vehicle>
    <customer>
      <contact>
        <name part="first">${escapeXml(lead.firstName)}</name>
`;

	if (lead.lastName) {
		xml += `        <name part="last">${escapeXml(lead.lastName)}</name>\n`;
	}
	if (lead.email) {
		xml += `        <email>${escapeXml(lead.email)}</email>\n`;
	}
	if (lead.phone) {
		xml += `        <phone type="voice">${escapeXml(lead.phone)}</phone>\n`;
	}

	xml += `      </contact>`;

	if (lead.message) {
		xml += `\n      <comments>${escapeXml(lead.message)}</comments>`;
	}

	xml += `
    </customer>
    <vendor>
      <vendorname>New Hope Motors</vendorname>
      <contact>
        <name part="full">Daniel</name>
        <phone type="voice">(972) 767-8434</phone>
      </contact>
    </vendor>
    <provider>
      <name part="full">New Hope Motors Website</name>
      <service>${escapeXml(lead.source)}</service>
    </provider>
  </prospect>
</adf>`;

	return xml;
}
