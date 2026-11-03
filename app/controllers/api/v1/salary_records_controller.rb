module Api
  module V1
    class SalaryRecordsController < BaseController
      before_action :set_employee, only: %i[index create]
      before_action :set_salary_record, only: %i[show update destroy]

      def index
        salary_records = @employee.salary_records.includes(:employee).order(effective_from: :desc, id: :desc)
        salary_records, meta = paginate(salary_records)

        render_success(
          data: salary_records.map { |salary_record| salary_record_json(salary_record) },
          meta: meta
        )
      end

      def show
        render_success(data: salary_record_json(@salary_record))
      end

      def create
        salary_record = @employee.salary_records.new(salary_record_params)
        if salary_record.save
          render_success(data: salary_record_json(salary_record), status: :created)
        else
          render_errors(salary_record.errors)
        end
      end

      def update
        if @salary_record.update(salary_record_params)
          render_success(data: salary_record_json(@salary_record))
        else
          render_errors(@salary_record.errors)
        end
      end

      def destroy
        if @salary_record.destroy
          render_success(data: salary_record_json(@salary_record))
        else
          render_errors(@salary_record.errors)
        end
      end

      private

      def set_employee
        @employee = Employee.find(params[:employee_id])
      end

      def set_salary_record
        @salary_record = SalaryRecord.includes(:employee).find(params[:id])
      end

      def salary_record_params
        params.require(:salary_record).permit(
          :basic_salary,
          :bonus,
          :allowances,
          :deductions,
          :currency,
          :effective_from,
          :effective_to
        )
      end

      def salary_record_json(salary_record)
        salary_record.as_json(only: %i[
          id employee_id basic_salary bonus allowances deductions currency effective_from effective_to created_at updated_at
        ]).merge(
          "net_salary" => salary_record.net_salary,
          "employee" => employee_json(salary_record.employee)
        )
      end

      def employee_json(employee)
        employee.as_json(only: %i[id employee_code first_name last_name email status])
      end
    end
  end
end
