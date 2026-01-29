/**
 * Resolution-related types
 */

/**
 * Director information for resolutions
 */
export interface Director {
  name: string;
  position: string;
}

/**
 * Attendee information for resolutions
 */
export interface Attendee {
  name: string;
  company: string;
}

/**
 * Resolution section (for approval, further acts, etc.)
 */
export interface ResolutionSection {
  section: string;
  text: string;
}

/**
 * Full resolution data structure
 */
export interface ResolutionData {
  resolutionTitle?: string;
  documentTitle?: string;
  entityName?: string;
  meetingLocation?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingType?: string;
  directors?: Director[];
  attendees?: Attendee[];
  chairperson?: string;
  quorumNoted?: string;
  disclosureOfInterest?: string;
  businessPurpose?: string;
  agreementType?: string;
  counterpartyName?: string;
  approvalOfAgreement?: ResolutionSection[];
  furtherAndPriorActs?: ResolutionSection[];
  filingInstructions?: string;
  closingStatement?: string;
}
