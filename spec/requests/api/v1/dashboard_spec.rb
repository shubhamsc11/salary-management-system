require "rails_helper"

RSpec.describe "Dashboard API", type: :request do
  def json
    JSON.parse(response.body)
  end

  it "returns employee, organizational, and currency-separated current salary summaries" do
    country = create(:country, name: "India", code: "IN")
    department = create(:department, name: "Engineering")
    active_employee = create(:employee, country: country, department: department, status: "active")
    inactive_employee = create(:employee, country: country, department: department, status: "inactive")

    create(
      :salary_record,
      employee: active_employee,
      basic_salary: 100_000,
      bonus: 10_000,
      allowances: 5_000,
      deductions: 2_000,
      currency: "INR",
      effective_from: Date.current
    )
    create(
      :salary_record,
      employee: inactive_employee,
      basic_salary: 2_000,
      bonus: 100,
      allowances: 50,
      deductions: 25,
      currency: "USD",
      effective_from: Date.current
    )
    create(
      :salary_record,
      employee: active_employee,
      basic_salary: 50_000,
      currency: "INR",
      effective_from: 2.years.ago.to_date,
      effective_to: 1.year.ago.to_date
    )

    get "/api/v1/dashboard/summary"

    expect(response).to have_http_status(:ok)
    expect(json["data"]["employee_summary"]).to eq("total" => 2, "active" => 1, "inactive" => 1)
    expect(json["data"]["country_statistics"]).to include(
      "country" => "India", "employee_count" => 2
    )
    expect(json["data"]["department_statistics"]).to include(
      "department" => "Engineering", "employee_count" => 2
    )

    inr = json["data"]["salary_summary"].find { |summary| summary["currency"] == "INR" }
    usd = json["data"]["salary_summary"].find { |summary| summary["currency"] == "USD" }
    expect(inr).to include("total_basic_salary" => "100000.0", "total_net_salary" => "113000.0")
    expect(usd).to include("total_basic_salary" => "2000.0", "total_net_salary" => "2125.0")
  end

  it "returns empty aggregates when there is no data" do
    get "/api/v1/dashboard/summary"

    expect(response).to have_http_status(:ok)
    expect(json["data"]["employee_summary"]).to eq("total" => 0, "active" => 0, "inactive" => 0)
    expect(json["data"]["country_statistics"]).to eq([])
    expect(json["data"]["department_statistics"]).to eq([])
    expect(json["data"]["salary_summary"]).to eq([])
  end
end
