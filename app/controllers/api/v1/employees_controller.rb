module Api
  module V1
    class EmployeesController < BaseController
      SORTABLE_FIELDS = %w[employee_code first_name last_name email joining_date status created_at].freeze

      before_action :set_employee, only: %i[show update destroy]

      def index
        employees = Employee.includes(:country, :department)
        employees = apply_filters(employees)
        employees = apply_sort(employees)

        employees, meta = paginate(employees, default_per_page: 25)

        render_success(
          data: employees.map { |employee| employee_json(employee) },
          meta: meta
        )
      end

      def show
        render_success(data: employee_json(@employee))
      end

      def create
        employee = Employee.new(employee_params)

        if employee.save
          render_success(data: employee_json(employee), status: :created)
        else
          render_errors(employee.errors)
        end
      end

      def update
        if @employee.update(employee_params)
          render_success(data: employee_json(@employee))
        else
          render_errors(@employee.errors)
        end
      end

      def destroy
        if @employee.update(status: "inactive")
          render_success(data: employee_json(@employee))
        else
          render_errors(@employee.errors)
        end
      end

      private

      def set_employee
        @employee = Employee.includes(:country, :department).find(params[:id])
      end

      def employee_params
        params.require(:employee).permit(
          :employee_code,
          :first_name,
          :last_name,
          :email,
          :country_id,
          :department_id,
          :designation,
          :joining_date,
          :status
        )
      end

      def apply_filters(scope)
        if params[:search].present?
          term = "%#{Employee.sanitize_sql_like(params[:search].to_s.strip)}%"
          scope = scope.where(
            "first_name ILIKE :term OR last_name ILIKE :term OR (first_name || ' ' || last_name) ILIKE :term OR email ILIKE :term OR employee_code ILIKE :term",
            term: term
          )
        end

        country_filter = params[:country].presence || params[:country_id].presence
        department_filter = params[:department].presence || params[:department_id].presence
        scope = filter_by_association(scope, :country, country_filter) if country_filter
        scope = filter_by_association(scope, :department, department_filter) if department_filter
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope
      end

      def filter_by_association(scope, association, value)
        reflection = Employee.reflect_on_association(association)
        return scope.where("#{association}_id" => value) if value.to_s.match?(/\A\d+\z/)

        table = reflection.klass.arel_table
        escaped_value = Employee.sanitize_sql_like(value.to_s)
        columns = association == :country ? %i[code name] : %i[name]
        conditions = columns.map do |column|
          table[column].eq(value).or(table[column].matches("%#{escaped_value}%"))
        end
        scope.joins(association).where(conditions.reduce(&:or))
      end

      def apply_sort(scope)
        field = SORTABLE_FIELDS.include?(params[:sort].to_s) ? params[:sort] : "created_at"
        direction = params[:order].to_s.casecmp("asc").zero? ? :asc : :desc
        scope.order(field => direction, id: :desc)
      end

      def employee_json(employee)
        employee.as_json(only: %i[id employee_code first_name last_name email designation joining_date status created_at updated_at]).merge(
          country: employee.country.as_json(only: %i[id name code currency_code]),
          department: employee.department.as_json(only: %i[id name])
        )
      end
    end
  end
end
