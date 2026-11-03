class Employee < ApplicationRecord
  belongs_to :country
  belongs_to :department

  has_many :salary_records, dependent: :restrict_with_error

  STATUSES = %w[active inactive].freeze

  validates :employee_code,
            presence: true,
            uniqueness: { case_sensitive: false }

  validates :first_name, :last_name, :designation,
            :email, :joining_date, presence: true

  validates :email,
            format: { with: URI::MailTo::EMAIL_REGEXP },
            uniqueness: { case_sensitive: false }

  validates :status,
            presence: true,
            inclusion: { in: STATUSES }

  before_validation :normalize_employee_data

  private

  def normalize_employee_data
    self.employee_code = employee_code.strip.upcase if employee_code.present?
    self.email = email.strip.downcase if email.present?
    self.first_name = first_name.strip if first_name.present?
    self.last_name = last_name.strip if last_name.present?
  end
end
