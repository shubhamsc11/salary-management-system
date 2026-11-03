module Api
  module V1
    class CountriesController < BaseController
      before_action :set_country, only: %i[show update destroy]

      def index
        countries = Country.order(:name)
        if params[:search].present?
          term = "%#{Country.sanitize_sql_like(params[:search].to_s.strip)}%"
          countries = countries.where("name ILIKE :term OR code ILIKE :term", term: term)
        end

        countries, meta = paginate(countries)
        render_success(data: countries.map { |country| country_json(country) }, meta: meta)
      end

      def show
        render_success(data: country_json(@country))
      end

      def create
        country = Country.new(country_params)
        if country.save
          render_success(data: country_json(country), status: :created)
        else
          render_errors(country.errors)
        end
      end

      def update
        if @country.update(country_params)
          render_success(data: country_json(@country))
        else
          render_errors(@country.errors)
        end
      end

      def destroy
        if @country.destroy
          render_success(data: country_json(@country))
        else
          render_errors(@country.errors)
        end
      end

      private

      def set_country
        @country = Country.find(params[:id])
      end

      def country_params
        params.require(:country).permit(:name, :code, :currency_code)
      end

      def country_json(country)
        country.as_json(only: %i[id name code currency_code created_at updated_at])
      end
    end
  end
end
