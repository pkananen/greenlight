Rails.application.routes.draw do
  get "/flow_metrics" => 'flow_metrics#index'
  get "/" => 'flow_metrics#index'
end
