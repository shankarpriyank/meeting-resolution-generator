import type { ResolutionData } from '@/types/resolution';
import { getJurisdictionConfig } from './prompts/jurisdiction-config';

/**
 * Convert resolution data to HTML document
 * Generates jurisdiction-aware HTML formatting
 *
 * @param data - The resolution data object
 * @param jurisdiction - Optional jurisdiction for formatting (defaults to Ireland)
 * @returns HTML string representation of the resolution
 */
export const convertToHTML = (
  data: ResolutionData,
  jurisdiction?: string
): string => {
  const config = getJurisdictionConfig(jurisdiction || 'Ireland');

  // Get disclosure text - use data or fall back to jurisdiction standard
  const disclosureText =
    data.disclosureOfInterest || config.standardPhrases.disclosure;
  const filingText =
    data.filingInstructions || config.standardPhrases.filing;
  const closingText =
    data.closingStatement || config.standardPhrases.closing;

  return `
        <div class="resolution-document">
            <div class="mb-2" style="text-align: center;">
                <p class="text-xs text-gray-400 mb-4" style="text-align: center;">BOARD MEETING MINUTES: ${config.region.toUpperCase()} - ${data.agreementType ? 'APPROVAL OF AGREEMENT / CONTRACT' : (data.meetingType?.toUpperCase() || 'BOARD MEETING')}</p>
            </div>

            <div class="mb-8" style="text-align: center;">
                <h3 class="font-bold text-lg mb-1" style="text-align: center;">${data.entityName || '[To be confirmed]'}</h3>
                <p class="text-sm text-gray-400" style="text-align: center;">(the "Company")</p>
            </div>

            <div class="mb-6">
                <p class="text-sm">Minutes of a meeting of the board of the Company (the "Board") duly convened, constituted and held at ${data.meetingLocation || '[To be confirmed]'} on ${data.meetingDate || '[To be confirmed]'} at ${data.meetingTime || '[To be confirmed]'}.</p>
            </div>

            ${
              data.directors && data.directors.length > 0
                ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">PRESENT</th>
                            <th class="text-left py-2">POSITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.directors
                          .map(
                            (d) => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${d.name}</td>
                                <td class="py-2">${d.position}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            ${
              data.attendees && data.attendees.length > 0
                ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">IN ATTENDANCE</th>
                            <th class="text-left py-2">COMPANY</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.attendees
                          .map(
                            (a) => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${a.name}</td>
                                <td class="py-2">${a.company}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            <div class="mb-6">
                <h3 class="font-semibold mb-2">1. Chairperson</h3>
                <p>It was agreed that ${data.chairperson || '[To be confirmed]'} would Chair the meeting.</p>
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">2. Quorum</h3>
                <p>${data.quorumNoted || 'The Chairperson noted that a quorum of directors was present for the meeting.'}</p>
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">3. Disclosure of Interest</h3>
                <p>${disclosureText}</p>
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">4. Business of the meeting</h3>
                ${
                  data.businessPurpose
                    ? `<p>${data.agreementType
                        ? 'The Chairperson reported that the purpose of the meeting was to consider and, if deemed fit:'
                        : 'The Chairperson reported that the meeting had been convened to consider:'}</p>
                <p class="mt-2">${data.businessPurpose}</p>`
                    : '<p>No resolutions were passed in respect of this matter.</p>'
                }
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">5. ${data.agreementType ? 'Approval of Agreement' : 'Resolutions'}</h3>
                ${
                  data.agreementType
                    ? `<p class="mb-2"><strong>5.1</strong> The following documents were produced to the meeting:</p>
                <p class="ml-4">A draft of the ${data.agreementType}${data.counterpartyName ? ` with ${data.counterpartyName}` : ''}.</p>`
                    : ''
                }
                ${
                  data.approvalOfAgreement && data.approvalOfAgreement.length > 0
                    ? data.approvalOfAgreement
                        .map(
                          (r) => `<p class="mb-4"><strong>${r.section}</strong> ${r.text}</p>`
                        )
                        .join('')
                    : '<p>No resolutions were passed in respect of this matter.</p>'
                }
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">6. Further and Prior Acts</h3>
                ${
                  data.furtherAndPriorActs && data.furtherAndPriorActs.length > 0
                    ? data.furtherAndPriorActs
                        .map(
                          (r) => `<p class="mb-4"><strong>${r.section}</strong> ${r.text}</p>`
                        )
                        .join('')
                    : '<p>No resolutions were passed in respect of this matter.</p>'
                }
            </div>

            <div class="mb-6">
                <h3 class="font-semibold mb-2">7. Filing</h3>
                <p>${filingText}</p>
            </div>

            <div class="mb-8">
                <h3 class="font-semibold mb-2">8. Close</h3>
                <p>${closingText}</p>
            </div>

            <div class="mt-12 pt-6">
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <div class="border-t border-gray-600 pt-2">
                            <p class="text-sm text-gray-400">Chairperson</p>
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
