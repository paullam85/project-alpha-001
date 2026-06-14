const FORMSPREE_ENDPOINT = "PASTE_FORMSPREE_ENDPOINT_HERE";

const form = document.getElementById("roof-form");
const resultCard = document.getElementById("result-card");
const unlockModal = document.getElementById("unlock-modal");
const leadForm = document.getElementById("lead-form");
let latestEstimate = null;
let isLeadSubmitting = false;
let hasUnlockedReport = false;
let hasWarnedDemoMode = false;

const sizeAdjustments = {
  "1000": 0,
  "1500": 2500,
  "2000": 5200,
  "2500": 8200,
  "3000": 11800
};

const ageAdjustments = {
  "0-5": -1200,
  "5-10": 0,
  "10-15": 1800,
  "15-20": 3600,
  "20+": 5600
};

const stateMultipliers = {
  Alabama: 0.95,
  Alaska: 1.28,
  Arizona: 1.03,
  Arkansas: 0.94,
  California: 1.22,
  Colorado: 1.1,
  Connecticut: 1.16,
  Delaware: 1.05,
  Florida: 1.08,
  Georgia: 0.98,
  Hawaii: 1.35,
  Idaho: 1.02,
  Illinois: 1.05,
  Indiana: 0.98,
  Iowa: 0.96,
  Kansas: 0.97,
  Kentucky: 0.96,
  Louisiana: 1.02,
  Maine: 1.08,
  Maryland: 1.1,
  Massachusetts: 1.18,
  Michigan: 1.03,
  Minnesota: 1.05,
  Mississippi: 0.94,
  Missouri: 0.97,
  Montana: 1.04,
  Nebraska: 0.98,
  Nevada: 1.07,
  "New Hampshire": 1.1,
  "New Jersey": 1.18,
  "New Mexico": 1,
  "New York": 1.16,
  "North Carolina": 0.99,
  "North Dakota": 1.03,
  Ohio: 0.99,
  Oklahoma: 0.96,
  Oregon: 1.12,
  Pennsylvania: 1.03,
  "Rhode Island": 1.14,
  "South Carolina": 0.98,
  "South Dakota": 0.98,
  Tennessee: 0.96,
  Texas: 1,
  Utah: 1.05,
  Vermont: 1.11,
  Virginia: 1.07,
  Washington: 1.14,
  "West Virginia": 0.95,
  Wisconsin: 1.02,
  Wyoming: 1.04
};

const roofTypeMultipliers = {
  "Asphalt Shingle": 1,
  "Metal Roof": 1.35,
  "Tile Roof": 1.5,
  "Flat Roof": 1.15
};

