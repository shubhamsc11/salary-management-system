Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :employees, only: %i[index show create update destroy]
      resources :countries, only: %i[index show create update destroy]
      resources :departments, only: %i[index show create update destroy]
      resources :employees, only: [] do
        resources :salary_records, only: %i[index create]
      end
      resources :salary_records, only: %i[show update destroy]
      get "dashboard/summary", to: "dashboard#summary"
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
