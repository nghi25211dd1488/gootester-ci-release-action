# Security Policy

## Zero-Credential Architecture

`gootester-ci-release-action` is built on zero-dependency Node 20 standard library APIs (`node:crypto`, `node:fs`, `fetch`) and **never** reads, uploads, or transmits:
- Your Google Play Console credentials or Google Cloud Service Account JSON keys
- Your Android upload keystore (`.jks` / `.keystore`) or signing passwords
- Your `.aab` binary payload (only the local 64-character hexadecimal `SHA-256` digest is computed on your GitHub Actions runner when `aab-path` is provided)

All API requests authenticate exclusively via a revocable, least-privilege GOOtester CI token (`ci:release`, `ci:read`) issued in `https://dashboard.gootester.com`.

## Reporting a Vulnerability

Please report security issues privately to `support@gootester.com` with subject `[SECURITY] gootester-ci-release-action`. Do not open public GitHub issues containing active tokens or sensitive logs.
