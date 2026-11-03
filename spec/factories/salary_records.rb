FactoryBot.define do
  factory :salary_record do
    association :employee

    basic_salary { Faker::Number.between(from: 30_000, to: 150_000) }
    bonus { Faker::Number.between(from: 0, to: 15_000) }
    allowances { Faker::Number.between(from: 0, to: 10_000) }
    deductions { Faker::Number.between(from: 0, to: 5_000) }

    currency { "INR" }
    effective_from { Date.current.beginning_of_year }
    effective_to { nil }
  end
end
