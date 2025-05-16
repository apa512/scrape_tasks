class HtmlFetcherService
  def self.fetch(url)
    browser = create_browser

    begin
      browser.goto(url)
      browser.network.wait_for_idle(timeout: 10)
      browser.body
    ensure
      browser.quit if browser
    end
  end

  private_class_method def self.create_browser
    browser_options = {
      headless: true,
      browser_options: {
        "disable-gpu": nil,
        "no-sandbox": nil,
        "disable-dev-shm-usage": nil,
        "disable-features": "VizDisplayCompositor"
      },
      process_timeout: 30,
      timeout: 30
    }

    Ferrum::Browser.new(browser_options)
  end
end
