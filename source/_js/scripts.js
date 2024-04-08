import Overlay from './overlay';
import Modal from './modal';
import Nav from './nav';
import Scroll from './scroll';
import Search from './search';
import Utils from './utils';
import MarkdownCharts from './markdown_charts';
import D3Chart from './d3-charts';

Modal.init();
Nav.init();
Overlay.init();
Scroll.init();
Search.init();
Utils.markdownLinksNewPage();
MarkdownCharts.init();
D3Chart.init();
