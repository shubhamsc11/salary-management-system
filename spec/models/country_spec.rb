require "rails_helper"

RSpec.describe Country, type: :model do
  describe "associations" do
    it do
      should have_many(:employees)
        .dependent(:restrict_with_error)
    end
  end

  describe "validations" do
    subject { build(:country) }

    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:code) }
    it { should validate_presence_of(:currency_code) }

    it { should validate_length_of(:code).is_equal_to(2) }
    it { should validate_length_of(:currency_code).is_equal_to(3) }

    it do
      should validate_uniqueness_of(:code).case_insensitive
    end
  end

  describe "normalization" do
    it "converts country code and currency code to uppercase" do
      country = build(
        :country,
        code: "in",
        currency_code: "inr"
      )

      country.valid?

      expect(country.code).to eq("IN")
      expect(country.currency_code).to eq("INR")
    end
  end

  describe "dependent restriction" do
    it "does not allow deleting a country that has employees" do
      country = create(:country)
      create(:employee, country: country)

      expect(country.destroy).to be_falsey
      expect(country.errors).to be_present
    end
  end
end
