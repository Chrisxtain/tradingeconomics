function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('TE')
    .addItem('Indicators', 'openIndicators')
    .addItem('Calendar', 'openCalendar')
    .addItem('Forecast', 'openForecast')
    .addItem('Markets', 'openMarkets')
    .addItem('Financials', 'openFinancials')
    .addItem('News', 'openNews')
    .addItem('Comtrade', 'openComtrade')
    .addItem('Eurostat', 'openEurostat')
    .addItem('World Bank', 'openWorldBank')
    .addItem('Federal Reserve', 'openFred')
    .addSeparator()
    .addItem('Settings', 'openSettings')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function openIndicators() { openSidebarWithState_({ view: 'app', category: 'indicators' }); }
function openCalendar() { openSidebarWithState_({ view: 'app', category: 'calendar' }); }
function openForecast() { openSidebarWithState_({ view: 'app', category: 'forecast' }); }
function openMarkets() { openSidebarWithState_({ view: 'app', category: 'markets' }); }
function openFinancials() { openSidebarWithState_({ view: 'app', category: 'financials' }); }
function openNews() { openSidebarWithState_({ view: 'app', category: 'news' }); }
function openComtrade() { openSidebarWithState_({ view: 'app', category: 'comtrade' }); }
function openEurostat() { openSidebarWithState_({ view: 'app', category: 'eurostat' }); }
function openWorldBank() { openSidebarWithState_({ view: 'app', category: 'worldbank' }); }
function openFred() { openSidebarWithState_({ view: 'app', category: 'fred' }); }
function openSettings() { openSidebarWithState_({ view: 'settings' }); }

function openSidebarWithState_(state) {
  var template = HtmlService.createTemplateFromFile('Sidebar');
  template.initialState = state || {};
  var html = template.evaluate().setTitle('Trading Economics');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getAppState() {
  var key = PropertiesService.getUserProperties().getProperty('TE_API_KEY') || '';
  return { hasApiKey: !!key };
}

function saveApiKey(key) {
  key = String(key || '').trim();
  if (!key) throw new Error('Please enter a valid Trading Economics API key.');
  PropertiesService.getUserProperties().setProperty('TE_API_KEY', key);
  return { success: true };
}

function clearApiKey() {
  PropertiesService.getUserProperties().deleteProperty('TE_API_KEY');
  return { success: true };
}

function runApiRequest(path) {
  path = String(path || '').trim();
  if (!path) throw new Error('Invalid request.');

  var key = PropertiesService.getUserProperties().getProperty('TE_API_KEY') || '';
  if (!key) throw new Error('No API key found. Please set your API key first.');

  var base = 'https://api.tradingeconomics.com';
  var sep = path.indexOf('?') >= 0 ? '&' : '?';
  var url = base + path + sep + 'f=json&c=' + encodeURIComponent(key);

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  var body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error('Trading Economics API request failed (' + status + ').');
  }

  if (!body || body.trim() === '' || body.trim() === '[]' || body.trim() === '{}') {
    throw new Error('No data returned for this request.');
  }

  var json = JSON.parse(body);
  printData(json);
  return { success: true };
}

function printData(data) {
  if (!Array.isArray(data)) data = [data];
  if (!data.length) throw new Error('No data to print.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cell = sheet.getActiveCell();
  var startRow = cell.getRow();
  var startCol = cell.getColumn();

  var headers = Object.keys(data[0]);
  var rows = data.map(function (item) {
    return headers.map(function (h) {
      var v = item[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
  });

  sheet.getRange(startRow, startCol, 1, headers.length).setValues([headers]);
  sheet.getRange(startRow + 1, startCol, rows.length, headers.length).setValues(rows);
}