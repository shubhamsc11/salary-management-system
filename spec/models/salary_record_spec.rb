require "rails_helper"

RSpec.describe SalaryRecord, type: :model do
  describe "associations" do
    it { should belong_to(:employee) }
  end

  describe "validations" do
    subject { build(:salary_record) }

    it { should validate_presence_of(:currency) }
    it { should validate_presence_of(:effective_from) }

    it do
      should validate_numericality_of(:basic_salary)
        .is_greater_than_or_equal_to(0)
    end

    it do
      should validate_numericality_of(:bonus)
        .is_greater_than_or_equal_to(0)
    end

    it do
      should validate_numericality_of(:allowances)
        .is_greater_than_or_equal_to(0)
    end

    it do
      should validate_numericality_of(:deductions)
        .is_greater_than_or_equal_to(0)
    end

    it { should validate_length_of(:currency).is_equal_to(3) }
  end

  describe "currency normalization" do
    it "converts currency to uppercase" do
      salary = build(:salary_record, currency: "inr")

      salary.valid?

      expect(salary.currency).to eq("INR")
    end
  end

  describe "effective date range" do
    it "does not allow effective_to before effective_from" do
      salary = build(
        :salary_record,
        effective_from: Date.new(2026, 1, 1),
        effective_to: Date.new(2025, 12, 31)
      )

      expect(salary).not_to be_valid
      expect(salary.errors[:effective_to]).to be_present
    end

    it "allows effective_to to be nil" do
      salary = build(:salary_record, effective_to: nil)

      expect(salary).to be_valid
    end
  end

  describe "#net_salary" do
    it "calculates net salary correctly" do
      salary = build(
        :salary_record,
        basic_salary: 50_000,
        bonus: 5_000,
        allowances: 3_000,
        deductions: 2_000
      )

      expect(salary.net_salary).to eq(56_000)
    end
  end

  describe "overlapping salary records" do
    let(:employee) { create(:employee) }

    it "does not allow overlapping salary periods for the same employee" do
      create(
        :salary_record,
        employee: employee,
        effective_from: Date.new(2026, 1, 1),
        effective_to: Date.new(2026, 12, 31)
      )

      new_salary = build(
        :salary_record,
        employee: employee,
        effective_from: Date.new(2026, 6, 1),
        effective_to: nil
      )

      expect(new_salary).not_to be_valid
      expect(new_salary.errors[:effective_from]).to be_present
    end

    it "allows non-overlapping salary periods" do
      create(
        :salary_record,
        employee: employee,
        effective_from: Date.new(2026, 1, 1),
        effective_to: Date.new(2026, 6, 30)
      )

      new_salary = build(
        :salary_record,
        employee: employee,
        effective_from: Date.new(2026, 7, 1),
        effective_to: nil
      )

      expect(new_salary).to be_valid
    end

    it "allows salary records for different employees in the same period" do
      create(
        :salary_record,
        employee: employee,
        effective_from: Date.new(2026, 1, 1),
        effective_to: nil
      )

      another_salary = build(
        :salary_record,
        employee: create(:employee),
        effective_from: Date.new(2026, 1, 1),
        effective_to: nil
      )

      expect(another_salary).to be_valid
    end
  end
end
