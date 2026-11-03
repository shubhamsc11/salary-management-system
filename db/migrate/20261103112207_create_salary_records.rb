class CreateSalaryRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :salary_records do |t|
      t.references :employee, null: false, foreign_key: true

      t.decimal :basic_salary,
                precision: 15,
                scale: 2,
                null: false

      t.decimal :bonus,
                precision: 15,
                scale: 2,
                null: false,
                default: 0

      t.decimal :allowances,
                precision: 15,
                scale: 2,
                null: false,
                default: 0

      t.decimal :deductions,
                precision: 15,
                scale: 2,
                null: false,
                default: 0

      t.string :currency, null: false
      t.date :effective_from, null: false
      t.date :effective_to

      t.timestamps
    end

    add_index :salary_records, [ :employee_id, :effective_from ]
  end
end
