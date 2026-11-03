FactoryBot.define do
  factory :country do
    name { Faker::Address.country }
    code { Faker::Alphanumeric.unique.alpha(number: 2).upcase }
    currency_code { "INR" }
  end
end
