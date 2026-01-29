import { describe, it, expect } from 'vitest';
import { convertToHTML } from '@/lib/resolution-html';

describe('resolution-html convertToHTML', () => {
  it('should generate HTML with entity name and date', () => {
    const data = {
      entityName: 'Acme Corporation',
      meetingDate: 'January 15, 2024',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Acme Corporation');
    expect(html).toContain('January 15, 2024');
  });

  it('should use placeholder text when data is missing', () => {
    const data = {};

    const html = convertToHTML(data);
    expect(html).toContain('[To be determined]');
  });

  it('should render meeting location and time', () => {
    const data = {
      entityName: 'Test Corp',
      meetingLocation: 'Board Room A',
      meetingTime: '10:00 AM',
      meetingType: 'Board Meeting',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Board Room A');
    expect(html).toContain('10:00 AM');
    expect(html).toContain('Board Meeting');
  });

  it('should render directors table when directors are provided', () => {
    const data = {
      entityName: 'Test Corp',
      directors: [
        { name: 'John Smith', position: 'Director' },
        { name: 'Jane Doe', position: 'Chairman' },
      ],
    };

    const html = convertToHTML(data);
    expect(html).toContain('John Smith');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Director');
    expect(html).toContain('Chairman');
    expect(html).toContain('PRESENT');
    expect(html).toContain('POSITION');
  });

  it('should not render directors table when no directors provided', () => {
    const data = {
      entityName: 'Test Corp',
      directors: [],
    };

    const html = convertToHTML(data);
    expect(html).not.toContain('PRESENT');
  });

  it('should render attendees table when attendees are provided', () => {
    const data = {
      entityName: 'Test Corp',
      attendees: [
        { name: 'Alice Brown', company: 'Legal LLC' },
        { name: 'Bob Wilson', company: 'Accounting Inc' },
      ],
    };

    const html = convertToHTML(data);
    expect(html).toContain('Alice Brown');
    expect(html).toContain('Legal LLC');
    expect(html).toContain('Bob Wilson');
    expect(html).toContain('Accounting Inc');
    expect(html).toContain('IN ATTENDANCE');
  });

  it('should render chairperson section', () => {
    const data = {
      entityName: 'Test Corp',
      chairperson: 'John Smith',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Chairperson');
    expect(html).toContain('John Smith');
    expect(html).toContain('would Chair the meeting');
  });

  it('should render quorum section', () => {
    const data = {
      entityName: 'Test Corp',
      quorumNoted: 'A quorum of directors was present for the meeting.',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Quorum');
    expect(html).toContain('A quorum of directors was present for the meeting.');
  });

  it('should render disclosure of interest section', () => {
    const data = {
      entityName: 'Test Corp',
      disclosureOfInterest: 'No conflicts of interest were disclosed.',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Disclosure of Interest');
    expect(html).toContain('No conflicts of interest were disclosed.');
  });

  it('should render business purpose section', () => {
    const data = {
      entityName: 'Test Corp',
      businessPurpose: 'To approve the annual budget.',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Business of the meeting');
    expect(html).toContain('To approve the annual budget.');
  });

  it('should render agreement type with counterparty', () => {
    const data = {
      entityName: 'Test Corp',
      agreementType: 'Service Agreement',
      counterpartyName: 'Vendor Inc',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Approval of Agreement');
    expect(html).toContain('Service Agreement');
    expect(html).toContain('Vendor Inc');
  });

  it('should render approval of agreement resolutions', () => {
    const data = {
      entityName: 'Test Corp',
      approvalOfAgreement: [
        { section: '5.2', text: 'IT WAS RESOLVED that the Agreement was approved.' },
        { section: '5.3', text: 'IT WAS FURTHER RESOLVED to authorize execution.' },
      ],
    };

    const html = convertToHTML(data);
    expect(html).toContain('5.2');
    expect(html).toContain('IT WAS RESOLVED that the Agreement was approved.');
    expect(html).toContain('5.3');
    expect(html).toContain('IT WAS FURTHER RESOLVED to authorize execution.');
  });

  it('should render further and prior acts resolutions', () => {
    const data = {
      entityName: 'Test Corp',
      furtherAndPriorActs: [
        { section: '6.1', text: 'IT WAS RESOLVED to authorize further acts.' },
        { section: '6.2', text: 'IT WAS FURTHER RESOLVED to ratify prior acts.' },
      ],
    };

    const html = convertToHTML(data);
    expect(html).toContain('Further and Prior Acts');
    expect(html).toContain('6.1');
    expect(html).toContain('IT WAS RESOLVED to authorize further acts.');
    expect(html).toContain('6.2');
  });

  it('should render filing instructions', () => {
    const data = {
      entityName: 'Test Corp',
      filingInstructions: 'File with the Companies Registration Office.',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Filing');
    expect(html).toContain('File with the Companies Registration Office.');
  });

  it('should render closing statement', () => {
    const data = {
      entityName: 'Test Corp',
      closingStatement: 'There was no further business and the meeting was closed.',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Close');
    expect(html).toContain('There was no further business and the meeting was closed.');
  });

  it('should render signature sections', () => {
    const data = {
      entityName: 'Test Corp',
    };

    const html = convertToHTML(data);
    expect(html).toContain('Secretary Signature');
    expect(html).toContain('Date');
  });

  it('should have proper HTML structure', () => {
    const data = {
      entityName: 'Full Document Corp',
      meetingDate: 'January 1, 2024',
      meetingLocation: 'Conference Room',
      meetingTime: '9:00 AM',
      meetingType: 'Annual Meeting',
      directors: [{ name: 'John Smith', position: 'Director' }],
    };

    const html = convertToHTML(data);
    expect(html).toContain('class="resolution-document"');
    expect(html).toContain('<table');
    expect(html).toContain('<div');
  });
});
