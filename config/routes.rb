Rails.application.routes.draw do
  get "/flow_metrics" => 'flow_metrics#index'
  get "/" => 'flow_metrics#index'

  get "/contact/new" => 'contact#new'
  post "/contact/new" => 'contact#create'
  resource :contact
end
