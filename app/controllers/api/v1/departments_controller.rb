module Api
  module V1
    class DepartmentsController < BaseController
      before_action :set_department, only: %i[show update destroy]

      def index
        departments = Department.order(:name)
        if params[:search].present?
          term = "%#{Department.sanitize_sql_like(params[:search].to_s.strip)}%"
          departments = departments.where("name ILIKE :term", term: term)
        end

        departments, meta = paginate(departments)
        render_success(data: departments.map { |department| department_json(department) }, meta: meta)
      end

      def show
        render_success(data: department_json(@department))
      end

      def create
        department = Department.new(department_params)
        if department.save
          render_success(data: department_json(department), status: :created)
        else
          render_errors(department.errors)
        end
      end

      def update
        if @department.update(department_params)
          render_success(data: department_json(@department))
        else
          render_errors(@department.errors)
        end
      end

      def destroy
        if @department.destroy
          render_success(data: department_json(@department))
        else
          render_errors(@department.errors)
        end
      end

      private

      def set_department
        @department = Department.find(params[:id])
      end

      def department_params
        params.require(:department).permit(:name)
      end

      def department_json(department)
        department.as_json(only: %i[id name created_at updated_at])
      end
    end
  end
end
