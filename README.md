# Salary Management System

A web-based salary management system for HR managers. The application provides employee, organization, salary history, and dashboard APIs through Rails, with a React/Vite frontend.

## Features

- Employee CRUD, search, filtering, sorting, status management, and pagination.
- Country and department CRUD with association safeguards.
- Salary history CRUD with net-salary calculation, currency support, effective-date validation, and overlap protection.
- Dashboard employee, organization, and currency-aware salary summaries.
- PostgreSQL-backed persistence and database-level aggregation for large datasets.
- Seed support for 10,000 employees.

## Technology stack

| Layer | Technology |
| --- | --- |
| Backend | Ruby 3.4, Rails 8 API mode |
| Database | PostgreSQL |
| Frontend | React.js, Vite |
| API client | Axios |
| Routing | React Router DOM |
| Forms and validation | React Hook Form, Zod |
| Charts | Recharts |
| Styling and icons | Tailwind CSS, Lucide React |
| Backend tests | RSpec, FactoryBot, Shoulda Matchers, Faker, SimpleCov |
| Hosting | Render and Vercel |

## Project structure

```text
app/                 Rails application code
config/routes.rb     Versioned API routes
db/                  Migrations, schema, and seed data
docs/                Architecture and database documentation
frontend/            React/Vite application
spec/                RSpec request and model specs
render.yaml          Render service and PostgreSQL configuration
```

## Local setup

### Prerequisites

- Ruby 3.4.12 and Bundler
- PostgreSQL
- Node.js 20.19+ (Node 22.12.0 is specified in `frontend/.nvmrc`)
- npm

### Backend

From the repository root:

```bash
bundle install
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
bin/rails server
```

The API runs at `http://localhost:3000`.

The seed command creates or finds reference countries and departments and generates the employee dataset. Faker is a regular application dependency because production seeding also uses it.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Start Vite:

```bash
npm run dev
```

The Vite development proxy also supports the default `/api/v1` configuration.

## API

All application APIs are versioned under `/api/v1`:

- `employees`
- `countries`
- `departments`
- `employees/:employee_id/salary_records`
- `salary_records`
- `dashboard/summary`

The health endpoint is `/up`. See [config/routes.rb](config/routes.rb) for the complete route list and [docs/requirements.md](docs/requirements.md) for the product scope.

## Production deployment

### Render backend

The backend is configured in [render.yaml](render.yaml) for a Render web service and PostgreSQL database.

- Runtime: Ruby
- Build command: `./bin/render-build.sh`
- Start command: `bundle exec puma -C config/puma.rb`
- Health check: `/up`
- Database: Render PostgreSQL through `DATABASE_URL`
- Puma binds to `0.0.0.0` and uses Render's `PORT`

The build script installs dependencies and runs `bin/rails db:prepare`. Do not seed automatically during the build. After the service is available, run the seed task manually when initial demo data is required:

```bash
RAILS_ENV=production bundle exec rails db:seed
```

Required Render environment variables:

```text
DATABASE_URL       # supplied by the Render PostgreSQL service
RAILS_MASTER_KEY
FRONTEND_URL       # exact Vercel origin, for example https://salary-management-system-beryl.vercel.app
```

`APP_HOST` is optional and is used for generated mailer URLs. Production HTTPS is enabled and CORS accepts only the configured `FRONTEND_URL`.

This application currently does not run a background-job service. Production Active Job uses Rails' in-process `:async` adapter; no Solid Queue worker or queue database is required.

### Vercel frontend

Configure the Vercel project with:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20.19+ or the version from `frontend/.nvmrc`

Production environment variable:

```env
VITE_API_BASE_URL=https://your-render-api-host.onrender.com/api/v1
```

The Vercel SPA fallback is defined in [frontend/vercel.json](frontend/vercel.json). Environment variable changes require a new Vercel deployment because Vite embeds them at build time.

## Testing and quality checks

Backend:

```bash
bundle exec rspec
bin/rubocop
bin/brakeman --no-pager
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

SimpleCov writes coverage output to `coverage/` when the RSpec suite runs.

## Performance and security

- Collection APIs use server-side pagination with bounded page sizes.
- Employee queries use indexed filters and eager loading where associations are returned.
- Dashboard summaries use database aggregation and preserve currency separation.
- Production database credentials and Rails credentials are supplied through environment variables.
- `.env` files and `config/master.key` are ignored by Git.
- CORS is restricted to the configured frontend origin; wildcard origins are not enabled.
- Render Free may sleep after inactivity, so the first request can have a cold-start delay.

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Database design](docs/database_design.md)
- [Technical decisions](docs/technical_decisions.md)
- [AI prompts](docs/AI_PROMPTS.md)
