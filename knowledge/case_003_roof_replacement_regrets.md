# CASE-003: Roof Replacement Regrets Knowledge Extraction

Source: Reddit - r/homeowners
Thread: "What do you wish you had known when you replaced your roof?"
Date added: 2026-06-16
Extraction type: Manual customer-discovery synthesis from provided source topic and category list.

## Case Summary

Homeowners replacing a roof often discover too late that the roof project touches many adjacent decisions: attic ventilation, decking condition, bathroom exhaust routing, permits, insurance documentation, cleanup quality, solar readiness, material choices, and scope validation. The strongest product signal is that homeowners need a pre-replacement checklist and decision assistant before accepting a quote.

## Category Extraction

| Category | User Pain Point | Root Cause | Recommended Action | Roof AI Opportunity |
|---|---|---|---|---|
| Ventilation | Homeowners realize too late that a new roof does not automatically fix attic heat, moisture, or airflow problems. | Contractors may focus on shingles while intake, exhaust, baffles, and attic airflow are underspecified. | Review ridge vents, soffit intake, baffles, attic air sealing, and local climate needs before signing. | Add a Ventilation Readiness Check that flags missing intake/exhaust questions before replacement. |
| Decking / OSB | Homeowners are surprised by extra charges for rotten decking or OSB replacement. | Deck condition is hidden until tear-off, and quotes may not clearly define per-sheet replacement pricing. | Ask for decking inspection assumptions, per-sheet OSB pricing, photo proof, and approval process. | Add a Decking Risk Estimate and Quote Clause Checker. |
| Bathroom Venting | Homeowners later discover bathroom fans vent into the attic or were not properly routed through the roof. | Exhaust routing is often separate from the roofing scope and may not be inspected during replacement. | Verify all bath fans vent outdoors and ask whether new roof penetrations or flashing are needed. | Add a Bathroom Vent Routing Checklist inside the roof readiness report. |
| Permit | Homeowners are unsure whether permits are required or whether the contractor handled them. | Permit rules vary by city/county, and contractors may not explain responsibility clearly. | Confirm permit requirements, who pulls the permit, and whether inspection sign-off is included. | Add a Permit Responsibility Prompt and local compliance checklist placeholder. |
| Insurance | Homeowners regret not understanding claim risk, deductible impact, premium effects, or documentation needs. | Insurance incentives, storm damage claims, and contractor recommendations can be confusing. | Document damage before work, confirm claim strategy independently, and understand deductible/premium risk. | Add an Insurance Claim Risk Analyzer and documentation checklist. |
| Documentation | Homeowners lack photos, invoices, warranty terms, permit records, and product details after the job. | Documentation is not always requested before work starts, and cleanup/payment happens quickly. | Request before/during/after photos, material specs, warranty docs, permit records, and final invoice. | Add a Roof Replacement Document Vault Checklist. |
| Material Selection | Homeowners wish they understood shingle grade, underlayment, flashing, drip edge, and warranty differences. | Quotes often compare total price rather than system components and long-term performance. | Compare material specs line by line, not only quote totals. | Add a Material Comparison Matrix for homeowner quotes. |
| Shingle Color | Homeowners regret choosing color without seeing it on real homes or in different light. | Small samples and online images do not reflect roof-scale appearance or heat impact. | View installed examples nearby, check HOA rules, and consider heat/climate effects. | Add a Shingle Color Decision Guide and climate note. |
| Metal Roof | Homeowners considering metal roofs worry about noise, cost, weight, expansion, installer skill, and insurance. | Metal roofing has different installation details and quote assumptions than asphalt. | Verify installer experience, panel type, underlayment, fastening system, warranty, and structure fit. | Add a Metal Roof Suitability module. |
| Cleanup | Homeowners regret not specifying nail cleanup, landscaping protection, dumpster placement, and final inspection. | Cleanup expectations are often informal unless written into the contract. | Require magnetic nail sweep, property protection, debris removal, and final walkthrough. | Add a Cleanup Scope Checklist before quote acceptance. |
| Solar Readiness | Homeowners replacing a roof before solar wish they had coordinated timeline and roof penetrations. | Solar planning is often separate from roof replacement, causing rework or missed prep opportunities. | Decide solar timing before roof work and ask about mounting, conduit, warranty, and remaining roof life. | Add a Solar Readiness Check for homeowners considering panels within 5 years. |
| Scope Validation | Homeowners regret not validating exactly what is included: flashing, vents, gutters, underlayment, drip edge, plywood, and warranty. | Roofing quotes can hide differences behind similar headline prices. | Get a written scope, compare line items, and ask what is excluded. | Add a Quote Scope Validation Engine that flags missing line items. |

## Top 25 Homeowner Regrets Before Roof Replacement

1. Not checking attic ventilation before replacing shingles.
2. Not asking whether soffit intake and ridge exhaust are balanced.
3. Not confirming whether baffles are installed or blocked.
4. Not asking for per-sheet decking or OSB replacement pricing.
5. Not getting photo proof before approving decking add-ons.
6. Not verifying bathroom fans vent outdoors instead of into the attic.
7. Not clarifying who handles permits and inspections.
8. Not understanding insurance claim consequences before filing.
9. Not documenting roof condition before the contractor starts.
10. Not saving warranty, permit, invoice, and product records.
11. Not comparing underlayment, flashing, drip edge, and ventilation components.
12. Not comparing quotes line by line beyond the total price.
13. Not seeing shingle colors on real homes before choosing.
14. Not considering heat and climate impact of darker shingles.
15. Not validating whether metal roofing is appropriate for the home.
16. Not checking whether the contractor has real experience with the selected material.
17. Not requiring written cleanup expectations.
18. Not protecting landscaping, gutters, decks, and driveways during work.
19. Not requiring magnetic nail cleanup and a final walkthrough.
20. Not planning roof replacement around future solar installation.
21. Not asking whether new roof work could affect solar mounting or warranty.
22. Not clarifying what happens if hidden damage is found.
23. Not confirming whether flashing, pipe boots, vents, and valleys are replaced or reused.
24. Not understanding labor, material, workmanship, and manufacturer warranty differences.
25. Not getting the complete project scope in writing before deposit.

## Product Implications

| Product Area | Opportunity | Priority |
|---|---|---|
| Pre-Replacement Readiness | Create a checklist that identifies missing quote/scope items before homeowner signs. | Very High |
| Quote Validation | Compare contractor quotes by scope completeness, not just price. | Very High |
| Risk Scoring | Score decking, ventilation, insurance, and documentation risk. | High |
| Lead Conversion | Gate a full Roof Replacement Readiness Report behind email + ZIP. | High |
| Future Modules | Add solar readiness, metal roof suitability, and bathroom venting checks. | Medium-High |

## Suggested Roof AI Modules From CASE-003

- Roof Replacement Readiness Score
- Quote Scope Validation Engine
- Ventilation Readiness Check
- Decking Risk Estimate
- Bathroom Vent Routing Checklist
- Insurance Claim Risk Analyzer
- Material Comparison Matrix
- Cleanup Scope Checklist
- Solar Readiness Check
- Documentation Checklist

## Validation Signal

Signal: Green

Reason: The case contains repeated pre-purchase regrets, high homeowner anxiety, clear decision points, and multiple modules that can improve lead quality before contractor referral.
