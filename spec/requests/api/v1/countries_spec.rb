require "rails_helper"

RSpec.describe "Countries API", type: :request do
  def json
    JSON.parse(response.body)
  end

  let!(:country) { create(:country, name: "India", code: "IN", currency_code: "INR") }

  it "lists, searches, paginates, and shows countries" do
    create(:country, name: "United States", code: "US", currency_code: "USD")

    get "/api/v1/countries", params: { search: "ind", per_page: 1 }
    expect(response).to have_http_status(:ok)
    expect(json["data"].map { |item| item["id"] }).to eq([ country.id ])
    expect(json["meta"]).to include("page" => 1, "per_page" => 1, "total_count" => 1)

    get "/api/v1/countries/#{country.id}"
    expect(response).to have_http_status(:ok)
    expect(json["data"]).to include("name" => "India", "code" => "IN", "currency_code" => "INR")
  end

  it "creates and updates a country" do
    post "/api/v1/countries", params: { country: { name: "Germany", code: "DE", currency_code: "EUR" } }
    expect(response).to have_http_status(:created)

    country_id = json["data"]["id"]
    patch "/api/v1/countries/#{country_id}", params: { country: { name: "Federal Republic of Germany" } }
    expect(response).to have_http_status(:ok)
    expect(json["data"]["name"]).to eq("Federal Republic of Germany")
  end

  it "returns validation errors for missing fields and duplicate codes" do
    post "/api/v1/countries", params: { country: { name: "", code: "IN", currency_code: "INR" } }
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("name")

    post "/api/v1/countries", params: { country: { name: "Another India", code: "in", currency_code: "INR" } }
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("code")
  end

  it "prevents deletion of an associated country" do
    create(:employee, country: country)

    delete "/api/v1/countries/#{country.id}"
    expect(response).to have_http_status(:unprocessable_content)
    expect(Country.exists?(country.id)).to be(true)
  end

  it "returns not found for a missing country" do
    get "/api/v1/countries/0"

    expect(response).to have_http_status(:not_found)
    expect(json["errors"].first["detail"]).to eq("Country not found")
  end

  it "deletes an unassociated country" do
    delete "/api/v1/countries/#{country.id}"

    expect(response).to have_http_status(:ok)
    expect(Country.exists?(country.id)).to be(false)
  end
end
