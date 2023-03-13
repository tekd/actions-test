require 'byebug'

class ChartMapper < ::Jekyll::Contentful::Mappers::Base
  def map
    chart = super
    markdown_table_html = "#{Kramdown::Document.new(chart["markdown_table"]).to_html}"
    # add chart.css classes
    # byebug
    table_classes = "charts-css #{chart["chart_type"]} " + chart["chart_properties"].join(" ")
    # table_classes = "charts-css  show-heading show-labels show-primary-axis show-data-axes  hide-data"
    markdown_table_html.gsub!("<table>","<table class=\"#{table_classes}\">" )
    chart.merge({ "chart_html" => markdown_table_html })
  end
end