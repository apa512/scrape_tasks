class ScrapeTasksController < ApplicationController
  def new
  end

  def create
    if scrape_task_params[:url].blank? || scrape_task_params[:fields].blank?
      return render json: { message: "URL and fields are required" }, status: :unprocessable_entity
    end

    url = scrape_task_params[:url]

    begin
      html_content = Rails.cache.fetch("html_content:#{url}", expires_in: 1.hour) do
        HtmlFetcherService.fetch(url)
      end
    rescue => e
      return render json: {
        message: "Failed to fetch HTML: #{e.message}",
        url: url
      }, status: :unprocessable_entity
    end

    scraped_data = ScraperService.scrape(html_content, scrape_task_params[:fields])

    render json: scraped_data, status: :ok
  end

  private

  def scrape_task_params
    params.permit(:url, fields: {})
  end
end
