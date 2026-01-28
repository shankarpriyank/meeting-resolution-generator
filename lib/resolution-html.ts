interface ResolutionData {
    entityName?: string;
    meetingLocation?: string;
    meetingDate?: string;
    meetingTime?: string;
    meetingType?: string;
    directors?: Array<{ name: string; position: string }>;
    attendees?: Array<{ name: string; company: string }>;
    chairperson?: string;
    quorumNoted?: string;
    disclosureOfInterest?: string;
    businessPurpose?: string;
    agreementType?: string;
    counterpartyName?: string;
    approvalOfAgreement?: Array<{ section: string; text: string }>;
    furtherAndPriorActs?: Array<{ section: string; text: string }>;
    filingInstructions?: string;
    closingStatement?: string;
}

// Convert resolution data to HTML document
export const convertToHTML = (data: ResolutionData): string => {
    return `
        <div class="resolution-document">
            <div class="mb-8" style="text-align: center;">
                <h3 class="font-bold text-lg mb-1" style="text-align: center;">${data.entityName || '[To be determined]'}</h3>
                <p class="text-sm text-gray-400" style="text-align: center;">${data.meetingDate || '[To be determined]'}</p>
            </div>
            
            <div class="py-4 mb-6">
                <div class="grid grid-cols-1 text-sm">
                    <p><strong>Location:</strong> ${data.meetingLocation || '[To be determined]'}</p>
                    <p><strong>Time:</strong> ${data.meetingTime || '[To be determined]'}</p>
                    <p><strong>Meeting Type:</strong> ${data.meetingType || '[To be determined]'}</p>
                </div>
            </div>

            ${data.directors && data.directors.length > 0 ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">PRESENT</th>
                            <th class="text-left py-2">POSITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.directors.map(d => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${d.name}</td>
                                <td class="py-2">${d.position}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${data.attendees && data.attendees.length > 0 ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">IN ATTENDANCE</th>
                            <th class="text-left py-2">COMPANY</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.attendees.map(a => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${a.name}</td>
                                <td class="py-2">${a.company}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${data.chairperson ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">1. Chairperson</h3>
                <p>It was agreed that ${data.chairperson} would Chair the meeting.</p>
            </div>
            ` : ''}

            ${data.quorumNoted ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">2. Quorum</h3>
                <p>${data.quorumNoted}</p>
            </div>
            ` : ''}

            ${data.disclosureOfInterest ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">3. Disclosure of Interest</h3>
                <p>${data.disclosureOfInterest}</p>
            </div>
            ` : ''}

            ${data.businessPurpose ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">4. Business of the meeting</h3>
                <p>The Chairperson reported that the purpose of the meeting was to consider and, if deemed fit:</p>
                <p class="mt-2">${data.businessPurpose}</p>
            </div>
            ` : ''}

            ${data.agreementType ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">5. Approval of Agreement</h3>
                <p class="mb-2">5.1 The following documents were produced to the meeting:</p>
                <p class="ml-4">A draft of the ${data.agreementType}${data.counterpartyName ? ` with ${data.counterpartyName}` : ''}.</p>
            </div>
            ` : ''}

            ${data.approvalOfAgreement && data.approvalOfAgreement.length > 0 ? `
            <div class="mb-6">
                ${data.approvalOfAgreement.map(r => `
                    <p class="mb-4"><strong>${r.section}</strong> ${r.text}</p>
                `).join('')}
            </div>
            ` : ''}

            ${data.furtherAndPriorActs && data.furtherAndPriorActs.length > 0 ? `
            <div class="mb-6">
            <h3 class="font-semibold mb-2">6. Further and Prior Acts</h3>
                ${data.furtherAndPriorActs.map(r => `
                    <p class="mb-4"><strong>${r.section}</strong> ${r.text}</p>
                `).join('')}
            </div>
            ` : ''}

            ${data.filingInstructions ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">7. Filing</h3>
                <p>${data.filingInstructions}</p>
            </div>
            ` : ''}

            ${data.closingStatement ? `
            <div class="mb-8">
                <h3 class="font-semibold mb-2">8. Close</h3>
                <p>${data.closingStatement}</p>
            </div>
            ` : ''}

            <div class="mt-12 pt-6">
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <div class="border-t border-gray-600 pt-2">
                            <p class="text-sm text-gray-400">Secretary Signature</p>
                        </div>
                    </div>
                    <div>
                        <div class="border-t border-gray-600 pt-2">
                            <p class="text-sm text-gray-400">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
