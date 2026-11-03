class SalaryRecord < ApplicationRecord
  belongs_to :employee

  validates :basic_salary,
            numericality: { greater_than_or_equal_to: 0 }

  validates :bonus, :allowances, :deductions,
            numericality: { greater_than_or_equal_to: 0 }

  validates :currency,
            presence: true,
            length: { is: 3 },
            format: { with: /\A[A-Z]{3}\z/ }

  validates :effective_from, presence: true

  validate :effective_date_range
  validate :prevent_overlapping_salary_records

  before_validation :normalize_currency

  def net_salary
    basic_salary + bonus + allowances - deductions
  end

  private

  def normalize_currency
    self.currency = currency.strip.upcase if currency.present?
  end

  def effective_date_range
    return if effective_to.blank? || effective_from.blank?

    if effective_to < effective_from
      errors.add(:effective_to, "must be after or equal to effective_from")
    end
  end

  def prevent_overlapping_salary_records
    return if employee_id.blank? || effective_from.blank?

    overlapping_records = SalaryRecord
      .where(employee_id: employee_id)
      .where.not(id: id)
      .where("effective_from <= ?", effective_to || Date.new(9999, 12, 31))
      .where("effective_to IS NULL OR effective_to >= ?", effective_from)

    if overlapping_records.exists?
      errors.add(:effective_from, "overlaps with an existing salary record")
    end
  end
end
