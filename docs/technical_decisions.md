# Technical Decisions and Trade-offs

This document records decisions visible in the current implementation. Future improvements are identified explicitly and are not presented as completed features.

## 1. Rails API backend

**Decision:** Use Ruby on Rails 8 in API-only mode.

**Implementation:** `config/application.rb` enables `config.api_only = true`. Versioned controllers are under `app/controllers/api/v1/`, with shared response and pagination behavior in `Api::V1::BaseController`.

**Why:** Rails provides conventions for routing, Active Record, migrations, validations, JSON responses, and request testing.

**Trade-offs:** The application depends on Rails conventions, and query construction must remain explicit and efficient as the dataset grows.

## 2. PostgreSQL and Active Record

**Decision:** Use PostgreSQL as the relational database and Active Record as the data-access layer.

**Why:** Employees, organizational references, and salary history have strong relational relationships. PostgreSQL foreign keys, decimal types, indexes, and aggregation queries support the domain requirements.

**Trade-offs:** Production performance depends on appropriate indexes, connection-pool sizing, and query plans. PostgreSQL is required for local development and deployment.

## 3. Versioned REST API

**Decision:** Expose resource APIs under `/api/v1`.

**Implementation:** Routes are defined in `config/routes.rb` for employees, countries, departments, salary records, and dashboard summary. Responses use the shared `{ data: ..., meta: ... }` success shape or `{ errors: [...] }` error shape.

**Why:** Resource-oriented endpoints keep frontend integration predictable and leave room for future API versions.

**Trade-offs:** Frontend service modules must remain aligned with the Rails response contract.

## 4. Server-side filtering, sorting, and pagination

**Decision:** Perform employee listing operations in the database rather than loading the complete dataset into Ruby or the browser.

**Implementation:**

- Search covers first name, last name, full name, email, and employee code.
- Country, department, and status filters are applied in Active Record scopes.
- Sort fields are restricted to the whitelist in `EmployeesController`.
- `BaseController#paginate` applies a maximum `per_page` value of 100 and returns page metadata.
- Employee list queries eager-load country and department associations.

**Trade-offs:** The API must manage page and sort parameters, but response size and frontend memory use remain bounded.

## 5. Salary history and calculation

**Decision:** Represent salary changes as multiple `SalaryRecord` rows associated with one employee.

**Implementation:** Salary records contain decimal salary components and effective dates. The model calculates:

```text
net_salary = basic_salary + bonus + allowances - deductions
```

The model rejects negative amounts, invalid currencies, invalid date ranges, and overlapping periods for the same employee. `effective_to = NULL` represents an open-ended period.

**Trade-offs:** Overlap protection is implemented as an application validation rather than a PostgreSQL exclusion constraint. Concurrent writes would require stronger database-level coordination if the system becomes multi-writer or high-volume.

## 6. Currency handling

**Decision:** Keep salary totals separated by currency.

**Implementation:** `Api::V1::DashboardSummary` selects salary records effective on the current date, aggregates components in SQL, and groups by `currency`.

**Why:** INR, USD, EUR, and other currencies cannot be added meaningfully without exchange rates.

**Trade-offs:** The dashboard does not provide a single converted payroll total. Exchange-rate sourcing, conversion dates, and auditability would be required for that feature.

## 7. Dashboard aggregation

**Decision:** Keep dashboard aggregation in `Api::V1::DashboardSummary` rather than placing it in the controller.

**Implementation:** Employee counts, country counts, department counts, and currency-specific salary totals use Active Record grouping, joins, `pluck`, and SQL expressions.

**Why:** This keeps the controller thin and avoids loading all employees and salary records into Ruby objects.

**Trade-offs:** Dashboard semantics depend on the current effective-date definition in the service and should be covered by request specs when changed.

## 8. React/Vite frontend

**Decision:** Use React with Vite and deploy the frontend independently from Rails.

**Implementation:** React Router handles client routes, Axios is centralized in `frontend/src/api.js`, service modules isolate API calls, React Hook Form and Zod handle forms, and Recharts renders dashboard visualizations.

**Why:** Component reuse and independent static deployment fit the HR management interface.

**Trade-offs:** Vercel must receive the correct `VITE_API_BASE_URL`, Rails must allow the exact frontend origin, and SPA history fallback must be configured.

## 9. CORS and production configuration

**Decision:** Allow only the exact frontend origin configured by `FRONTEND_URL`.

**Implementation:** `CorsMiddleware` handles allowed requests and OPTIONS preflight requests. Production uses `DATABASE_URL`, `RAILS_MASTER_KEY`, `FRONTEND_URL`, HTTPS settings, and Puma's Render-provided `PORT`.

**Trade-offs:** Preview or alternate Vercel domains require an intentional configuration change; wildcard origins are not enabled.

## 10. Background jobs

**Decision:** Do not run a background-job service for the current assessment workflow.

**Implementation:** Production Active Job uses Rails' in-process `:async` adapter. Solid Queue has been removed from the application dependency and deployment configuration, so no queue worker or queue database is required.

**Trade-offs:** In-process asynchronous work is not durable across restarts and is not suitable for critical or long-running jobs. A durable job system should be introduced if asynchronous requirements are added.

## 11. Automated testing

**Decision:** Use RSpec for backend model and request tests.

Supporting tools are FactoryBot, Shoulda Matchers, Faker, and SimpleCov.

**Why:** The suite can verify validations, API response contracts, CRUD behavior, filtering, sorting, pagination, salary rules, and dashboard aggregation.

**Verification note:** The repository contains the test suite and coverage configuration. Run `bundle exec rspec` in an environment with Ruby, Bundler, PostgreSQL, and the project dependencies installed; this document does not claim a result that was not executed.

## 12. Deployment strategy

**Decision:** Deploy the Rails API and PostgreSQL on Render and the React/Vite frontend on Vercel.

**Why:** The services can be built and configured independently using environment variables.

**Trade-offs:** Render Free can sleep after inactivity and has limited resources. Database, CORS, frontend API URL, and encrypted Rails credentials must be configured separately.

## 13. Future improvements

Potential future improvements, not currently implemented, include:

- Authentication and role-based authorization.
- Audit logs for salary changes.
- Bulk employee import and export.
- Durable background jobs for long-running tasks.
- Monitoring and error reporting.
- Load testing and production database backups.
