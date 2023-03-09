module MarkdownifyYAML
  def markdownify_yaml(input)
    site = Jekyll.sites.first
    converter = site.find_converter_instance(Jekyll::Converters::Markdown)
    converter.convert(input)
  end
end
