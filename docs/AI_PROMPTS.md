# AI Prompts and AI-Assisted Development

## Introduction

This document contains representative AI prompts for the Salary Management System development workflow. It is a prompt catalogue, not an automatically generated audit trail of every tool, model, or conversation used during development.

The prompts cover planning, implementation, testing, deployment troubleshooting, and documentation. Any prompt outcome must be checked against the repository before it is described as implemented.

No specific AI tool, model, date, or historical outcome is asserted unless it is recorded elsewhere in the repository.

## 1. Project Planning and Architecture

**Prompt:**

```text
Act as a senior Ruby on Rails and React developer.

Help me design an Employee Salary Management System
for an organization managing approximately 10,000 employees.

The backend should use Rails API and PostgreSQL.
The frontend should use React.js.

Identify the core entities, relationships, API structure,
business rules, validations, and implementation strategy.

Follow Rails conventions and maintain clean architecture.
```

**Purpose:**
- Understand project requirements.
- Identify core database entities.
- Plan backend and frontend architecture.
- Define implementation milestones.

## 2. Backend API Development

**Prompt:**

```text
Review the existing Rails API project.

Implement RESTful CRUD APIs for Employees, Countries,
Departments, and Salary Records.

Follow Rails conventions, use Active Record,
strong parameters, validations, and appropriate HTTP status codes.

Keep controllers maintainable and add relevant RSpec tests.
Do not modify unrelated functionality.
```

**Purpose:**
- Implement REST APIs.
- Maintain consistent API responses.
- Apply model validations.
- Improve backend maintainability.

## 3. Employee Search and Pagination

**Prompt:**

```text
Implement employee search, filtering, sorting,
and server-side pagination in the Rails API.

Avoid loading all employee records into memory.
Whitelist sortable columns and validate filter parameters.

Ensure the implementation is efficient for a dataset
of approximately 10,000 employees.
```

**Purpose:**
- Improve listing performance.
- Implement scalable pagination.
- Support efficient filtering and sorting.

## 4. Salary Management

**Prompt:**

```text
Review the SalaryRecord model and its validations.

Implement salary calculation using:
Basic Salary + Bonus + Allowances - Deductions.

Validate non-negative salary amounts,
currency values, and effective date ranges.

Maintain salary history and prevent overlapping
effective periods according to the business rules.
```

**Purpose:**
- Implement salary calculations.
- Maintain salary history.
- Validate salary information.

## 5. React Frontend Development

**Prompt:**

```text
Build an HR management dashboard using React and Vite.

Implement Employees, Salary Records, Countries,
Departments, and Dashboard screens.

Use Axios for API communication.
Use React Router for navigation.
Use React Hook Form and Zod for form validation.

Follow the existing project structure and UI conventions.
Handle loading, error, and empty states.
```

**Purpose:**
- Develop frontend modules.
- Integrate backend APIs.
- Improve form handling and user experience.

## 6. Dashboard and Analytics

**Prompt:**

```text
Implement dashboard summary metrics for the
Salary Management System.

Use efficient database aggregation.
Avoid N+1 queries.

Ensure salary summaries are grouped by currency.
Do not combine amounts from different currencies
without an explicit currency conversion.
```

**Purpose:**
- Generate dashboard summaries.
- Improve query efficiency.
- Maintain correct currency calculations.

## 7. Testing

**Prompt:**

```text
Review the existing RSpec test suite.

Add model and request specs for employee management,
salary calculations, validations, filtering, sorting,
pagination, and API error responses.

Use FactoryBot for test data.
Do not remove existing assertions to make tests pass.
Report the actual test results.
```

**Purpose:**
- Improve test coverage.
- Verify business rules.
- Identify edge cases.

## 8. Deployment Configuration

**Prompt:**

```text
Prepare the Rails API for deployment on Render
and the React/Vite frontend for deployment on Vercel.

Configure production environment variables,
database connection, CORS, Puma binding,
and health check endpoint.

Do not commit secrets or credentials.
```

**Purpose:**
- Configure production deployment.
- Resolve environment configuration issues.
- Verify frontend-backend communication.

## 9. Debugging Solid Queue Deployment

**Prompt:**

```text
Investigate the Rails production deployment error:

PG::UndefinedTable:
relation "solid_queue_recurring_tasks" does not exist.

Inspect the Solid Queue configuration,
database migrations, Puma configuration,
and production environment.

Determine whether background jobs are required.
Recommend the smallest safe fix.
Do not create tables manually.
```

**Purpose:**
- Identify deployment issues.
- Understand background job configuration.
- Simplify deployment where background processing is unnecessary.

## 10. Documentation

**Prompt:**

```text
Review the final Rails and React project.

Prepare README, architecture documentation,
database design, technical decisions,
and AI prompt documentation.

Base all documentation on the actual implementation.
Do not invent API endpoints, test results,
database columns, or performance benchmarks.
```

**Purpose:**
- Prepare technical documentation.
- Explain architecture.
- Document development decisions.

## AI Usage and Human Review

AI assistance is treated as a development aid, not as a replacement for engineering decisions.

Every suggested implementation should be reviewed through:

1. Source code inspection.
2. Git diff review.
3. Automated testing.
4. Manual functional verification.
5. Production build verification.

## AI Prompt Tracking

The repository does not contain a verified historical prompt log. The following table is intentionally left as a template rather than inventing usage history:

| Date | Tool / Model | Task | Files Changed | Verification |
|---|---|---|---|---|
| TODO | TODO | Architecture | TODO | TODO |
| TODO | TODO | Backend APIs | TODO | TODO |
| TODO | TODO | Frontend | TODO | TODO |
| TODO | TODO | Testing | TODO | TODO |
| TODO | TODO | Deployment | TODO | TODO |
