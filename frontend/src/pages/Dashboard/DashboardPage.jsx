import { BriefcaseBusiness, CircleDollarSign, UserCheck, UserRound, UsersRound } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import SectionCard from '../../components/common/SectionCard'
import useAsync from '../../hooks/useAsync'
import { getDashboardSummary } from '../../services/dashboardService'

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e']

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><span className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></span></div></div>
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0))
}

export default function DashboardPage() {
  const { data: response, loading, error, retry } = useAsync(getDashboardSummary)
  const summary = response?.data

  if (loading) return <><PageHeader title="Dashboard" description="A clear view of your workforce and compensation landscape." /><LoadingSpinner label="Loading dashboard insights..." /></>
  if (error) return <><PageHeader title="Dashboard" description="A clear view of your workforce and compensation landscape." /><SectionCard><ErrorState message={error} onRetry={retry} /></SectionCard></>

  const employees = summary?.employee_summary || { total: 0, active: 0, inactive: 0 }
  const countries = summary?.country_statistics || []
  const departments = summary?.department_statistics || []
  const salaries = summary?.salary_summary || []
  const pieData = [{ name: 'Active', value: employees.active }, { name: 'Inactive', value: employees.inactive }]

  return <div>
    <PageHeader title="Dashboard" description="A clear view of your workforce and compensation landscape." action={<span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">As of {summary?.salary_effective_on || 'today'}</span>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total employees" value={employees.total} detail="Across all locations" icon={UsersRound} tone="bg-blue-50 text-blue-600" />
      <StatCard label="Active employees" value={employees.active} detail="Currently active" icon={UserCheck} tone="bg-emerald-50 text-emerald-600" />
      <StatCard label="Inactive employees" value={employees.inactive} detail="Not currently active" icon={UserRound} tone="bg-slate-100 text-slate-500" />
      <StatCard label="Currencies" value={salaries.length} detail="Current salary currencies" icon={CircleDollarSign} tone="bg-amber-50 text-amber-600" />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Workforce distribution" description="Active versus inactive employees">
        {employees.total === 0 ? <EmptyState title="No workforce data" /> : <div className="flex min-h-64 items-center justify-center gap-8 p-5"><div className="h-56 w-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>{pieData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-4">{pieData.map((item, index) => <div key={item.name} className="flex items-center gap-3"><span className="size-2.5 rounded-full" style={{ backgroundColor: chartColors[index] }} /><div><p className="text-sm font-semibold text-slate-800">{item.value}</p><p className="text-xs text-slate-500">{item.name} employees</p></div></div>)}</div></div>}
      </SectionCard>
      <SectionCard title="Salary overview" description="Current effective records by currency">
        {!salaries.length ? <EmptyState title="No salary data" description="Current salary summaries will appear here once records are available." /> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Currency</th><th className="px-3 py-3">Basic</th><th className="px-3 py-3">Bonus</th><th className="px-3 py-3">Allowances</th><th className="px-3 py-3">Deductions</th><th className="px-5 py-3">Net</th></tr></thead><tbody className="divide-y divide-slate-100">{salaries.map((salary) => <tr key={salary.currency}><td className="px-5 py-3 font-bold text-slate-800">{salary.currency}</td><td className="px-3 py-3 text-slate-600">{formatMoney(salary.total_basic_salary, salary.currency)}</td><td className="px-3 py-3 text-slate-600">{formatMoney(salary.total_bonus, salary.currency)}</td><td className="px-3 py-3 text-slate-600">{formatMoney(salary.total_allowances, salary.currency)}</td><td className="px-3 py-3 text-slate-600">{formatMoney(salary.total_deductions, salary.currency)}</td><td className="px-5 py-3 font-bold text-slate-900">{formatMoney(salary.total_net_salary, salary.currency)}</td></tr>)}</tbody></table></div>}
      </SectionCard>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <DistributionChart title="Employees by country" icon={BriefcaseBusiness} rows={countries} labelKey="country" />
      <DistributionChart title="Employees by department" icon={BriefcaseBusiness} rows={departments} labelKey="department" />
    </div>
  </div>
}

function DistributionChart({ title, icon: Icon, rows, labelKey }) {
  const chartData = rows.slice(0, 10).map((row) => ({ name: row[labelKey], employees: row.employee_count }))
  return <SectionCard title={title} description="Current employee distribution"><div className="h-72 p-4">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} fontSize={11} /><YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#64748b' }} /><Tooltip /><Legend /><Bar dataKey="employees" name="Employees" fill="#2563eb" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="No distribution data" />}</div><div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><Icon size={14} /> Showing up to 10 groups</div></SectionCard>
}
