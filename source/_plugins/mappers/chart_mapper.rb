require 'byebug'

class ChartMapper < ::Jekyll::Contentful::Mappers::Base
  def map
    chart = super
    markdown_table_html = "#{Kramdown::Document.new(chart["markdown_table"]).to_html}"
    # add chart.css classes
    # table_classes = "charts-css bar show-primary-axis show-labels show-data-axes"
    table_classes = "charts-css column show-heading show-labels show-primary-axis show-data-axes  hide-data"
    markdown_table_html.gsub!("<table>","<table class=\"#{table_classes}\">" )
    chart.merge({ "chart_html" => markdown_table_html })
  end
end