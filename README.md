# GOOtester Android Closed Testing Release Sync (`gootester-ci-release-action`)

[![Google Play Closed Testing](https://gootester.com/badge/closed-testing.svg)](https://gootester.com)
[![OpenAPI 3.1.0](https://gootester.com/badge/closed-testing.svg?label=OpenAPI&status=3.1.0%20Spec)](https://gootester.com/openapi.json)
[![2026 Benchmarks](https://gootester.com/badge/closed-testing.svg?label=2026%20Dataset&status=CC%20BY%204.0)](https://gootester.com/benchmarks/google-play-closed-testing-2026)
[![License: MIT](https://gootester.com/badge/closed-testing.svg?label=License&status=MIT)](./LICENSE)

Official zero-dependency **Node 20 GitHub Action** for syncing signed **Android App Bundle (`.aab`)** releases, recording deterministic **SHA-256** artifact digests, and querying 14-day human closed-testing progress on **[GOOtester](https://gootester.com)** (`POST /api/v1/ci/release` & `GET /api/v1/ci/status`).

---

## Why Sync Iterative `.aab` Releases During Google Play Closed Testing?

Personal Google Play Developer accounts created after November 13, 2023 must keep at least **12 testers continuously opted-in for 14 consecutive days** on a Closed Testing track before applying for Production Access.

1. **Stronger Production Access Evidence:** Shipping 2–3 incremental releases (`versionCode 1` → `2` → `3`) in response to real human tester feedback demonstrates active bug resolution when answering Google Play's 3 mandatory Production Access prompts — without resetting existing tester opt-ins.
2. **Cohort Dropout Protection:** As modeled in our open **[2026 Google Play Closed Testing Benchmark Dataset](https://gootester.com/benchmarks/google-play-closed-testing-2026)**, recruiting an exact 12-tester zero-buffer pool yields only a **16.7%** 14-day survival probability at 1% daily churn (`0.99^(12×14)`), whereas a 15-tester buffered cohort ($12 Standard) raises survival to **96.4%**.
3. **Zero Google Play Console Credentials Shared:** GOOtester uses a scoped, revocable CI token (`gt_live_example_token_12345`) strictly for release lineage & SHA-256 provenance. Your Google Play Console login, 2FA, service account JSON, and upload keystore stay 100% inside your own repository.
4. **Strict Provenance Separation:** Consented human testers (`12` on $6 Basic, `15` on $12 Standard, `25` on $20 Premium) are tracked strictly separately from physical-device ARM64 ADB QA diagnostics (`RAM PSS`, `dumpsys gfxinfo` frame jank, crash/ANR gates).

---

## Quick Start (GitHub Actions)

1. Sign in to **[GOOtester Developer Console](https://dashboard.gootester.com)** and generate a scoped CI API key (`ci:release`, `ci:read`).
2. Save the token in your GitHub repository under **Settings → Secrets and variables → Actions** as `GOOTESTER_CI_TOKEN`.
3. Add this step after building your signed release `.aab`:

```yaml
name: Android Closed Testing Release & GOOtester Sync

on:
  push:
    tags:
      - "v*"

jobs:
  release-closed-track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"

      - name: Build Signed Release Android App Bundle (.aab)
        run: ./gradlew :app:bundleRelease --no-daemon

      - name: Sync Closed Testing Release with GOOtester
        uses: nghi25211dd1488/gootester-ci-release-action@v1
        with:
          api-token: ${{ secrets.GOOTESTER_CI_TOKEN }}
          app-package: com.example.myapp
          version-code: "2"
          version-name: "1.0.1"
          aab-path: app/build/outputs/bundle/release/app-release.aab
          release-notes: "Fixed Android 15 edge-to-edge bottom inset overlap reported by closed testers."
```

---

## Add the Closed Testing Status Badge to Your Android Repo

Document your repository's Google Play Closed Testing compliance workflow with our zero-tracking SVG badge:

```markdown
[![Google Play Closed Testing](https://gootester.com/badge/closed-testing.svg)](https://gootester.com)
```

---

## Inputs & Outputs

| Input | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `api-token` | **Yes** | — | Scoped GOOtester CI token (`ci:release`, `ci:read`) |
| `app-package` | **Yes** | — | Android `applicationId` (e.g., `com.example.myapp`) |
| `version-code` | **Yes** | — | Positive integer `versionCode` uploaded to Play Console Closed Testing |
| `version-name` | **Yes** | — | Release `versionName` (e.g., `1.0.1`) |
| `campaign-id` | No | `""` | Explicit GOOtester campaign ID (if managing multiple campaigns) |
| `aab-path` | No | `""` | Runner path to `.aab` to compute deterministic 64-char hex SHA-256 digest |
| `release-notes` | No | `""` | Summary of tester feedback resolved in this release |
| `fetch-status` | No | `"true"` | Query `GET /api/v1/ci/status` and append a Markdown summary to `GITHUB_STEP_SUMMARY` |
| `api-origin` | No | `"https://gootester.com"` | GOOtester API origin |

| Output | Description |
| :--- | :--- |
| `release-id` | Recorded release lineage ID in GOOtester |
| `aab-sha256` | Computed 64-character lowercase hex SHA-256 digest of the `.aab` bundle |
| `campaign-id` | Resolved GOOtester campaign ID |
| `observed-service-days` | Observed GOOtester service days reported by `/api/v1/ci/status` |

---

## Free Android Release Engineering Tools & Playbooks (Zero Login Required)

### 12 Free Browser-Based Play Console Utilities
- [14-Day Closed Testing Timeline & Dropout Risk Simulator](https://gootester.com/tools/closed-testing-timeline-calculator)
- [Google Play Privacy Policy & Account Deletion URL Generator](https://gootester.com/tools/google-play-privacy-policy-data-deletion-generator)
- [Play Store Data Safety SDK Mapper (Firebase, AdMob, RevenueCat, Sentry)](https://gootester.com/tools/play-store-data-safety-sdk-mapper)
- [Digital Asset Links (`assetlinks.json`) Dual-Certificate Generator](https://gootester.com/tools/digital-asset-links-assetlinks-generator)
- [`app-ads.txt` & Android 13+ `AD_ID` Manifest Validator](https://gootester.com/tools/app-ads-txt-admob-validator)
- [Closed Testing Total Cost & ROI Calculator](https://gootester.com/tools/closed-testing-cost-roi-calculator)
- [Play Store Metadata Character & Policy Linter](https://gootester.com/tools/play-store-metadata-character-policy-checker)
- [Android 15/16 `16 KB` Memory Page Size Bundle Auditor](https://gootester.com/tools/android-15-16kb-bundle-auditor)
- [Do I Need 12 Testers? Account Eligibility Checker](https://gootester.com/tools/do-i-need-12-testers-checker)
- [Play Console Opt-In Link Validator (`HTTP 404` Checker)](https://gootester.com/tools/play-testing-link-validator)
- [Production Access 3-Question Evidence Builder](https://gootester.com/tools/production-access-questionnaire-builder)
- [Play Console Release Notes (`<en-US>`) Formatter](https://gootester.com/tools/release-notes-changelog-generator)

### Stack-Specific `.aab` Playbooks & Error Diagnostics
- **Frameworks ([All 12 Playbooks](https://gootester.com/frameworks)):** [Flutter](https://gootester.com/frameworks/flutter) · [Expo / React Native](https://gootester.com/frameworks/expo-react-native) · [Kotlin & Compose](https://gootester.com/frameworks/kotlin-jetpack-compose) · [Capacitor / Ionic](https://gootester.com/frameworks/capacitor-ionic) · [Google AI Studio](https://gootester.com/frameworks/google-ai-studio) · [Cursor / Lovable / Bolt](https://gootester.com/frameworks/cursor-lovable-bolt) · [Unity](https://gootester.com/frameworks/unity) · [Godot 4](https://gootester.com/frameworks/godot)
- **Play Console Errors ([All 18 Fixes](https://gootester.com/errors)):** [Opt-In Link HTTP 404 / 'Item Not Found'](https://gootester.com/errors/item-not-found-testing-url) · [Days Counter Stuck at 0](https://gootester.com/errors/closed-testing-days-counter-not-updating) · ['More Testing Required' Rejection](https://gootester.com/errors/production-access-more-testing-required) · [`ApiException: 10` SHA-1 Mismatch](https://gootester.com/errors/google-sign-in-api-exception-10) · [16 KB Memory Page Size](https://gootester.com/errors/16kb-memory-page-size-not-supported) · [Account Deletion URL Violation](https://gootester.com/errors/account-deletion-url-policy-violation) · [EU DSA Trader Verification](https://gootester.com/errors/eu-digital-services-act-trader-verification-rejected)
- **Team & Agent Workflows:** [2026 Closed Testing Cost Guide](https://gootester.com/google-play-closed-testing-cost) · [For Agencies & Freelancers](https://gootester.com/for-agencies-and-freelancers) · [For Indie Game Studios](https://gootester.com/for-indie-game-studios) · [For AI Agents & MCP (`OpenAPI 3.1`)](https://gootester.com/for-ai-agent-and-mcp-workflows)
- **Global Developer Hubs (10 Languages):** [Tiếng Việt](https://gootester.com/vi) · [Português](https://gootester.com/pt) · [Español](https://gootester.com/es) · [Indonesia](https://gootester.com/id) · [Türkçe](https://gootester.com/tr) · [한국어](https://gootester.com/ko) · [日本語](https://gootester.com/ja) · [Deutsch](https://gootester.com/de) · [Français](https://gootester.com/fr) · [हिन्दी](https://gootester.com/hi)

---

## License

MIT © [GOOtester](https://gootester.com) — Independent Android closed-testing coordination & physical-device QA platform (`support@gootester.com`). Not affiliated with, sponsored by, or endorsed by Google LLC.
