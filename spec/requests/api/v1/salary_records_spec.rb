require "rails_helper"

RSpec.describe "Salary Records API", type: :request do
  def json
    JSON.parse(response.body)
  end

  let!(:employee) { create(:employee) }

  def salary_attributes(overrides = {})
    {
      basic_salary: 100_000,
      bonus: 10_000,
      allowances: 5_000,
      deductions: 2_000,
      currency: "INR",
      effective_from: Date.current,
      effective_to: nil
    }.merge(overrides)
  end

  it "creates, lists salary history with pagination, and calculates net salary" do
    post "/api/v1/employees/#{employee.id}/salary_records", params: { salary_record: salary_attributes }
    expect(response).to have_http_status(:created)
    expect(json["data"]["net_salary"]).to eq("113000.0")
    salary_record_id = json["data"]["id"]

    get "/api/v1/employees/#{employee.id}/salary_records", params: { per_page: 1 }
    expect(response).to have_http_status(:ok)
    expect(json["data"].first["id"]).to eq(salary_record_id)
    expect(json["meta"]).to include("total_count" => 1, "per_page" => 1)
  end

  it "shows, updates, and deletes a salary record" do
    salary_record = create(:salary_record, employee: employee, effective_from: Date.current)

    get "/api/v1/salary_records/#{salary_record.id}"
    expect(response).to have_http_status(:ok)
    expect(json["data"]["employee"]["id"]).to eq(employee.id)

    patch "/api/v1/salary_records/#{salary_record.id}", params: { salary_record: { bonus: 20_000 } }
    expect(response).to have_http_status(:ok)
    expect(json["data"]["bonus"]).to eq("20000.0")

    delete "/api/v1/salary_records/#{salary_record.id}"
    expect(response).to have_http_status(:ok)
    expect(SalaryRecord.exists?(salary_record.id)).to be(false)
  end

  it "returns validation errors for negative amounts, invalid currency, and invalid dates" do
    post "/api/v1/employees/#{employee.id}/salary_records", params: {
      salary_record: salary_attributes(basic_salary: -1, currency: "rupees", effective_to: Date.current - 1.day)
    }

    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("basic_salary", "currency", "effective_to")
  end

  it "prevents overlapping salary periods, including open-ended periods" do
    create(:salary_record, employee: employee, effective_from: Date.current - 1.year, effective_to: nil)

    post "/api/v1/employees/#{employee.id}/salary_records", params: {
      salary_record: salary_attributes(effective_from: Date.current - 1.month)
    }

    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("effective_from")
  end

  it "handles missing employees and salary records" do
    get "/api/v1/employees/0/salary_records"
    expect(response).to have_http_status(:not_found)

    get "/api/v1/salary_records/0"
    expect(response).to have_http_status(:not_found)
  end
end
