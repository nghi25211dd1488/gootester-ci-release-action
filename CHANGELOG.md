# Changelog

## [v1.1.0] - 2026-11-26
- Aligned `action.yml` metadata strictly with GitHub Marketplace validation rules (`<= 125` char description, `check-circle` green branding).
- Added live GOOtester Closed Testing SVG status badges (`https://gootester.com/badge/closed-testing.svg`), OpenAPI 3.1.0 spec reference (`https://gootester.com/openapi.json`), and 2026 Statistical Benchmark Dataset links (`https://gootester.com/benchmarks/google-play-closed-testing-2026`).
- Added `SECURITY.md` documenting zero-dependency local SHA-256 hashing and zero-credential Play Console isolation.

## [v1.0.0] - 2026-11-25
- Initial public release of `gootester-ci-release-action` (`node20` runtime) supporting `POST /api/v1/ci/release`, `GET /api/v1/ci/status`, idempotent release keys, and `GITHUB_STEP_SUMMARY` reporting.