const leakAdjustments = {
  Yes: 4200,
  No: 0,
  "Not sure": 1800
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function getEstimatedCostRange(estimate) {
  return `${formatCurrency(estimate.low)} - ${formatCurrency(estimate.high)}`;
}

function isFormspreeConfigured() {
  return (
    FORMSPREE_ENDPOINT &&
    FORMSPREE_ENDPOINT !== "PASTE_FORMSPREE_ENDPOINT_HERE" &&
    FORMSPREE_ENDPOINT.startsWith("https://formspree.io/")
  );
}

function warnIfDemoMode() {
  if (!hasWarnedDemoMode) {
    console.warn(
      "Formspree endpoint is not configured. Demo mode is active: the report can unlock for testing, but leads are not saved."
    );
    hasWarnedDemoMode = true;
  }
}

function getDecision(age, leaks) {
  if (leaks === "Yes" || age === "20+" || age === "15-20") {
    return {
      action: "REPLACE",
      summary:
        "Replacement is the strongest planning decision based on the roof age or leak risk in your inputs."
    };
  }

  if ((age === "0-5" || age === "5-10") && leaks === "No") {
    return {
      action: "REPAIR",
      summary:
        "Repair is likely the first move because the roof is newer and no active leaks were reported."
    };
  }

  return {
    action: "MONITOR",
    summary:
      "Monitor condition and compare quotes before committing. Your inputs show enough uncertainty to plan ahead without rushing."
  };
}

function getCostFactors(state, size, age, leaks) {
  const sizeText = size === "3000" ? "3,000+ sqft" : `${Number(size).toLocaleString()} sqft`;
  const leakText =
    leaks === "Yes"
      ? "Active leaks can require decking repair, underlayment replacement, and faster scheduling."
      : leaks === "Not sure"
        ? "Unconfirmed leaks add inspection risk because hidden moisture can change the final scope."
        : "No reported leaks keeps the estimate closer to a standard replacement scope.";

  return [
    `${sizeText} roof size affects labor hours, disposal volume, and material quantity.`,
    `${age} roof age influences tear-off complexity and the chance of worn underlayment or decking.`,
    `${state} pricing reflects regional labor, code requirements, and market conditions. ${leakText}`
  ];
}

function getReasoning(estimate) {
  const sizeText =
    estimate.size === "3000" ? "3,000+ sqft" : `${Number(estimate.size).toLocaleString()} sqft`;
  const leakReason =
    estimate.leaks === "Yes"
      ? "Active leaks raise hidden damage risk."
      : estimate.leaks === "Not sure"
        ? "Unconfirmed leaks lower estimate certainty."
        : "No reported leaks reduces immediate risk.";

  return [
    `${estimate.age} roof age supports a ${estimate.decision.action.toLowerCase()} decision.`,
    `${sizeText} ${estimate.roofType.toLowerCase()} roof drives material and labor cost.`,
    leakReason
  ];
}

function getRiskLevel(age, leaks) {
  if (leaks === "Yes" || age === "20+") {
    return {
      label: "High",
      tone: "tone-high",
      detail: "Higher chance of hidden decking damage, moisture issues, or near-term failure."
    };
  }

  if (leaks === "Not sure" || age === "15-20" || age === "10-15") {
    return {
      label: "Medium",
      tone: "tone-medium",
      detail: "Inspection is recommended before committing to repeated repairs."
    };
  }

  return {
    label: "Low",
    tone: "tone-low",
    detail: "Current inputs suggest a lower near-term replacement risk."
  };
}

function getUrgency(age, leaks) {
  if (leaks === "Yes" || age === "20+") {
    return {
      label: "Immediate",
      tone: "tone-immediate",
      detail: "Start quote collection now to avoid water damage or emergency pricing."
    };
  }

  if (age === "15-20" || leaks === "Not sure") {
    return {
      label: "1-3 years",
      tone: "tone-medium",
      detail: "Plan budget and compare contractors before the roof becomes urgent."
    };
  }

  return {
    label: "3-5 years",
    tone: "tone-low",
    detail: "Monitor condition and keep a replacement budget on your planning horizon."
  };
}

function getConfidence(age, leaks, size) {
  let score = 88;

  if (leaks === "Not sure") score -= 12;
  if (size === "3000") score -= 4;
  if (age === "20+") score -= 5;
  if (leaks === "Yes") score -= 3;

  return Math.max(68, Math.min(94, score));
}

function calculateEstimate(formData) {
  const basePrice = 12000;
  const state = formData.get("state");
  const size = formData.get("size");
  const age = formData.get("age");
  const leaks = formData.get("leaks");
  const roofType = formData.get("roofType");

  const adjustedSubtotal =
    basePrice + sizeAdjustments[size] + ageAdjustments[age] + leakAdjustments[leaks];

  const roofAdjustedSubtotal = adjustedSubtotal * roofTypeMultipliers[roofType];
  const midpoint = Math.round(roofAdjustedSubtotal * stateMultipliers[state]);
  const low = Math.round(midpoint * 0.88 / 100) * 100;
  const high = Math.round(midpoint * 1.18 / 100) * 100;

  const decision = getDecision(age, leaks);
  const risk = getRiskLevel(age, leaks);
  const urgency = getUrgency(age, leaks);

  return {
    state,
    size,
    age,
    leaks,
    roofType,
    low,
    high,
    decision,
    risk,
    urgency,
    confidence: getConfidence(age, leaks, size),
    factors: getCostFactors(state, size, age, leaks)
  };
}

function openUnlockModal() {
  if (!latestEstimate) return;
  unlockModal.classList.add("is-open");
  unlockModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("lead-email").focus();
}

function closeUnlockModal() {
  unlockModal.classList.remove("is-open");
  unlockModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderPartialResult(estimate) {
  resultCard.classList.remove("result-card--empty");
  resultCard.innerHTML = `
    <div class="partial-report">
      <div class="ai-report-header">
        <div>
          <p class="eyebrow">Roof AI decision system</p>
          <h2>Partial estimate ready. Full decision locked.</h2>
          <p>Your AI final decision, risk badge, urgency, reasoning, and contractor quote path are ready to unlock.</p>
        </div>
        <span class="report-status">Step 1 of 3 complete</span>
      </div>

      <div class="partial-dashboard">
        <section class="preview-estimate">
          <h3>Estimated Cost Range</h3>
          <p class="estimate-range">${formatCurrency(estimate.low)} - ${formatCurrency(estimate.high)}</p>
          <p>This preview is visible now. The final AI decision is locked until email + ZIP submission.</p>
          <span class="confidence">${estimate.confidence}% confidence preview</span>
        </section>

        <section class="locked-decision" aria-label="Locked AI decision preview">
          <div class="locked-decision__title">🧠 AI Final Decision Locked</div>
          <div class="locked-pill-grid">
            <div class="locked-pill"><strong>FINAL DECISION</strong><span>Locked</span></div>
            <div class="locked-pill"><strong>⚠️ RISK LEVEL</strong><span>Locked</span></div>
            <div class="locked-pill"><strong>⏱ URGENCY</strong><span>Locked</span></div>
            <div class="locked-pill"><strong>CONFIDENCE</strong><span>${estimate.confidence}% ready</span></div>
          </div>
        </section>
      </div>

      <section class="lead-card" aria-labelledby="lead-title">
        <div>
          <p class="eyebrow">Step 2: unlock premium decision</p>
          <h3 id="lead-title">Unlock your full AI roof decision report</h3>
          <p>Used by homeowners planning roof replacement in the next 12 months.</p>
        </div>
        <div class="lead-actions">
          <button class="button" type="button" id="open-unlock-modal">Get My AI Roof Decision Report</button>
          <button class="button button--dark" type="button" id="unlock-quotes">Unlock Contractor Quotes</button>
          <p>Email + ZIP unlocks the full report and prepares local quote matching.</p>
        </div>
        <div class="lead-proof" aria-label="Lead capture trust messages">
          <span>Final decision locked</span>
          <span>Risk badge locked</span>
          <span>Contractor quote path locked</span>
        </div>
      </section>
    </div>
  `;

  document.getElementById("open-unlock-modal").addEventListener("click", openUnlockModal);
  document.getElementById("unlock-quotes").addEventListener("click", openUnlockModal);

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderFullReport(estimate, lead) {
  const reasoning = getReasoning(estimate);
  const successMessage =
    lead.storageStatus === "saved"
      ? "Your report is ready."
      : "Demo mode: report unlocked, but this lead was not saved.";

  resultCard.classList.remove("result-card--empty");
  resultCard.innerHTML = `
    <div class="report-success">${successMessage}</div>

    <div class="ai-report-header">
      <div>
        <p class="eyebrow">Roof AI decision system</p>
        <h2>Full AI roof decision unlocked</h2>
        <p>Prepared for ${lead.zip}. Contractor quote matching can connect here in the next version.</p>
      </div>
      <span class="report-status">Step 3 of 3 complete</span>
    </div>

    <section class="decision-hero" aria-label="AI final decision">
      <div>
        <span class="decision-label">🧠 FINAL DECISION</span>
        <p class="decision-value">${estimate.decision.action}</p>
        <p class="decision-summary">${estimate.decision.summary}</p>
      </div>
      <div class="decision-score">
        <div>
          <strong>${estimate.confidence}%</strong>
          <span>Confidence Score</span>
        </div>
      </div>
    </section>

    <div class="report-grid">
      <article class="metric-card metric-card--featured">
        <span class="metric-card__emoji">🧠</span>
        <span class="metric-card__icon tone-info">Final decision</span>
        <strong class="metric-card__value">${estimate.decision.action}</strong>
        <p>Primary AI recommendation based on the homeowner inputs.</p>
      </article>
      <article class="metric-card">
        <span class="metric-card__emoji">⚠️</span>
        <span class="metric-card__icon ${estimate.risk.tone}">Risk level</span>
        <strong class="metric-card__value">${estimate.risk.label}</strong>
        <p>${estimate.risk.detail}</p>
      </article>
      <article class="metric-card">
        <span class="metric-card__emoji">⏱</span>
        <span class="metric-card__icon ${estimate.urgency.tone}">Urgency</span>
        <strong class="metric-card__value">${estimate.urgency.label}</strong>
        <p>${estimate.urgency.detail}</p>
      </article>
    </div>

    <div class="estimate-topline">
      <div>
        <h3>Estimated Cost Range</h3>
        <p class="estimate-range">${getEstimatedCostRange(estimate)}</p>
      </div>
      <span class="confidence">${estimate.confidence}% Confidence Score</span>
    </div>

    <section class="reasoning-panel">
      <h3>Reasoning</h3>
      <ol class="factors">
        ${reasoning.map((reason) => `<li>${reason}</li>`).join("")}
      </ol>
    </section>

    <div class="result-grid">
      <article class="insight">
        <h3>Material Suggestion</h3>
        <p>Architectural asphalt shingles offer a strong balance of price, durability, curb appeal, and availability.</p>
      </article>
      <article class="insight">
        <h3>Local Quote Placeholder</h3>
        <p>Future CRM or contractor marketplace integration can route this lead using email, ZIP code, state, and roof profile.</p>
      </article>
    </div>

    <article class="insight">
      <h3>Cost Explanation</h3>
      <ol class="factors">
        ${estimate.factors.map((factor) => `<li>${factor}</li>`).join("")}
      </ol>
    </article>

    <div class="download-row">
      <p>Used by homeowners planning roof replacement in the next 12 months.</p>
      <button class="button" type="button" id="full-report-button">Unlock Contractor Quotes</button>
    </div>
  `;

  document.getElementById("full-report-button").addEventListener("click", () => {
    alert("Contractor quote placeholder: connect this CTA to CRM sync, quote routing, or a contractor marketplace.");
  });
}

function getLeadMessageElement() {
  return document.getElementById("lead-message");
}

function setLeadMessage(message, type) {
  const messageElement = getLeadMessageElement();

  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.className = type ? `lead-message lead-message--${type}` : "lead-message";
}

function setLeadFormSubmitting(isSubmitting) {
  const submitButton = leadForm.querySelector("button[type='submit']");
  const inputs = leadForm.querySelectorAll("input");

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Sending..." : "Get My AI Roof Decision Report";
  inputs.forEach((input) => {
    input.disabled = isSubmitting;
  });
}

function buildLeadPayload(leadData) {
  const createdAt = new Date().toISOString();
  const sourcePage =
    window.location && window.location.href ? window.location.href : "local-preview";

  return {
    email: leadData.get("email").trim(),
    zip: leadData.get("zip").trim(),
    state: latestEstimate.state,
    roofSize: latestEstimate.size === "3000" ? "3000+ sqft" : `${latestEstimate.size} sqft`,
    roofAge: latestEstimate.age,
    leaks: latestEstimate.leaks,
    roofType: latestEstimate.roofType,
    estimatedCostRange: getEstimatedCostRange(latestEstimate),
    confidence: latestEstimate.confidence,
    finalDecision: latestEstimate.decision.action,
    riskLevel: latestEstimate.risk.label,
    urgency: latestEstimate.urgency.label,
    createdAt,
    sourcePage
  };
}

async function submitLeadToFormspree(payload) {
  if (!isFormspreeConfigured()) {
    warnIfDemoMode();
    return {
      storageStatus: "demo"
    };
  }

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMessage = "We could not submit your report request. Please try again.";

    try {
      const responseBody = await response.json();
      if (responseBody.errors && responseBody.errors.length > 0) {
        errorMessage = responseBody.errors.map((error) => error.message).join(" ");
      }
    } catch (error) {
      errorMessage = "We could not submit your report request. Please try again.";
    }

    throw new Error(errorMessage);
  }

  return {
    storageStatus: "saved"
  };
}

async function handleLeadSubmit(event) {
  event.preventDefault();

  if (isLeadSubmitting || hasUnlockedReport) {
    return;
  }

  if (!latestEstimate) {
    setLeadMessage("Please complete the roof questions before requesting your report.", "error");
    return;
  }

  const leadData = new FormData(event.currentTarget);
  const leadPayload = buildLeadPayload(leadData);

  isLeadSubmitting = true;
  setLeadMessage("", "");
  setLeadFormSubmitting(true);

  try {
    const submissionResult = await submitLeadToFormspree(leadPayload);
    const lead = {
      ...leadPayload,
      storageStatus: submissionResult.storageStatus
    };

    hasUnlockedReport = true;
    closeUnlockModal();
    renderFullReport(latestEstimate, lead);
  } catch (error) {
    setLeadMessage(error.message || "We could not submit your report request. Please try again.", "error");
  } finally {
    isLeadSubmitting = false;
    setLeadFormSubmitting(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  latestEstimate = calculateEstimate(new FormData(form));
  renderPartialResult(latestEstimate);
});

leadForm.addEventListener("submit", handleLeadSubmit);

unlockModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-modal")) {
    closeUnlockModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && unlockModal.classList.contains("is-open")) {
    closeUnlockModal();
  }
});
