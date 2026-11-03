require "rails_helper"

RSpec.describe "Departments API", type: :request do
  def json
    JSON.parse(response.body)
  end

  let!(:department) { create(:department, name: "Engineering") }

  it "lists, searches, paginates, and shows departments" do
    create(:department, name: "Finance")

    get "/api/v1/departments", params: { search: "eng", per_page: 1 }
    expect(response).to have_http_status(:ok)
    expect(json["data"].map { |item| item["id"] }).to eq([ department.id ])
    expect(json["meta"]).to include("page" => 1, "per_page" => 1, "total_count" => 1)

    get "/api/v1/departments/#{department.id}"
    expect(response).to have_http_status(:ok)
    expect(json["data"]["name"]).to eq("Engineering")
  end

  it "creates, updates, and deletes a department" do
    post "/api/v1/departments", params: { department: { name: "Finance" } }
    expect(response).to have_http_status(:created)

    department_id = json["data"]["id"]
    patch "/api/v1/departments/#{department_id}", params: { department: { name: "Accounting" } }
    expect(response).to have_http_status(:ok)
    expect(json["data"]["name"]).to eq("Accounting")

    delete "/api/v1/departments/#{department_id}"
    expect(response).to have_http_status(:ok)
  end

  it "returns validation errors for missing and duplicate names" do
    post "/api/v1/departments", params: { department: { name: "" } }
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("name")

    post "/api/v1/departments", params: { department: { name: "engineering" } }
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].first).to include("name")
  end

  it "prevents deletion of an associated department" do
    create(:employee, department: department)

    delete "/api/v1/departments/#{department.id}"
    expect(response).to have_http_status(:unprocessable_content)
    expect(Department.exists?(department.id)).to be(true)
  end

  it "returns not found for a missing department" do
    get "/api/v1/departments/0"

    expect(response).to have_http_status(:not_found)
    expect(json["errors"].first["detail"]).to eq("Department not found")
  end
end
