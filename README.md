<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
  <h1 align="center">Software Optimization API - DevSecOps Implementation</h1>
</p>

## Description

This repository demonstrates a secure, optimized, and automated pipeline for a NestJS application. It implements strict DevSecOps practices including SAST, DAST, Container Security, and automated compliance checks.

For a detailed breakdown of the pipeline architecture, see [implementation.md](./implementation.md).

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 (`npm i -g pnpm`)
- **Docker**: For containerization and running services
- **MongoDB**: The application uses MongoDB as the database provider

## Project Setup

```bash
$ pnpm install
$ pnpm prisma:generate
```

## Running the Application

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Running with Docker

You can run the application fully containerized or just the database.

### Start Database (MongoDB)
```bash
$ docker-compose up -d mongo
```

### Build & Run Application
```bash
$ docker build -t software-optimization-api .
$ docker run -p 3000:3000 --env-file .env software-optimization-api
```

## Running Tests

This project enforces high code quality with multiple testing layers.

### Execute Tests Locally
```bash
# unit tests
$ pnpm run test:unit

# e2e tests
$ pnpm run test:e2e

# test coverage check
$ pnpm run coverage:check
```

### Quality Metrics
- **Unit Tests**: Coverage exceeded **91%** across lines, statements, functions, and branches.
- **E2E Tests**: Fully automated MongoDB integration tests.
- **Reporting**: Detailed coverage tables are available in the GitHub Action Job Summary.

## DevSecOps Pipeline Configuration

The GitHub Actions pipeline (`.github/workflows/devsecops.yml`) uses an **Adaptive Card** payload for notifications. Ensure the following secrets are configured:

| Secret Name | Description |
|---|---|
| `ARTIFACTORY_URL` | URL of your Artifactory instance |
| `ARTIFACTORY_REPO` | Target repository key (generic) |
| `ARTIFACTORY_USER` | Username for upload |
| `ARTIFACTORY_TOKEN` | API Token or Password |
| `SEMGREP_APP_TOKEN` | Token for Semgrep cloud (optional) |
| `TEAMS_WEBHOOK` | Webhook URL for MS Teams (Power Automate Workflow) |

### How to Obtain Secrets

**TEAMS_WEBHOOK**:
1. Go to your Microsoft Teams channel.
2. Configure a "Power Automate Workflow" (replaces legacy Incoming Webhook).
3. Copy the URL from the "HTTP POST URL" field.

## Academic Justification

This pipeline implements a shift-left DevSecOps strategy by integrating security controls early in the SDLC. Performance is optimized using caching and parallelization. The design achieves over **91% code coverage** and enforces strict security gates for all PRs and deployments.

## License

Nest is [MIT licensed](LICENSE).
