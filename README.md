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

```bash
# unit tests (5 shards) with coverage
$ pnpm run test:unit

# e2e tests
$ pnpm run test:e2e

# test coverage check
$ pnpm run coverage:check
```

## Quality & Security Checks

You can run the same security gates locally using Husky and lint-staged hooks:

```bash
# Linting
$ pnpm run lint

# Spellcheck
$ pnpm run spellcheck
```

## DevOps Pipeline Configuration

The GitHub Actions pipeline (`.github/workflows/devsecops.yml`) requires the following secrets to be configured in your repository settings:

| Secret Name | Description |
|---|---|
| `ARTIFACTORY_URL` | URL of your Artifactory instance |
| `ARTIFACTORY_REPO` | Target repository key (generic) |
| `ARTIFACTORY_USER` | Username for upload |
| `ARTIFACTORY_TOKEN` | API Token or Password |
| `SEMGREP_APP_TOKEN` | Token for Semgrep cloud (optional if local config) |
| `TEAMS_WEBHOOK` | Webhook URL for Microsoft Teams channel |
| `EMAIL_USERNAME` | SMTP Username/Email |
| `EMAIL_PASSWORD` | SMTP Password/App Password |
| `EMAIL_TO` | Recipient email address(es) |

### How to Obtain Secrets

**ARTIFACTORY_***:
1. Log in to your JFrog Artifactory instance.
2. Go to **User Profile** to get your API Token (`ARTIFACTORY_TOKEN`).
3. Use the URL of your instance for `ARTIFACTORY_URL`.
4. Ensure you have a "Generic" repository created (default `ARTIFACTORY_REPO` name).

**SEMGREP_APP_TOKEN**:
1. Log in to [Semgrep Cloud Platform](https://semgrep.dev/login).
2. Go to **Settings** > **Tokens**.
3. Create a new "Agent Token" (or "App Token").
4. Add it as a secret to enable findings to be uploaded to the dashboard.

**TEAMS_WEBHOOK**:
1. Go to your Microsoft Teams channel.
2. Click **... (More options)** -> **Connectors**.
3. Search for "Incoming Webhook" and configure it.
4. Copy the generated URL.

**EMAIL_*** (Example for Gmail):
1. Enable 2-Factor Authentication on your Google Account.
2. Go to **App Passwords** settings.
3. Generate a new password for "Mail".
4. Use your email as `EMAIL_USERNAME` and this app password as `EMAIL_PASSWORD`.

## Academic Justification

This pipeline implements a shift-left DevSecOps strategy by integrating security controls early in the SDLC. Performance is optimized using caching, parallel execution, and severity-based enforcement. The design balances security coverage with pipeline efficiency, making it suitable for enterprise-scale systems.

## License

Nest is [MIT licensed](LICENSE).
