# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

puts "Starting Salary Management System seed..."

# --------------------------------------------------
# 1. Countries
# --------------------------------------------------

countries_data = [
  { name: "India", code: "IN", currency_code: "INR" },
  { name: "United States", code: "US", currency_code: "USD" },
  { name: "United Kingdom", code: "GB", currency_code: "GBP" },
  { name: "Canada", code: "CA", currency_code: "CAD" },
  { name: "Australia", code: "AU", currency_code: "AUD" },
  { name: "Germany", code: "DE", currency_code: "EUR" },
  { name: "France", code: "FR", currency_code: "EUR" },
  { name: "Singapore", code: "SG", currency_code: "SGD" },
  { name: "United Arab Emirates", code: "AE", currency_code: "AED" },
  { name: "Japan", code: "JP", currency_code: "JPY" }
]

countries = countries_data.map do |data|
  Country.find_or_create_by!(code: data[:code]) do |country|
    country.name = data[:name]
    country.currency_code = data[:currency_code]
  end
end

puts "Countries created/found: #{countries.count}"

# --------------------------------------------------
# 2. Departments
# --------------------------------------------------

department_names = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Customer Support",
  "Product Management",
  "Quality Assurance",
  "Business Development",
  "Data Analytics",
  "Information Technology"
]

departments = department_names.map do |name|
  Department.find_or_create_by!(name: name)
end

puts "Departments created/found: #{departments.count}"

# --------------------------------------------------
# 3. Employee and Salary Data
# --------------------------------------------------

designations = [
  "Software Engineer",
  "Senior Software Engineer",
  "HR Executive",
  "HR Manager",
  "Accountant",
  "Finance Manager",
  "Marketing Executive",
  "Marketing Manager",
  "Sales Executive",
  "Sales Manager",
  "Product Manager",
  "QA Engineer",
  "Business Analyst",
  "Data Analyst",
  "Operations Manager"
]

statuses = %w[active active active active inactive]

total_employees = 10_000
batch_size = 500

puts "Generating #{total_employees} employees..."

(1..total_employees).each_slice(batch_size) do |employee_numbers|
  employee_numbers.each do |number|
    employee_code = "EMP#{number.to_s.rjust(5, '0')}"
    email = "employee#{number}@example.com"

    employee = Employee.find_or_create_by!(
      employee_code: employee_code
    ) do |record|
      record.first_name = Faker::Name.first_name
      record.last_name = Faker::Name.last_name
      record.email = email
      record.country = countries.sample
      record.department = departments.sample
      record.designation = designations.sample
      record.joining_date = Faker::Date.between(
        from: 10.years.ago.to_date,
        to: Date.current
      )
      record.status = statuses.sample
    end

    # ------------------------------------------------
    # 4. Salary Records
    # ------------------------------------------------

    next if employee.salary_records.exists?

    currency = employee.country.currency_code

    salary_record_count = rand(1..3)
    joining_date = employee.joining_date

    # Salary history starts from employee joining date.
    # Each previous record ends one day before next record.

    effective_from = joining_date

    salary_record_count.times do |index|
      effective_to =
        if index == salary_record_count - 1
          nil
        else
          effective_from + rand(180..540).days
        end

      basic_salary = case currency
      when "INR" then rand(30_000..150_000)
      when "USD" then rand(3_000..12_000)
      when "GBP" then rand(2_000..8_000)
      when "EUR" then rand(2_500..9_000)
      when "CAD" then rand(3_000..10_000)
      when "AUD" then rand(3_000..10_000)
      when "SGD" then rand(3_000..10_000)
      when "AED" then rand(5_000..20_000)
      when "JPY" then rand(300_000..1_000_000)
      else rand(1_000..5_000)
      end

      SalaryRecord.create!(
        employee: employee,
        basic_salary: basic_salary,
        bonus: rand(0..basic_salary * 0.15).round(2),
        allowances: rand(0..basic_salary * 0.20).round(2),
        deductions: rand(0..basic_salary * 0.10).round(2),
        currency: currency,
        effective_from: effective_from,
        effective_to: effective_to
      )

      effective_from = effective_to + 1.day if effective_to.present?
    end
  end

  puts "Processed employees up to #{employee_numbers.last}"
end

# --------------------------------------------------
# 5. Final Summary
# --------------------------------------------------

puts "\nSeed completed successfully!"
puts "Countries: #{Country.count}"
puts "Departments: #{Department.count}"
puts "Employees: #{Employee.count}"
puts "Salary Records: #{SalaryRecord.count}"
puts "Active Employees: #{Employee.where(status: 'active').count}"
puts "Inactive Employees: #{Employee.where(status: 'inactive').count}"
