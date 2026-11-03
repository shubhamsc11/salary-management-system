import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import CountriesPage from './pages/Countries/CountriesPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import DepartmentsPage from './pages/Departments/DepartmentsPage'
import EmployeesPage from './pages/Employees/EmployeesPage'
import SalaryRecordsPage from './pages/SalaryRecords/SalaryRecordsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="salary-records" element={<SalaryRecordsPage />} />
          <Route path="countries" element={<CountriesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
