require "rails_helper"

RSpec.describe Employee, type: :model do
  describe "associations" do
    it { should belong_to(:country) }
    it { should belong_to(:department) }

    it do
      should have_many(:salary_records)
        .dependent(:restrict_with_error)
    end
  end

  describe "validations" do
    subject { build(:employee) }

    it { should validate_presence_of(:employee_code) }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:designation) }
    it { should validate_presence_of(:joining_date) }

    it do
      should validate_uniqueness_of(:employee_code).case_insensitive
    end

    it do
      should validate_uniqueness_of(:email).case_insensitive
    end

    it do
      should validate_inclusion_of(:status)
        .in_array(%w[active inactive])
    end
  end

  describe "normalization" do
    it "normalizes employee code and email" do
      employee = build(
        :employee,
        employee_code: " emp101 ",
        email: " TEST@EXAMPLE.COM "
      )

      employee.valid?

      expect(employee.employee_code).to eq("EMP101")
      expect(employee.email).to eq("test@example.com")
    end

    it "removes extra spaces from first and last name" do
      employee = build(
        :employee,
        first_name: "  John  ",
        last_name: "  Doe  "
      )

      employee.valid?

      expect(employee.first_name).to eq("John")
      expect(employee.last_name).to eq("Doe")
    end
  end

  describe "dependent restriction" do
    it "does not allow deleting an employee with salary records" do
      employee = create(:employee)
      create(:salary_record, employee: employee)

      expect(employee.destroy).to be_falsey
      expect(employee.errors).to be_present
    end
  end
end
