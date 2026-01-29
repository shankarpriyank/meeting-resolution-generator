/**
 * Jurisdiction Configuration for Resolution Generation
 *
 * Contains legal system configurations, standard phrases, and formatting
 * requirements for different jurisdictions.
 */

export interface JurisdictionConfig {
  legalSystem: string;
  governingLaw: string;
  companyType: string;
  primaryLaw: string;
  region: string;
  dateFormat: string;
  currencySymbol: string;
  filingAuthority: string;
  standardPhrases: {
    resolved: string;
    furtherResolved: string;
    disclosure: string;
    filing: string;
    closing: string;
  };
}

const JURISDICTION_CONFIGS: Record<string, JurisdictionConfig> = {
  Ireland: {
    legalSystem: 'Irish corporate governance and company law',
    governingLaw: 'the Companies Act 2014 (Ireland)',
    companyType: 'Irish companies',
    primaryLaw: 'The Companies Act 2014 (Ireland)',
    region: 'Ireland',
    dateFormat: 'DD Month YYYY',
    currencySymbol: '\u20AC',
    filingAuthority: 'Companies Registration Office',
    standardPhrases: {
      resolved: 'IT WAS RESOLVED that',
      furtherResolved: 'IT WAS FURTHER RESOLVED to',
      disclosure:
        'The Chairperson reminded the directors present that each director was required to disclose to the meeting if they are disqualified from participating in the meeting and/or the considerations, determinations and resolutions to be made. The Chairperson further reminded the directors that each director was required to disclose their interest in a contract or proposed contract with the Company to be considered at the meeting, or their interest in a contract which the Company has entered into, or a contract which was previously considered by the Board or a committee of the board of directors of which they are a member and in which they have since become interested.',
      filing:
        'The Chairperson instructed the company secretary to make all necessary and appropriate entries in the books and registers of the Company and to arrange for any necessary forms and documents to be filed at the Companies Registration Office.',
      closing:
        'There was no further business and the Chairperson declared the meeting closed.',
    },
  },
  India: {
    // Source: Companies Act, 2013 and iPleaders, TaxGuru templates
    legalSystem: 'Indian corporate governance and company law',
    governingLaw: 'the Companies Act, 2013 (India)',
    companyType: 'Indian companies (Private Limited / Public Limited)',
    primaryLaw:
      'The Companies Act, 2013 and applicable SEBI/RBI regulations',
    region: 'Indian',
    dateFormat: 'DD Month YYYY',
    currencySymbol: '\u20B9',
    filingAuthority:
      'Registrar of Companies (RoC) under the Ministry of Corporate Affairs',
    standardPhrases: {
      // Indian resolutions use "RESOLVED THAT" in bold/caps
      resolved: 'RESOLVED THAT',
      furtherResolved: 'RESOLVED FURTHER THAT',
      // Section 184 of Companies Act 2013 covers disclosure of interest
      disclosure:
        'The Chairman reminded the directors of their obligation under Section 184 of the Companies Act, 2013 to disclose their interest, directly or indirectly, in any contract or arrangement entered into or to be entered into by the Company. Directors confirmed that they had no interest to disclose in respect of the matters to be considered at the meeting.',
      filing:
        'The Company Secretary be and is hereby authorised to file necessary e-Forms with the Registrar of Companies within the prescribed time and to do all such acts, deeds and things as may be necessary to give effect to the above resolution.',
      closing:
        'There being no other business, the meeting was concluded with a vote of thanks to the Chair.',
    },
  },
  'USA-Delaware': {
    // Source: DGCL Section 141, SEC EDGAR filings, UpCounsel
    legalSystem: 'Delaware corporate law',
    governingLaw: 'the Delaware General Corporation Law (DGCL)',
    companyType: 'Delaware corporations',
    primaryLaw: 'Delaware General Corporation Law (Title 8, Chapter 1)',
    region: 'US (Delaware)',
    dateFormat: 'Month DD, YYYY',
    currencySymbol: '$',
    filingAuthority: 'Delaware Division of Corporations',
    standardPhrases: {
      // Delaware uses comma after RESOLVED
      resolved: 'RESOLVED, that',
      furtherResolved: 'RESOLVED FURTHER, that',
      // DGCL focuses on fiduciary duties rather than formal disclosure
      disclosure:
        'Each director present confirmed that they had no conflict of interest with respect to the matters to be considered at the meeting and that they would act in accordance with their fiduciary duties to the Corporation.',
      filing:
        'The Secretary of the Corporation be, and hereby is, authorized and directed to file any and all documents required to be filed with the Delaware Division of Corporations or any other governmental authority in connection with the foregoing resolutions.',
      closing:
        'There being no further business to come before the meeting, upon motion duly made and seconded, the meeting was adjourned.',
    },
  },
  UK: {
    // Source: Companies Act 2006 Section 248, 177; Simply-Docs, BoardCloud
    legalSystem: 'UK corporate governance and company law',
    governingLaw: 'the Companies Act 2006',
    companyType: 'UK companies (Limited / PLC)',
    primaryLaw: 'The Companies Act 2006',
    region: 'UK',
    dateFormat: 'DD Month YYYY',
    currencySymbol: '\u00A3',
    filingAuthority: 'Companies House',
    standardPhrases: {
      resolved: 'IT WAS RESOLVED that',
      furtherResolved: 'IT WAS FURTHER RESOLVED that',
      // Section 177 of Companies Act 2006 covers declaration of interest
      disclosure:
        'The Chairman reminded directors of their duty under section 177 of the Companies Act 2006 to declare the nature and extent of any interest, direct or indirect, in any proposed transaction or arrangement with the Company. No such interests were declared.',
      filing:
        'The Company Secretary was authorised to file any necessary documents with Companies House and to take all such steps as may be necessary to give effect to the resolutions passed at this meeting.',
      closing:
        'There being no further business, the Chairman declared the meeting closed.',
    },
  },
};

/**
 * Get jurisdiction configuration by jurisdiction name
 * Supports partial matching for common variations
 */
export function getJurisdictionConfig(
  jurisdiction: string
): JurisdictionConfig {
  // Try exact match first
  if (JURISDICTION_CONFIGS[jurisdiction]) {
    return JURISDICTION_CONFIGS[jurisdiction];
  }

  // Try partial match (e.g., "Delaware, USA" matches "USA-Delaware")
  const normalized = jurisdiction.toLowerCase();
  if (normalized.includes('india')) return JURISDICTION_CONFIGS['India'];
  if (normalized.includes('ireland')) return JURISDICTION_CONFIGS['Ireland'];
  if (normalized.includes('delaware'))
    return JURISDICTION_CONFIGS['USA-Delaware'];
  if (
    normalized.includes('uk') ||
    normalized.includes('united kingdom') ||
    normalized.includes('england') ||
    normalized.includes('britain')
  ) {
    return JURISDICTION_CONFIGS['UK'];
  }

  // Default to Ireland (as per original template)
  return JURISDICTION_CONFIGS['Ireland'];
}

/**
 * Get list of all supported jurisdictions
 */
export function getSupportedJurisdictions(): string[] {
  return Object.keys(JURISDICTION_CONFIGS);
}
