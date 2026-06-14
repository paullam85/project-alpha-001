# Mission 003C: GA4 Analytics Setup

## Status

Basic GA4 support has been added with a placeholder Measurement ID.

No analytics events are sent until the placeholder is replaced with a real GA4 Measurement ID.

## Where To Paste The GA4 Measurement ID

Open `script.js` and replace this line near the top of the file:

```js
const GA_MEASUREMENT_ID = "REPLACE_WITH_GA4_ID";
```

with your real GA4 Measurement ID:

```js
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
```

The Measurement ID is available in Google Analytics:

1. Open Google Analytics.
2. Select the Roof AI property.
3. Go to Admin.
4. Open Data streams.
5. Select the Web stream.
6. Copy the Measurement ID.

## Events Tracked

The site tracks these GA4 events:

- `cta_click`
- `estimate_started`
- `estimate_submitted`
- `lead_modal_opened`
- `lead_form_submitted`
- `lead_submission_success`
- `lead_submission_error`

## Privacy Notes

The GA4 implementation does not send email addresses to Google Analytics.

Lead details are still sent to Formspree only after the user submits the email + ZIP form.

## How To Verify Events

1. Replace `REPLACE_WITH_GA4_ID` in `script.js`.
2. Commit and push to `main`.
3. Sync and push `gh-pages`.
4. Open the production site:

```txt
https://paullam85.github.io/project-alpha-001/
```

5. Open Google Analytics.
6. Go to Reports > Realtime.
7. Visit the page in a new browser tab.
8. Click the hero CTA.
9. Change one form field.
10. Submit the estimate form.
11. Open the lead modal.
12. Submit a test lead.
13. Confirm these events appear in Realtime:

```txt
cta_click
estimate_started
estimate_submitted
lead_modal_opened
lead_form_submitted
lead_submission_success
```

To test failure tracking, temporarily use an invalid Formspree endpoint in a local copy and submit the lead form. Confirm:

```txt
lead_submission_error
```

## How To View Funnel Data

In GA4:

1. Go to Explore.
2. Create a Funnel exploration.
3. Add these funnel steps:
   - Page visit
   - `cta_click`
   - `estimate_started`
   - `estimate_submitted`
   - `lead_modal_opened`
   - `lead_form_submitted`
   - `lead_submission_success`
4. Use `lead_submission_success` as the final lead conversion event.
5. Compare this count with Formspree submissions.

## Recommended Funnel Metrics

- Visitors: GA4 users or sessions
- Button clicks: `cta_click`
- Form opens: `lead_modal_opened`
- Form submissions: `lead_form_submitted`
- Formspree leads: Formspree dashboard and `lead_submission_success`
- Conversion rate: Formspree leads divided by visitors

