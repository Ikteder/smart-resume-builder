# Quality baseline — 2026-08-30

- Added Vitest coverage for contact validation, URL normalization, multiline helpers, grounded keyword matching, and safe application of a tailoring draft.
- Added CI that installs from the lockfile, audits production dependencies, runs lint and tests, and builds the production application on Node.js 22.
- Updated vulnerable transitive packages through the lockfile. `npm audit --omit=dev` reported zero vulnerabilities after the update.
- Replaced the illustrative screenshot placeholder with a screenshot captured from the locally rendered application using its bundled synthetic sample resume.

Verification commands:

```bash
npm audit --omit=dev
npm run lint
npm test
npm run build
```

Limitations: unit coverage focuses on deterministic data transformations. Browser export flows and PDF/DOCX fidelity still need dedicated end-to-end tests.
