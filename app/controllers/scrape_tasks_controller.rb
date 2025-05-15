class ScrapeTasksController < ApplicationController
  def create
    render json: { status: 'success', message: 'Task scheduled for scraping' }
  end
end