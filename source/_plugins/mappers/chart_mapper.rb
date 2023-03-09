require 'byebug'
require 'nokogiri'

class ChartMapper < ::Jekyll::Contentful::Mappers::Base
  def map
    chart = super
    markdown_table_html = "#{Kramdown::Document.new(chart["markdown_table"]).to_html}"
    # add chart.css classes
    chart.merge({ "chart_html" => markdown_table_html })
  end
end