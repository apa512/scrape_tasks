require "test_helper"

class ScrapeTasksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @html = File.read(Rails.root.join("test", "fixtures", "files", "hn_post.html"))
  end

  test "should create scrape task and return HTML" do
    HtmlFetcherService.stubs(:fetch).returns(@html)
    url = "https://news.ycombinator.com/item?id=43995144"

    post scrape_tasks_url, params: {
      url: url,
      fields: {
        title: ".titleline a",
        username: ".subline .hnuser",
        meta: ["referrer", "viewport"]
      }
    }, as: :json

    assert_response :success

    json_response = JSON.parse(response.body)

    assert_equal "Demystifying Ruby: It's all about threads (2024)", json_response["title"]
    assert_equal "kadrek", json_response["username"]
    assert_equal "origin", json_response["meta"]["referrer"]
    assert_equal "width=device-width, initial-scale=1.0", json_response["meta"]["viewport"]
  end
end
