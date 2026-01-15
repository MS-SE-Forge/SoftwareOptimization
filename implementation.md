# DevSecOps Pipeline Implementation

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

- **Unit Tests & Coverage**:
  - Runs unit tests and collects coverage in a single job.
  - Excludes non-logic files (e.g., `main.ts`, `*.module.ts`, `prisma.service.ts`) to focus on core business logic.
  - **Metric Calculation**: Automatically computes an **Average Coverage Score** using `bc` (average of Lines, Statements, Functions, and Branches).
  - Publishes a detailed coverage table directly to the **GitHub Job Summary**.
- **E2E Tests**:
  - Spins up a **MongoDB** service container with a replica set configuration.
  - Runs end-to-end tests against the database to verify full system integration.

### 4. Security Scanning (SAST & SCA)

- **CodeQL**: GitHub's semantic analysis engine. Pinned to **v4 (SHA)** for immutable security and OpenSSF compliance.
- **Semgrep**: Lightweight static analysis for security and correctness.
- **Dependency Audit**: Runs `pnpm audit` (High severity) and fails the pipeline on vulnerabilities.
- **IaC Scanning (Checkov)**: Scans the `Dockerfile` for misconfigurations. Specific checks like `CKV_DOCKER_2` (Healthcheck) are skipped to favor orchestration-level health checks.

### 5. Container Security

- **Docker Build**: Builds the image using a **Distroless** base (`nodejs20-debian12`).
- **Trivy Scan**: Scans the built image for vulnerabilities. Fails the pipeline on **Critical/High** issues using `fail-on: '1'`.
- **Image Signing Verification**:
  - **Cosign Integration**: Uses `sigstore/cosign-installer` to verify image integrity.
  - **Test Case**: Generates an ephemeral key pair, signs the image blob, and verifies the signature within the pipeline to ensure the signing infrastructure is functional.

### 6. Dynamic Application Security Testing (DAST)

- **OWASP ZAP Baseline Scan**:
  - Spins up the application container using `docker load` to scan the exact image built in previous steps.
  - Scans for runtime vulnerabilities.
  - **Rule Management**: Exclusions are managed via `zap_rules.tsv`. Currently ignores rule `10049` (Non-Storable Content) to avoid false positives on non-sensitive endpoints.

### 1. Versioning & Tagging
- **SHA-based Tagging**: Every build is uniquely identified by its GitHub Commit SHA.
- **Latest Reference**: On every successful deployment to `main`, the artifact is also uploaded to a `latest/` directory in Artifactory, and the Docker image is tagged as `:latest`. This allows downstream consumers and CD tools to always pull the most recent stable version without manual version updates.

### 7. Deployment / Publish

- **Artifactory Upload**:
  - Uploads the packaged `.tgz` artifact to Artifactory.
  - **Hard Gate**: Only runs on pushes to `main` if **ALL** preceding jobs (Lint, Test, Secret, SAST, DAST, IaC) succeed.

### 8. Monitoring & Alerting

- **MS Teams (Adaptive Cards)**:
  - Sends a detailed **Job Scorecard** notification using the modern `Adaptive Card` format (v1.4).
  - **Layout**: Features a **3-Column Table** (Job, Criticality, Status) with visual separators for high readability.
  - **Status Intelligence**: Automatically detects `SUCCESS`, `FAILED`, and `CANCELLED` outcomes, updating the card's accent color (Green/Red/Gray) accordingly.
  - **Granular Indicators**: Reports on **All 16 Jobs** (including `dependency-review`) with specific icons:
    - ✅ **Success**: Job completed successfully.
    - ❌ **Failed**: Job encountered an error.
    - ⏹️ **Cancelled**: Workflow was manually stopped.
    - ⏭️ **Skipped**: Job was not required for the current run (e.g., PR checks).
  - Includes the final Average Coverage Score and deployment status details.
  - Dispatched via a Power Automate Workflow webhook.

---

## Key Security Controls
1.  **Shift-Left**: Security scans run immediately on every push/PR.
2.  **Hard Security Gates**: Deployment and final "Pipeline Success" jobs depend on every individual security scan result.
3.  **Minimal Attack Surface**: Production containers use Distroless to eliminate unnecessary system binaries.
4.  **Pinning**: Actions are pinned to major versions or SHAs to prevent supply chain attacks.
5.  **Artifact Lifecycle**: Uses `docker save/load` to ensure that the exact same image scanned by Trivy is the one tested by ZAP.
