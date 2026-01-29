import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests - Real API Calls
 *
 * These tests hit actual APIs (OpenAI, Anthropic, Supabase)
 * - Requires valid API keys in environment
 * - Tests the complete user workflow
 *
 * Run with: npm run test:e2e
 */

// Increase timeout for real API calls
test.setTimeout(180000); // 3 minutes per test

/**
 * Helper to fill the meeting form
 */
async function fillMeetingForm(page: import('@playwright/test').Page, title?: string) {
  // Fill meeting title
  await page.locator('#meetingTitle').fill(title || 'E2E Test Meeting - ' + Date.now());

  // Fill entity
  await page.locator('#entity').fill('E2E Test Corporation');

  // Fill jurisdiction
  await page.locator('#jurisdiction').fill('Delaware');

  // Select meeting type (required!) - Board Meeting is selected by default, but click to ensure
  const boardMeetingBtn = page.getByRole('button', { name: 'Board Meeting' });
  await boardMeetingBtn.click();
  // Wait for the button to show selected state (bg-white class)
  await expect(boardMeetingBtn).toHaveClass(/bg-white/);

  // Select date using the date picker
  const datePickerButton = page.locator('button').filter({ hasText: /pick a date|dd\/mm\/yyyy/i });
  await datePickerButton.click();

  // Wait for calendar to be visible
  const calendar = page.locator('[role="grid"]');
  await expect(calendar).toBeVisible();

  // Click day 15 or any available day
  const calendarDay = page.locator('[role="gridcell"] button').filter({ hasText: /^15$/ }).first();
  if (await calendarDay.isVisible()) {
    await calendarDay.click();
  } else {
    await page.locator('[role="gridcell"] button').first().click();
  }

  // Calendar should auto-close after selection, verify date was selected
  await expect(calendar).not.toBeVisible({ timeout: 5000 });
}

/**
 * Helper to upload audio file
 */
async function uploadAudioFile(page: import('@playwright/test').Page) {
  const fileInput = page.locator('input[type="file"]');
  const audioFilePath = path.join(__dirname, 'fixtures', 'test-audio.mp3');
  await fileInput.setInputFiles(audioFilePath);

  // Verify file uploaded - wait for the filename to appear
  await expect(page.getByText(/test-audio\.mp3/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Helper to process meeting and wait for resolution view
 */
async function processAndWaitForResolution(page: import('@playwright/test').Page) {
  // Click process button
  const processButton = page.getByRole('button', { name: /process.*meeting/i });
  await expect(processButton).toBeEnabled({ timeout: 5000 });

  console.log('Clicking Process Meeting button...');
  await processButton.click();

  // Wait for the view to switch - look for resolution view indicators
  console.log('Waiting for resolution view to appear...');

  // Wait for the resolution view component to appear using data-testid
  const resolutionView = page.getByTestId('resolution-view');
  await expect(resolutionView).toBeVisible({ timeout: 30000 });

  console.log('Resolution view layout detected, waiting for processing to complete...');

  // Wait for the "Edit Manually" button to be enabled (not just visible)
  // This indicates that transcription and resolution generation are complete
  const editButton = page.getByRole('button', { name: /edit manually/i });
  await expect(editButton).toBeVisible({ timeout: 120000 });
  await expect(editButton).toBeEnabled({ timeout: 120000 });

  console.log('Transcription and resolution generation complete!');
}


// =============================================================================
// HOME PAGE TESTS
// =============================================================================

test.describe('Home Page', () => {
  test('should load home page and display meetings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should load
    await expect(page.locator('body')).toBeVisible();

    // Should have navigation
    const navContainer = page.locator('.sticky').first();
    await expect(navContainer).toBeVisible();
  });

  test('should navigate to transcribe page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the "New Meeting" button to navigate to transcribe
    const newMeetingButton = page.getByRole('button', { name: /new meeting/i });
    await expect(newMeetingButton).toBeVisible();
    await newMeetingButton.click();
    await expect(page).toHaveURL(/transcribe/);
  });
});


// =============================================================================
// TRANSCRIBE PAGE TESTS
// =============================================================================

test.describe('Transcribe Page', () => {
  test('should display form fields', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    // Check form fields exist
    await expect(page.locator('#meetingTitle')).toBeVisible();
    await expect(page.locator('#entity')).toBeVisible();
    await expect(page.locator('#jurisdiction')).toBeVisible();
  });

  test('should display meeting type buttons', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Board Meeting' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Committee Meeting' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Shareholder Meeting' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Special Meeting' })).toBeVisible();
  });

  test('should allow selecting meeting types', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    const committeeMeetingBtn = page.getByRole('button', { name: 'Committee Meeting' });
    await committeeMeetingBtn.click();

    await expect(committeeMeetingBtn).toHaveClass(/bg-white/);
  });

  test('should have process button disabled without required fields', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    const processButton = page.getByRole('button', { name: /process.*meeting/i });
    await expect(processButton).toBeDisabled();
  });

  test('should enable process button when form is complete', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await fillMeetingForm(page);
    await uploadAudioFile(page);

    const processButton = page.getByRole('button', { name: /process.*meeting/i });
    await expect(processButton).toBeEnabled({ timeout: 5000 });
  });

  test('should show uploaded file info', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await uploadAudioFile(page);

    await expect(page.getByText(/test-audio\.mp3/i)).toBeVisible();
  });
});


