# Mission 003B: Analytics Plan For Roof AI

## Goal

Measure whether visitors from manual outreach, Reddit, Facebook groups, and Nextdoor are converting into real Roof AI leads.

This plan does not require paid services. The simplest recommended setup is:

- Google Analytics 4 for visitor and event analytics
- Formspree dashboard for confirmed lead submissions
- Manual tracking CSV from Mission 003 for channel-level notes and estimated views

## Recommended Setup

Use Google Analytics 4 with lightweight event tracking on GitHub Pages.

Why this setup:

- Free
- Works on static sites
- No backend required
- Easy to install in `index.html`
- Can track visitor-to-lead funnel events
- Pairs well with Formspree lead counts

## Metrics To Track

| Metric | Source | Meaning |
|---|---|---|
| Visitors | GA4 | Number of users/sessions visiting the landing page |
| Button clicks | GA4 event | Clicks on primary CTA buttons |
| Form opens | GA4 event | Unlock modal opens |
| Form submissions | GA4 event | User submits email + ZIP form |
| Formspree leads | Formspree dashboard | Confirmed submissions received by backend |
| Conversion rate | Manual calculation | Formspree leads divided by visitors |

## Visitor-To-Lead Funnel

Recommended funnel:

1. Visitor lands on page
2. Visitor clicks primary CTA
3. Visitor completes roof estimate form
4. Visitor opens unlock modal
5. Visitor submits email + ZIP
6. Formspree accepts lead
7. Full AI roof report unlocks

## GA4 Event Plan

### Event: `cta_click`

Track when a visitor clicks a major CTA.

Suggested parameters:

- `cta_text`
- `cta_location`

Examples:

- `Check If You Need a Roof Replacement`
- `Get My AI Roof Decision Report`
- `Unlock Contractor Quotes`

### Event: `estimate_started`

Track when a visitor interacts with the roof estimate form for the first time.

Suggested parameters:

- `form_name`: `roof_estimate_form`

### Event: `estimate_submitted`

Track when the visitor submits the roof estimate form and sees the partial estimate.

Suggested parameters:

- `state`
- `roof_size`
- `roof_age`
- `leaks`
- `roof_type`

### Event: `lead_modal_opened`

Track when the email + ZIP unlock modal opens.

Suggested parameters:

- `modal_name`: `ai_roof_decision_report`

### Event: `lead_form_submitted`

Track when the user submits the email + ZIP form.

Important: do not send the actual email address to GA4.

Suggested parameters:

- `zip_prefix`: first 3 digits only, optional
- `form_name`: `lead_capture`

### Event: `lead_submission_success`

Track when Formspree returns success and the report unlocks.

Suggested parameters:

- `final_decision`
- `risk_level`
- `urgency`
- `confidence`

### Event: `lead_submission_error`

Track when Formspree returns an error.

Suggested parameters:

- `error_type`: generic value only

Do not send detailed personal information or raw Formspree error payloads to GA4.

## Privacy-Friendly Visitor Tracking Plan

### Do Track

- Page visits
- CTA clicks
- Estimate form completion
- Lead modal opens
- Lead form submission attempt
- Successful Formspree submission
- General report outcome such as final decision, risk level, and urgency

### Do Not Track In GA4

- Email address
- Full ZIP code if avoidable
- Name
- Address
- Phone number
- Free-text personal details
- Anything from Formspree that identifies the user

### ZIP Code Handling

Formspree should receive the full ZIP because it is part of the lead.

GA4 should either:

- not receive ZIP at all, or
- receive only the first 3 digits as a rough regional signal

Recommended for MVP:

- Do not send ZIP to GA4.
- Keep full ZIP only in Formspree.

### Cookie / Consent Note

For a small U.S.-focused MVP, GA4 can be used with a simple privacy note later. If targeting stricter privacy regions, add a cookie consent banner before firing analytics.

Current recommended MVP approach:

- Use GA4 only for anonymous product analytics.
- Do not send personal data to GA4.
- Keep lead data only in Formspree.

## Visitor-To-Lead Funnel Report Template

Use this daily during Mission 003.

| Date | Visitors | CTA Clicks | Form Opens | Form Submissions | Formspree Leads | Conversion Rate | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| YYYY-MM-DD | 0 | 0 | 0 | 0 | 0 | 0% | |

### Conversion Rate Formula

```txt
Conversion Rate = Formspree Leads / Visitors
```

Example:

```txt
5 leads / 100 visitors = 5%
```

## Validation Readout

Use the same Mission 003 thresholds:

- Red: 100 visitors, 0 leads
- Yellow: 100 visitors, 1-4 leads
- Green: 100 visitors, 5+ leads

## Implementation Instructions

### Step 1: Create GA4 Property

1. Go to Google Analytics.
2. Create a GA4 property for Roof AI.
3. Create a Web data stream.
4. Enter the GitHub Pages URL:

```txt
https://paullam85.github.io/project-alpha-001/
```

5. Copy the Measurement ID.

It will look like:

```txt
G-XXXXXXXXXX
```

### Step 2: Add GA4 Base Tag

Add the GA4 base script inside `index.html` before the closing `</head>` tag.

Template:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace both instances of `G-XXXXXXXXXX` with the real Measurement ID.

### Step 3: Add A Small Event Helper

Add this helper near the top of `script.js` after constants:

```js
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag(eventName, params);
  }
}
```

### Step 4: Track CTA Clicks

Add click listeners for:

- Hero primary CTA
- Hero secondary CTA
- Unlock modal buttons
- Contractor quote CTA

Example:

```js
trackEvent("cta_click", {
  cta_text: "Get My AI Roof Decision Report",
  cta_location: "lead_modal"
});
```

### Step 5: Track Estimate Submit

When the roof estimate form is submitted, track:

```js
trackEvent("estimate_submitted", {
  state: latestEstimate.state,
  roof_size: latestEstimate.size,
  roof_age: latestEstimate.age,
  leaks: latestEstimate.leaks,
  roof_type: latestEstimate.roofType
});
```

### Step 6: Track Modal Opens

When the unlock modal opens, track:

```js
trackEvent("lead_modal_opened", {
  modal_name: "ai_roof_decision_report"
});
```

### Step 7: Track Lead Submit Attempt

When the email + ZIP form is submitted, track:

```js
trackEvent("lead_form_submitted", {
  form_name: "lead_capture"
});
```

Do not send the email address to GA4.

### Step 8: Track Formspree Success

After Formspree returns success, track:

```js
trackEvent("lead_submission_success", {
  final_decision: latestEstimate.decision.action,
  risk_level: latestEstimate.risk.label,
  urgency: latestEstimate.urgency.label,
  confidence: latestEstimate.confidence
});
```

### Step 9: Track Formspree Failure

If Formspree fails, track:

```js
trackEvent("lead_submission_error", {
  error_type: "formspree_error"
});
```

### Step 10: Verify In GA4

1. Open the GitHub Pages site.
2. Open GA4 Realtime report.
3. Visit the page.
4. Click CTAs.
5. Submit the estimate form.
6. Open the lead modal.
7. Submit a test lead.
8. Confirm events appear in GA4 Realtime.
9. Confirm the lead appears in Formspree.

## Simplest Production Recommendation

Use:

- GA4 for visitors, clicks, modal opens, and funnel events
- Formspree for actual lead storage
- Mission 003 CSV for manual channel attribution

Do not add paid analytics, heatmaps, ad pixels, or complex attribution until the MVP reaches consistent lead volume.

