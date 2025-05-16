class ScraperService
  def self.scrape(html_content, selectors)
    scraper = create_dynamic_scraper(selectors)
    scraper.new(html_content).scrape
  end

  private

  def self.create_dynamic_scraper(selectors_map)
    meta_keys = selectors_map.delete("meta")

    scraper_class = Class.new do
      include Horsefield::Scraper
    end

    selectors_map.each do |key, selector|
      scraper_class.instance_exec do
        one key, selector
      end
    end

    if meta_keys && meta_keys.is_a?(Array)
      scraper_class.instance_exec do
        one :meta do
          result = {}

          meta_keys.each do |key|
            value = at(".//meta[@name='#{key}']/@content")&.text
            result[key] = value if value
          end

          result
        end
      end
    end

    scraper_class
  end
end