// =============================================================================
// COMPLETE WORKFLOW TESTS (Real API Calls)
// These tests require properly configured environment variables:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - OPENAI_API_KEY (for transcription)
// - ANTHROPIC_API_KEY (for resolution generation)
// - Supabase "audio" storage bucket must exist
// =============================================================================

test.describe('Complete Workflow', () => {

  test('should process meeting with real transcription and resolution', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    // Fill form
    await fillMeetingForm(page);

    // Upload audio
    await uploadAudioFile(page);

    // Process and wait for resolution
    await processAndWaitForResolution(page);

    // Verify all action buttons are present
    await expect(page.getByRole('button', { name: /accept draft/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
  });

  test('should edit resolution', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await fillMeetingForm(page);
    await uploadAudioFile(page);

    // Process and wait for resolution
    await processAndWaitForResolution(page);

    // Click edit
    const editButton = page.getByRole('button', { name: /edit manually/i });
    await editButton.click();

    // Should show editing state
    await expect(page.getByRole('button', { name: /editing/i })).toBeVisible();

    console.log('Edit mode enabled');
  });

  test('should download real PDF', async ({ page }) => {
    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await fillMeetingForm(page);
    await uploadAudioFile(page);

    // Process and wait for resolution
    await processAndWaitForResolution(page);

    // Download PDF
    const downloadButton = page.getByRole('button', { name: /download pdf/i });
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      downloadButton.click(),
    ]);

    expect(download.suggestedFilename()).toContain('.pdf');
    console.log('PDF downloaded:', download.suggestedFilename());
  });

  test('should save meeting to database', async ({ page }) => {
    const meetingTitle = 'DB Test - ' + Date.now();

    await page.goto('/transcribe');
    await page.waitForLoadState('networkidle');

    await fillMeetingForm(page, meetingTitle);
    await uploadAudioFile(page);

    // Process and wait for resolution
    await processAndWaitForResolution(page);

    // Accept to save
    const acceptButton = page.getByRole('button', { name: /accept draft/i });
    await acceptButton.click();

    // Wait for success toast or status change (button becomes disabled when status is COMPLETED)
    await expect(page.getByText(/accepted|saved/i)).toBeVisible({ timeout: 15000 });

    console.log('Meeting saved to database');

    // Navigate home and verify
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Meeting should appear in list
    const meetingCard = page.getByText(meetingTitle);
    await expect(meetingCard).toBeVisible({ timeout: 15000 });

    console.log('Meeting visible in list');
  });
});


// =============================================================================
// MONITORING PAGE TESTS
// =============================================================================

test.describe('Monitoring Page', () => {
  test('should load monitoring dashboard', async ({ page }) => {
    await page.goto('/monitoring');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display stats or empty state', async ({ page }) => {
    await page.goto('/monitoring');
    await page.waitForLoadState('networkidle');

    // Should have some content - either stats or dashboard title
    const pageContent = page.locator('body');
    await expect(pageContent).toContainText(/monitoring|dashboard|api|stats|calls/i, { timeout: 10000 });
  });
});
