class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_code, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false

      t.references :country, null: false, foreign_key: true
      t.references :department, null: false, foreign_key: true

      t.string :designation, null: false
      t.date :joining_date, null: false
      t.string :status, null: false, default: "active"

      t.timestamps
    end

    add_index :employees, :employee_code, unique: true
    add_index :employees, :email, unique: true
    add_index :employees, :status
    add_index :employees, [ :country_id, :department_id ]
  end
end
