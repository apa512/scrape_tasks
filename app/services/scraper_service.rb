class ScraperService
  # Create and use a dynamic scraper based on provided selectors
  def self.scrape(html_content, selectors)
    scraper = create_dynamic_scraper(selectors)
    scraper.new(html_content).scrape
  end

  private

  # Create a dynamic scraper class with the provided selectors
  def self.create_dynamic_scraper(selectors_map)
    Class.new do
      include Horsefield::Scraper

      selectors_map.each do |key, selector|
        one key, selector
      end
    end
  end
end
