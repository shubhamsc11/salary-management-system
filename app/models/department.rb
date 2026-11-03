class Department < ApplicationRecord
  has_many :employees, dependent: :restrict_with_error

  validates :name,
            presence: true,
            uniqueness: { case_sensitive: false }

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.strip if name.present?
  end
end
