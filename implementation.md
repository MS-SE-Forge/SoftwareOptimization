# DevSecOps Pipeline Implementation

This document details the end-to-end implementation of the Secure DevOps Pipeline for the Software Optimization API. The pipeline is built using **GitHub Actions** and integrates security at every stage of the SDLC (Shift-Left Security).

## Architecture Overview

The pipeline uses a parallelized, multi-stage architecture to ensure speed while enforcing strict security gates.

**Triggers**:
- Push to `main` branch.
- Pull Requests (targeted for code review and pre-merge checks).

---

## Pipeline Stages (End-to-End)

### 1. Pre-Build Verification
Before any artifact is built, the code is validated for quality and static security issues.

- **Linting (`pnpm lint`)**: Enforces code style and best practices using ESLint.
- **Spellcheck (`pnpm spellcheck`)**: Ensures documentation and code comments are free of typos using `cspell`.
- **Secret Scanning (Gitleaks)**: Scans the entire git history and current diff for accidental commit of secrets (API keys, tokens).
- **Dependency Review**: (PR Only) Checks for vulnerable dependencies ensure in Pull Requests.

### 2. Build & Artifact Generation
- **Build Job**:
    - Installs dependencies using `pnpm`.
    - Compiles the NestJS application (`pnpm build`).
    - Packages the `dist` folder, `package.json`, and `prisma` schema into a `.tgz` artifact.
    - Uploads the artifact to GitHub Actions storage for use in downstream jobs (Publish, CD).

### 3. Testing Strategies
- **Unit Tests (Sharded)**:
    - Runs unit tests in 5 parallel shards to reduce execution time.
    - Generates coverage reports for each shard.
- **Coverage Check**:
    - Merges all coverage shards.
    - Enforces a strict **80% coverage threshold** for branches, functions, lines, and statements.
- **E2E Tests**:
    - Spins up a **MongoDB** service container.
    - Runs end-to-end tests against the database to verify full system integration.

### 4. Security Scanning (SAST & SCA)
- **CodeQL**: GitHub's native semantic code analysis engine to find known vulnerability patterns in JavaScript/TypeScript.
- **Semgrep**: Lightweight static analysis for security and correctness.
- **Dependency Audit**: Runs `pnpm audit` (High severity) to check production dependencies for known vulnerabilities.
- **IaC Scanning (Checkov)**: Scans infrastructure-as-code files (specifically the `Dockerfile`) for misconfigurations (e.g., running as root).

### 5. Container Security
- **Docker Build**: Builds the container image using the refactored **Distroless** Dockerfile (Node.js 20 on Debian 12).
- **Trivy Scan**: Scans the built image for OS-level vulnerabilities (Critical/High severity) and library vulnerabilities. Fails the pipeline if issues are found.

### 6. Dynamic Application Security Testing (DAST)
- **OWASP ZAP**:
    - Spins up the containerized application.
    - Runs an automated baseline scan against the running application to detect runtime vulnerabilities (e.g., missing security headers, exposure of sensitive info).

### 7. Deployment / Publish
- **Artifactory Upload**:
    - Downloads the built `.tgz` artifact.
    - Uploads it to a configured Artifactory Generic Repository acting as the "Release" step.
    - **Condition**: Only runs on pushes to `main` after all quality checks pass.

### 8. Monitoring & Alerting
- **Slack Notification**:
    - Runs `always()` at the end of the pipeline.
    - Sends a status message (Success/Failure) to a Slack channel via Webhook.

---

## Key Security Controls
1.  **Shift-Left**: Security scans (Lint, Gitleaks, CodeQL) run immediately.
2.  **Hard Gates**: The pipeline fails if:
    - Code coverage is below 80%.
    - High severity vulnerabilities are found in dependencies or containers.
    - Secrets are detected.
3.  **Minimal Attack Surface**: Production containers use `gcr.io/distroless/nodejs20-debian12`, containing only the application and necessary runtime libraries, no shell or package managers.
