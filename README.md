# GOOtester Android Closed Testing Release Sync (`gootester-ci-release-action`)

Official zero-dependency **Node 20 GitHub Action** for syncing new **Android App Bundle (`.aab`)** releases and querying 14-day human closed-testing progress on **[GOOtester](https://gootester.com)** (`POST /api/v1/ci/release` & `GET /api/v1/ci/status`).

Why sync iterative `.aab` releases during your 14-day Google Play Closed Testing window?
- **Stronger Production Access Evidence:** Shipping 2–3 incremental releases (`versionCode 1` → `2` → `3`) in response to real human tester feedback demonstrates active engineering iteration when answering Google Play's 3 mandatory Production Access questions — without resetting existing tester opt-ins.
- **Zero Google Play Console Credentials Shared:** GOOtester uses a scoped, revocable CI token (`gt_live_example_token_12345`) strictly for release metadata & SHA-256 provenance. You never share your Google Play Console login, 2FA, or upload keystore.
- **Strict Provenance Separation:** Real consented human testers (`12` on $6 Basic, `15` on $12 Standard, `25` on $20 Premium) are tracked separately from physical-device ARM64 ADB QA diagnostics.

---

## Quick Start (GitHub Actions)

1. Sign in to **[GOOtester Developer Console](https://dashboard.gootester.com)** and generate a scoped CI API key (`ci:release`, `ci:read`).
2. Save the token in your repository under **Settings → Secrets and variables → Actions** as `GOOTESTER_CI_TOKEN`.
3. Add this step right after building or uploading your signed `.aab`:

```yaml
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

## Framework-Specific Playbooks & Troubleshooting Resources

- **Framework Release Playbooks:**
  - [Flutter App Bundle & Impeller QA Playbook](https://gootester.com/frameworks/flutter)
  - [Expo & React Native EAS Build Playbook](https://gootester.com/frameworks/expo-react-native)
  - [Native Kotlin & Jetpack Compose Playbook](https://gootester.com/frameworks/kotlin-jetpack-compose)
  - [Capacitor & Ionic Web-to-Android Playbook](https://gootester.com/frameworks/capacitor-ionic)
  - [Google AI Studio & Gemini Web Apps Playbook](https://gootester.com/frameworks/google-ai-studio)
  - [Cursor, Claude Code, Lovable & Bolt Playbook](https://gootester.com/frameworks/cursor-lovable-bolt)
- **Play Console Error Encyclopedia:**
  - [Fix Closed Testing Opt-In URL HTTP 404 / 'Item Not Found'](https://gootester.com/errors/item-not-found-testing-url)
  - [Fix Google Sign-In `ApiException: 10 (DEVELOPER_ERROR)`](https://gootester.com/errors/google-sign-in-api-exception-10)
  - [Fix `'This app does not support 16 KB memory page sizes'`](https://gootester.com/errors/16kb-memory-page-size-not-supported)
  - [Fix `'Your app needs more testing before you can access production'`](https://gootester.com/errors/production-access-more-testing-required)
- **Free Browser Calculators & Validators (No Login Required):**
  - [14-Day Closed Testing Timeline & Dropout Buffer Calculator](https://gootester.com/tools/closed-testing-timeline-calculator)
  - [Do I Need 12 Testers? Account Eligibility Checker](https://gootester.com/tools/do-i-need-12-testers-checker)
  - [Production Access 3-Question Evidence Builder](https://gootester.com/tools/production-access-questionnaire-builder)

---

## Inputs & Outputs

| Input | Required | Description |
| :--- | :---: | :--- |
| `api-token` | Yes | Scoped GOOtester CI token (`ci:release`, `ci:read`) |
| `app-package` | Yes | Android `applicationId` (e.g., `com.example.myapp`) |
| `version-code` | Yes | Positive integer `versionCode` uploaded to Play Console Closed Testing |
| `version-name` | Yes | Release `versionName` (e.g., `1.0.1`) |
| `campaign-id` | No | Explicit GOOtester campaign ID |
| `aab-path` | No | Local runner path to `.aab` to record deterministic SHA-256 digest |
| `release-notes` | No | Summary of bugs fixed from closed-tester feedback |

| Output | Description |
| :--- | :--- |
| `release-id` | Recorded release lineage ID in GOOtester |
| `aab-sha256` | Computed 64-character hex SHA-256 digest of the `.aab` file |
| `campaign-id` | Resolved GOOtester campaign ID |
| `observed-service-days` | Current observed service days from `/api/v1/ci/status` |

---

## License

MIT © [GOOtester](https://gootester.com) — Independent Android closed-testing coordination & physical-device QA platform (`support@gootester.com`). Not affiliated with Google LLC.
