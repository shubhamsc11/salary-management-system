require "rails_helper"

RSpec.describe Department, type: :model do
  describe "associations" do
    it do
      should have_many(:employees)
        .dependent(:restrict_with_error)
    end
  end

  describe "validations" do
    subject { build(:department) }

    it { should validate_presence_of(:name) }

    it do
      should validate_uniqueness_of(:name).case_insensitive
    end
  end

  describe "normalization" do
    it "removes leading and trailing spaces from name" do
      department = build(
        :department,
        name: "  Engineering  "
      )

      department.valid?

      expect(department.name).to eq("Engineering")
    end
  end

  describe "dependent restriction" do
    it "does not allow deleting a department that has employees" do
      department = create(:department)
      create(:employee, department: department)

      expect(department.destroy).to be_falsey
      expect(department.errors).to be_present
    end
  end
end
