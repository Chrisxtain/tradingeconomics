# 🌍 GDP Explorer

> **Explore historical GDP data for countries around the world — with real-time data, stunning interactive charts, and a premium dark-themed UI.**

---

## 📖 Overview

**GDP Explorer** is a sleek, browser-based web application that lets users explore and compare the **Gross Domestic Product (GDP)** of selected countries over time. It pulls **live historical data** from the [Trading Economics API](https://tradingeconomics.com/), processes it in the browser, and renders it as beautiful, animated charts — no backend database required.

Link-> https://gdpexplorer.netlify.app/

The app is designed with a focus on:

- 📊 **Data clarity** — clean, readable charts with meaningful labels and tooltips
- 🎨 **Visual excellence** — dark glassmorphism UI with smooth animations
- ⚡ **Performance** — in-memory data caching so fetched data is never re-requested
- 🌐 **Simplicity** — a single-page app that runs with just a Node.js static file server

---

## ✨ Features

| Feature                      | Description                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| 🗺️ **Country Selection**     | Switch between Mexico, Sweden, Thailand, and New Zealand                                 |
| 📈 **Historical Line Chart** | Animated line chart showing GDP trend over time                                          |
| 📅 **Time Range Filters**    | View data for the last 20 years, last 40 years, or all available data                    |
| 📊 **Comparison Bar Chart**  | Side-by-side GDP comparison of all four countries                                        |
| 🃏 **Stats Cards**           | Current GDP, Peak GDP, Years of Data tracked, and % Growth since year 2000               |
| 🔍 **Country Detail Card**   | Country description, minimum GDP on record, average GDP, and latest data year            |
| 🔴 **Live API Data**         | All GDP figures are fetched in real time from the Trading Economics API                  |
| 💾 **Smart Caching**         | Country data is cached in memory — selecting a previously loaded country is instant      |
| 🎬 **Micro-animations**      | Animated stat counters, scroll-triggered card reveals, and floating background particles |
| 📱 **Responsive Design**     | Adapts cleanly to different screen widths                                                |

---

## 🛠️ Tech Stack

| Layer         | Technology                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| **Structure** | HTML5 (Semantic markup)                                                        |
| **Styling**   | Vanilla CSS (Custom properties, glassmorphism, keyframe animations)            |
| **Logic**     | Vanilla JavaScript (ES2020+, async/await, Fetch API)                           |
| **Charts**    | [Chart.js v4](https://www.chartjs.org/) (via CDN)                              |
| **Data**      | [Trading Economics REST API](https://tradingeconomics.com/analytics/docs.aspx) |
| **Server**    | Node.js built-in `http` module (static file server)                            |

No frameworks. No build tools. No npm dependencies beyond Node.js itself.

---

## 📁 Project Structure

```
gdp-explorer/
│
├── index.html      # App shell — HTML structure and Chart.js CDN link
├── style.css       # Full design system — dark theme, glassmorphism, animations
├── app.js          # All application logic — data fetching, charts, interactivity
├── server.js       # Lightweight static file server (Node.js http module)
└── README.md       # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher (used only to serve static files)
- A modern browser (Chrome, Edge, Firefox, Safari)

### Installation & Running Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/Chrisxtain/gdp-explorer.git
   cd gdp-explorer
   ```

2. **Start the local server**

   ```bash
   node server.js
   ```

3. **Open in your browser**
   ```
   http://localhost:8080
   ```

That's it — no `npm install`, no build step. The server simply serves the static files and the browser handles everything else.

---

## 🔑 API Integration

GDP data is sourced from the **Trading Economics API**.

- **Endpoint used:**
  ```
  GET https://api.tradingeconomics.com/historical/country/{country}/indicator/gdp?c={API_KEY}
  ```
- **Response format:** JSON array of yearly GDP records with fields: `Country`, `Category`, `DateTime`, and `Value` (in USD Billions)
- **API key:** Configured in `app.js` at the top of the file as `API_KEY`
- **CORS:** Trading Economics allows direct browser requests from `localhost` origins, so no proxy is needed when running locally

### Sample API Response

```json
[
  { "Country": "Mexico", "Category": "GDP", "DateTime": "1960-12-31T00:00:00", "Value": 13.04, "Frequency": "Yearly" },
  { "Country": "Mexico", "Category": "GDP", "DateTime": "1961-12-31T00:00:00", "Value": 14.16, "Frequency": "Yearly" },
  ...
]
```

> ⚠️ **Note:** The API key included in this repository is for demonstration purposes. If you fork this project, please obtain your own free API key at [tradingeconomics.com](https://tradingeconomics.com/analytics/docs.aspx).

---

## 🌐 Countries Supported

| Country     | Flag | Color Theme           |
| ----------- | ---- | --------------------- |
| Mexico      | 🇲🇽   | Gold `#f6c90e`        |
| Sweden      | 🇸🇪   | Sky Blue `#63b3ed`    |
| Thailand    | 🇹🇭   | Mint Green `#68d391`  |
| New Zealand | 🇳🇿   | Soft Purple `#9f7aea` |

Each country has its own accent color applied consistently across its stat cards, line chart, and detail section.

---

## 🖼️ UI Overview

The interface is organized into four sections:

1. **Hero / Country Selector** — Full-width header with project tagline and country buttons
2. **Stats Cards** — Four animated metric cards (Current GDP, Peak GDP, Years of Data, Growth vs 2000)
3. **Historical Line Chart** — Interactive time-series chart with 20yr / 40yr / All filters
4. **Detail + Comparison** — Country description card alongside a side-by-side bar chart of all four countries

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas for enhancements:

- Add more countries to the explorer
- Add GDP per capita as an alternative metric
- Export chart data as CSV or PNG
- Add a dark/light mode toggle
- Implement a search/filter for countries

To contribute:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Trading Economics](https://tradingeconomics.com/) — for providing comprehensive historical GDP data via their API
- [Chart.js](https://www.chartjs.org/) — for the excellent, easy-to-use charting library
- [Flag CDN](https://flagcdn.com/) — for the high-quality country flag SVGs

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Chrisxtain">Chrisxtain</a>
</p>
