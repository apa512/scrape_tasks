require 'net/http'
require 'uri'

class ScrapeTasksController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def create
    if scrape_task_params[:url].blank? || scrape_task_params[:fields].blank?
      return render json: { status: 'error', message: 'URL and fields are required' }, status: :unprocessable_entity
    end
    
    url = scrape_task_params[:url]
    
    begin
      html_content = HtmlFetcherService.fetch(url)
      
      render json: {
        status: 'success',
        task: scrape_task_params,
        html: html_content
      }
    rescue => e
      render json: {
        status: 'error',
        message: "Failed to fetch HTML: #{e.message}",
        url: url
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def scrape_task_params
    params.permit(:url, fields: {})
  end
end