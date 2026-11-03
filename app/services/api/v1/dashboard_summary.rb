module Api
  module V1
    class DashboardSummary
      def call
        {
          employee_summary: employee_summary,
          country_statistics: country_statistics,
          department_statistics: department_statistics,
          salary_summary: salary_summary,
          salary_effective_on: Date.current
        }
      end

      private

      def employee_summary
        counts = Employee.group(:status).count
        {
          total: counts.values.sum,
          active: counts.fetch("active", 0),
          inactive: counts.fetch("inactive", 0)
        }
      end

      def country_statistics
        Country
          .left_joins(:employees)
          .group("countries.id", "countries.name")
          .order("countries.name ASC")
          .pluck("countries.name", "COUNT(employees.id)")
          .map { |name, count| { country: name, employee_count: count } }
      end

      def department_statistics
        Department
          .left_joins(:employees)
          .group("departments.id", "departments.name")
          .order("departments.name ASC")
          .pluck("departments.name", "COUNT(employees.id)")
          .map { |name, count| { department: name, employee_count: count } }
      end

      def salary_summary
        current_salary_scope
          .select(
            "currency",
            "COALESCE(SUM(basic_salary), 0) AS total_basic_salary",
            "COALESCE(SUM(bonus), 0) AS total_bonus",
            "COALESCE(SUM(allowances), 0) AS total_allowances",
            "COALESCE(SUM(deductions), 0) AS total_deductions",
            "COALESCE(SUM(basic_salary + bonus + allowances - deductions), 0) AS total_net_salary"
          )
          .group(:currency)
          .order(:currency)
          .map do |record|
            {
              currency: record.currency,
              total_basic_salary: record.total_basic_salary,
              total_bonus: record.total_bonus,
              total_allowances: record.total_allowances,
              total_deductions: record.total_deductions,
              total_net_salary: record.total_net_salary
            }
          end
      end

      def current_salary_scope
        SalaryRecord.where("effective_from <= ?", Date.current)
          .where("effective_to IS NULL OR effective_to >= ?", Date.current)
      end
    end
  end
end
