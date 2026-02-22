# GleeGrow Legal & Licensing Audit for Monetization

**Date:** February 22, 2026
**Status:** Ready for legal review before commercial launch

---

## Executive Summary

GleeGrow uses **10 third-party libraries/services**. All are compatible with commercial monetization. The main legal obligations are:

1. **Attribution** — Include license notices for all libraries (Apache 2.0, MIT, OFL)
2. **COPPA/GDPR compliance** — Entirely your responsibility; no library handles this for you
3. ~~**ml5.js risk**~~ — **RESOLVED** (removed on Feb 22, 2026; replaced with direct TensorFlow.js)
4. **SendGrid** — Free tier discontinued; budget $19.95+/month for email
5. **Firebase plan** — Spark is OK for soft launch; Blaze required for Cloud Functions and production scale

---

## 1. Library-by-Library License Analysis

### 1.1 Firebase JavaScript SDK v9.22.0

| Field | Detail |
|-------|--------|
| License | Apache 2.0 |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must preserve copyright & license notices |
| Risk | LOW |

Firebase services are governed separately by the [Firebase Terms of Service](https://firebase.google.com/terms) which explicitly allow commercial use. The **Spark (free) plan** can be used commercially but shuts off at quota limits. **Blaze plan** (pay-as-you-go) is recommended for production.

### 1.2 firebase-admin v13.0.0 (npm)

| Field | Detail |
|-------|--------|
| License | Apache 2.0 |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must preserve copyright & license notices |
| Risk | LOW |

### 1.3 firebase-functions v6.3.0 (npm)

| Field | Detail |
|-------|--------|
| License | MIT |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must include copyright & license notice |
| Risk | LOW |

Note: Cloud Functions require the Blaze plan to deploy.

### 1.4 TensorFlow.js v4.11.0

| Field | Detail |
|-------|--------|
| License | Apache 2.0 |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must preserve copyright & license notices |
| Risk | LOW |

### ~~1.5 ml5.js~~ — REMOVED

**Status:** Removed on February 22, 2026. Was loaded in `aptitude.html` but never actually called — all handwriting recognition used TensorFlow.js directly. Removed the CDN script tag and renamed files to eliminate misleading references. **No longer a dependency.**

### 1.6 html2pdf.js v0.10.1

| Field | Detail |
|-------|--------|
| License | MIT |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must include copyright & license notice |
| Risk | LOW |

Bundles html2canvas (MIT) and jsPDF (MIT) — both fully commercial-friendly.

### 1.7 @sendgrid/mail v8.1.0 (npm)

| Field | Detail |
|-------|--------|
| License | MIT (library) |
| Commercial use | Yes |
| Copyleft | No |
| Attribution | Must include copyright & license notice |
| Risk | LOW (library), **COST for service** |

**Important:** SendGrid's free tier was retired in May-July 2025. Paid plans start at **$19.95/month** (Essentials). A 60-day trial allows 100 emails/day. Consider alternatives: Resend, Postmark, or Amazon SES.

### 1.8 Google Fonts (Caveat, Patrick Hand)

| Field | Detail |
|-------|--------|
| License | SIL Open Font License 1.1 (OFL) |
| Commercial use | Yes |
| Copyleft | Only if you modify the fonts themselves |
| Attribution | Appreciated but not required for embedding |
| Risk | LOW |

### 1.9 MNIST Pre-trained Model (tfjs-models)

| Field | Detail |
|-------|--------|
| License | Apache 2.0 (code) / CC BY-SA 3.0 (dataset) |
| Commercial use | Yes |
| Copyleft | ShareAlike on the dataset only (not the trained model) |
| Attribution | Attribute Yann LeCun & Corinna Cortes for MNIST data |
| Risk | LOW |

Note: The hosted model weights on storage.googleapis.com lack explicit licensing but are served publicly alongside Apache 2.0 code. Widely used commercially without issue.

**EMNIST dataset** (planned Task 12): Licensed CC BY-ND 4.0. Commercial use is allowed. Training a model on it is fine; redistributing modified versions of the raw dataset is not.

### 1.10 html2canvas (bundled in html2pdf.js)

| Field | Detail |
|-------|--------|
| License | MIT |
| Commercial use | Yes |
| Risk | LOW |

### 1.11 jsPDF (bundled in html2pdf.js)

| Field | Detail |
|-------|--------|
| License | MIT |
| Commercial use | Yes |
| Risk | LOW |

---

## 2. Summary Risk Matrix

| Library | License | Commercial? | Copyleft? | Risk |
|---------|---------|:-----------:|:---------:|:----:|
| Firebase SDK | Apache 2.0 | Yes | No | LOW |
| firebase-admin | Apache 2.0 | Yes | No | LOW |
| firebase-functions | MIT | Yes | No | LOW |
| TensorFlow.js | Apache 2.0 | Yes | No | LOW |
| ~~ml5.js~~ | ~~Custom~~ | ~~Conditional~~ | ~~Evolving CoC~~ | **REMOVED** |
| html2pdf.js | MIT | Yes | No | LOW |
| @sendgrid/mail | MIT | Yes | No | LOW |
| Google Fonts | OFL 1.1 | Yes | Fonts only | LOW |
| MNIST model | Apache 2.0 + CC BY-SA 3.0 | Yes | Dataset only | LOW |
| html2canvas | MIT | Yes | No | LOW |
| jsPDF | MIT | Yes | No | LOW |

---

## 3. Children's Data Compliance (COPPA & GDPR)

**None of these libraries provide COPPA or GDPR compliance.** This is entirely the developer's responsibility.

### 3.1 COPPA (US, children under 13)

Requirements for GleeGrow:
- Verifiable parental consent before data collection
- Clear privacy policy describing data practices
- Parents can review, delete, or refuse further collection
- Collect only minimum data necessary
- Reasonable data security measures

**2025 COPPA Amendments** (effective June 23, 2025, compliance deadline **April 22, 2026**):
- Expanded to cover biometric data and persistent identifiers
- Stricter data retention rules
- New requirements for third-party data sharing disclosures

### 3.2 GDPR (EU, children under 16)

Requirements:
- Parental consent per Article 8
- Data minimization (Article 5(1)(c))
- Right to erasure (Article 17)
- Data Protection Impact Assessment recommended for children's data

### 3.3 Current Status in GleeGrow

| Requirement | Status |
|-------------|--------|
| Parental consent flow | Implemented (parents create accounts for children) |
| Privacy policy | Created (privacy-policy.html) |
| Terms & conditions | Created (terms.html) |
| Data minimization | Implemented (name, DOB, email only) |
| Account deletion | Needs verification |
| Data export | Not yet implemented |
| Cookie consent banner | Not needed (no tracking cookies used) |

---

## 4. Service Cost Projections for Monetization

| Service | Free Tier | Paid Tier | When Needed |
|---------|-----------|-----------|-------------|
| Firebase Spark | 50K reads/day, 20K writes/day, 1GB storage | Blaze: pay-as-you-go | At ~100+ active users |
| Firebase Blaze | Same free quota + pay for overages | ~$0.06/100K reads, $0.18/100K writes | For Cloud Functions |
| SendGrid | **Discontinued** | $19.95/mo (50K emails/mo) | At launch if using email |
| Google Fonts | Free | Free | Always free |
| CDN libraries | Free | Free | Always free |
| TF.js models | Free (hosted by Google) | Free | Always free |

**Estimated monthly cost at 500 users:** ~$25-50/month (Firebase Blaze + SendGrid Essentials)

---

## 5. Code & IP Protection Concerns

### Current State: Everything is Client-Side

All business logic (worksheet generation, level progression, page access control, assessment) runs in the browser as plain JavaScript. This means:

- Anyone can view-source and see the entire codebase
- Question generation algorithms are fully exposed
- Level progression logic is visible
- Page access controls can be bypassed via browser DevTools
- A competitor could copy the entire product

### What Should Move to Backend

| Component | Current | Should Be | Priority |
|-----------|---------|-----------|----------|
| Worksheet generation | Client JS | Cloud Function / API | HIGH |
| Answer validation | Client JS | Cloud Function / API | HIGH |
| Page access control | Client JS | Firestore Security Rules + Cloud Function | HIGH |
| Weekly assignment generation | Client + Firestore | Cloud Function only | MEDIUM |
| Assessment scoring | Client JS | Cloud Function / API | MEDIUM |
| Level progression | Client JS | Cloud Function / API | MEDIUM |
| User authentication | Firebase Auth | Firebase Auth (already server-side) | DONE |
| Data storage | Firestore | Firestore (already server-side) | DONE |

### Options for Backend Migration

**Option A: Firebase Cloud Functions (Recommended for current stack)**
- Cost: Blaze plan required (~$0.40/million invocations)
- Effort: Medium — move generator logic to `functions/`
- Benefit: Stays in Firebase ecosystem, no new infrastructure

**Option B: Dedicated Backend (Node.js/Express on Cloud Run)**
- Cost: ~$5-20/month for Cloud Run
- Effort: High — new infrastructure, deployment pipeline
- Benefit: Full control, better for complex logic

**Option C: Obfuscation Only (Minimal protection)**
- Cost: Free (webpack/terser)
- Effort: Low — add build step
- Benefit: Makes copying harder but not impossible; does NOT prevent DevTools bypass

---

## 6. Action Items Before Monetization

### Must Do (Legal Requirements)

- [ ] **Create THIRD_PARTY_NOTICES.txt** — Include Apache 2.0, MIT, OFL 1.1, CC BY-SA 3.0 license texts with attributions for all libraries
- [x] **~~Replace ml5.js~~** — DONE: Removed ml5.js CDN from aptitude.html (was unused dead code)
- [ ] **Verify account deletion** fully removes all Firestore data
- [ ] **Add data export feature** (GDPR Article 20 — right to data portability)
- [ ] **Review COPPA 2025 amendments** compliance before April 22, 2026 deadline
- [ ] **Update terms.html** with GleeGrow-specific DPO contact and physical address (required by GDPR)

### Should Do (Monetization Readiness)

- [ ] **Move to Firebase Blaze plan** for Cloud Functions
- [ ] **Migrate worksheet generation to Cloud Functions** (protect IP, enforce page limits server-side)
- [ ] **Migrate answer validation to Cloud Functions** (prevent client-side answer extraction)
- [ ] **Set up SendGrid paid plan** or switch to alternative email provider
- [ ] **Add code obfuscation build step** (webpack + terser) as interim protection
- [x] ~~**Pin ml5.js version**~~ — N/A: ml5.js removed entirely

### Nice to Have

- [ ] Add a LICENSE file to the repository (recommended: proprietary for the application code)
- [ ] Set up Firebase App Check to prevent API abuse
- [ ] Implement rate limiting on Cloud Functions
- [ ] Add Sentry or similar for production error monitoring

---

## 7. Conclusion

**GleeGrow CAN be monetized legally** with the current third-party stack. All libraries allow commercial use. The previous ml5.js license risk has been eliminated by removing the dependency entirely (it was unused dead code).

The bigger concern for monetization is **not licensing but code protection** — all business logic is currently client-side and trivially copyable. Moving worksheet generation, answer validation, and access control to Firebase Cloud Functions is the single most impactful step for protecting the product's commercial value.

---

*This document is for informational purposes and does not constitute legal advice. Consult a qualified attorney before commercial launch, particularly regarding COPPA compliance for a children's product.*
