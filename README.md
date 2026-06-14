# Roof Replacement Cost Calculator

Static AI-style roof decision system for homeowners planning a roof repair or replacement.

## Purpose

This project helps homeowners estimate roof replacement cost, understand repair vs replace risk, and unlock a full AI-style roof decision report using a lightweight lead capture flow.

## Features

- Static single-page website built with HTML, CSS, and vanilla JavaScript
- Roof replacement cost estimate
- AI-style final decision: Replace, Repair, or Monitor
- Risk level, urgency, confidence score, and reasoning
- Email and ZIP lead capture unlock flow using Formspree
- SEO-ready metadata, sitemap, robots.txt, favicon, and web manifest
- Static frontend with Formspree lead submission

## Project Structure

```txt
index.html
style.css
script.js
favicon.svg
robots.txt
sitemap.xml
site.webmanifest
```

## Deployment

### Vercel

1. Push this repository to GitHub.
2. In Vercel, choose Add New Project.
3. Import the GitHub repository.
4. Use Framework Preset: Other.
5. Leave Build Command empty.
6. Leave Output Directory empty.
7. Deploy.

### Netlify

1. Push this repository to GitHub.
2. In Netlify, choose Add new site from Git.
3. Import the repository.
4. Leave Build Command empty.
5. Set Publish Directory to the repository root.
6. Deploy.

### GitHub Pages

1. Push this repository to GitHub.
2. Go to repository Settings.
3. Open Pages.
4. Set Source to Deploy from a branch.
5. Select branch: main.
6. Select folder: /root.
7. Save.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Lead Capture With Formspree

This project uses Formspree as the production lead collection backend.

### Create A Formspree Form

1. Go to https://formspree.io/.
2. Create or log in to your account.
3. Create a new form.
4. Copy the form endpoint. It should look similar to:

```txt
https://formspree.io/f/your-form-id
```

### Paste The Endpoint

Open `script.js` and replace this placeholder at the top of the file:

```js
const FORMSPREE_ENDPOINT = "PASTE_FORMSPREE_ENDPOINT_HERE";
```

with your real endpoint:

```js
const FORMSPREE_ENDPOINT = "https://formspree.io/f/your-form-id";
```

### Test Lead Submission

1. Deploy the site or open it locally.
2. Complete the roof estimate form.
3. Click `Get My AI Roof Decision Report`.
4. Enter a test email and ZIP code.
5. Submit the modal form.
6. Confirm the full report unlocks.
7. Check the Formspree dashboard for the submitted lead.

If the endpoint is still set to `PASTE_FORMSPREE_ENDPOINT_HERE`, the app runs in demo mode. Demo mode unlocks the report for testing, logs a console warning, and does not save leads.

### Fields Collected

- `email`
- `zip`
- `state`
- `roofSize`
- `roofAge`
- `leaks`
- `roofType`
- `estimatedCostRange`
- `confidence`
- `finalDecision`
- `riskLevel`
- `urgency`
- `createdAt`
- `sourcePage`
