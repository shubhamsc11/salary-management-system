class Country < ApplicationRecord
  has_many :employees, dependent: :restrict_with_error

  validates :name, presence: true

  validates :code,
            presence: true,
            uniqueness: { case_sensitive: false },
            length: { is: 2 }

  validates :currency_code,
            presence: true,
            length: { is: 3 },
            format: { with: /\A[A-Z]{3}\z/ }

  before_validation :normalize_codes

  private

  def normalize_codes
    self.code = code.strip.upcase if code.present?
    self.currency_code = currency_code.strip.upcase if currency_code.present?
  end
end
