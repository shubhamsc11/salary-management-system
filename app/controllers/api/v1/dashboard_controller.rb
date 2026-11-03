module Api
  module V1
    class DashboardController < BaseController
      def summary
        render_success(data: DashboardSummary.new.call)
      end
    end
  end
end
