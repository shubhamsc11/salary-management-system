module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordNotUnique, with: :render_record_not_unique

      private

      def render_success(data:, status: :ok, meta: nil)
        response = { data: data }
        response[:meta] = meta if meta
        render json: response, status: status
      end

      def render_errors(errors, status: :unprocessable_content)
        formatted_errors = if errors.respond_to?(:to_hash)
          [ errors.to_hash ]
        else
          Array(errors).map { |error| error.respond_to?(:to_h) ? error.to_h : { detail: error.to_s } }
        end

        render json: { errors: formatted_errors }, status: status
      end

      def render_not_found
        render json: { errors: [ { detail: "#{controller_name.singularize.humanize} not found" } ] }, status: :not_found
      end

      def render_record_not_unique
        render json: { errors: [ { detail: "The record conflicts with an existing value" } ] }, status: :unprocessable_content
      end

      def paginate(scope, default_per_page: 25)
        page = positive_integer(params[:page], default: 1)
        per_page = [ positive_integer(params[:per_page], default: default_per_page), 100 ].min
        total_count = scope.count

        paginated_scope = scope.offset((page - 1) * per_page).limit(per_page)
        meta = {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: (total_count.to_f / per_page).ceil
        }

        [ paginated_scope, meta ]
      end

      def positive_integer(value, default:)
        parsed = Integer(value, exception: false)
        parsed&.positive? ? parsed : default
      end
    end
  end
end
