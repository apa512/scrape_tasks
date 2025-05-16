class ScrapeTasksController < ApplicationController
  def create
    if scrape_task_params[:url].blank? || scrape_task_params[:fields].blank?
      return render json: { message: "URL and fields are required" }, status: :unprocessable_entity
    end

    url = scrape_task_params[:url]

    begin
      html_content = HtmlFetcherService.fetch(url)
    rescue => e
      render json: {
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
