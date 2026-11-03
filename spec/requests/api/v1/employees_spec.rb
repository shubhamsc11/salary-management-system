require "rails_helper"

RSpec.describe "Employees API", type: :request do
  let!(:country) { create(:country, name: "India", code: "IN") }
  let!(:other_country) { create(:country, name: "United States", code: "US") }
  let!(:department) { create(:department, name: "Engineering") }
  let!(:other_department) { create(:department, name: "Finance") }

  def json
    JSON.parse(response.body)
  end

  def employee_attributes(overrides = {})
    attributes = attributes_for(
      :employee,
      country_id: country.id,
      department_id: department.id
    )
    attributes.merge(overrides)
  end

  describe "GET /api/v1/employees" do
    let!(:matching_employee) do
      create(
        :employee,
        first_name: "Asha",
        last_name: "Sharma",
        email: "asha.sharma@example.com",
        employee_code: "EMP-000001",
        country: country,
        department: department
      )
    end
    let!(:inactive_employee) do
      create(:employee, status: "inactive", country: other_country, department: other_department)
    end

    it "lists employees with pagination metadata and associations" do
      get "/api/v1/employees", params: { per_page: 1 }

      expect(response).to have_http_status(:ok)
      expect(json).to include("data", "meta")
      expect(json["data"].size).to eq(1)
      expect(json["meta"]).to include("page" => 1, "per_page" => 1, "total_count" => 2, "total_pages" => 2)
      expect(json["data"].first).to include("country", "department")
    end

    it "searches names, full names, email, and employee code" do
      get "/api/v1/employees", params: { search: "asha sharma" }

      expect(json["data"].map { |employee| employee["id"] }).to eq([ matching_employee.id ])
    end

    it "filters by country, department, and status" do
      get "/api/v1/employees", params: {
        country_id: country.id,
        department_id: department.id,
        status: "active"
      }

      expect(json["data"].map { |employee| employee["id"] }).to eq([ matching_employee.id ])
    end

    it "sorts by an approved field and direction" do
      get "/api/v1/employees", params: { sort: "first_name", order: "asc" }

      expect(json["data"].map { |employee| employee["first_name"] }).to eq([ "Asha", inactive_employee.first_name ].sort)
    end

    it "caps page size at 100" do
      get "/api/v1/employees", params: { per_page: 1000 }

      expect(json["meta"]["per_page"]).to eq(100)
    end
  end

  describe "GET /api/v1/employees/:id" do
    it "shows an employee" do
      employee = create(:employee, country: country, department: department)

      get "/api/v1/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)
      expect(json["data"]["id"]).to eq(employee.id)
    end

    it "returns a structured not found response" do
      get "/api/v1/employees/0"

      expect(response).to have_http_status(:not_found)
      expect(json).to eq("errors" => [ { "detail" => "Employee not found" } ])
    end
  end

  describe "POST /api/v1/employees" do
    it "creates an employee" do
      post "/api/v1/employees", params: { employee: employee_attributes(first_name: "New") }

      expect(response).to have_http_status(:created)
      expect(json["data"]["first_name"]).to eq("New")
    end

    it "returns validation errors" do
      post "/api/v1/employees", params: { employee: employee_attributes(email: "not-an-email") }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"].first).to include("email")
    end
  end

  describe "PATCH /api/v1/employees/:id" do
    it "updates an employee" do
      employee = create(:employee, country: country, department: department)

      patch "/api/v1/employees/#{employee.id}", params: { employee: { designation: "Lead Engineer" } }

      expect(response).to have_http_status(:ok)
      expect(json["data"]["designation"]).to eq("Lead Engineer")
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    it "deactivates an employee" do
      employee = create(:employee, country: country, department: department)

      delete "/api/v1/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)
      expect(json["data"]["status"]).to eq("inactive")
      expect(employee.reload.status).to eq("inactive")
    end
  end
end
