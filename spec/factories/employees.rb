FactoryBot.define do
  factory :employee do
    employee_code { "EMP-#{Faker::Number.unique.number(digits: 6)}" }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    designation { Faker::Job.title }
    joining_date { Faker::Date.between(from: 5.years.ago, to: Date.current) }
    status { "active" }

    association :country
    association :department
  end
end
