/* =====================================================
   GDP Explorer — app.js
   Powered by Trading Economics API
   ===================================================== */

const API_KEY  = '1fcdcefdd80e401:b9icr7uc8rzc005';
const TE_BASE  = 'https://api.tradingeconomics.com/historical/country';
// allorigins.win is a reliable CORS proxy that works with file:// protocol
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const isLocal  = location.protocol === 'file:';

// ── Country configuration ────────────────────────────
// flagcdn.com codes: https://flagcdn.com/{code}.svg
const COUNTRIES = {
  'mexico': {
    name: 'Mexico',
    apiKey: 'mexico',
    flag: 'https://flagcdn.com/mx.svg',
    flagEmoji: '🇲🇽',
    color: '#f6c90e',
    colorAlpha: 'rgba(246,201,14,0.15)',
    desc: 'Mexico is the second-largest economy in Latin America and a major emerging-market economy. A member of OECD and G20, Mexico\'s economy is driven by manufacturing, oil exports, and a large services sector.'
  },
  'sweden': {
    name: 'Sweden',
    apiKey: 'sweden',
    flag: 'https://flagcdn.com/se.svg',
    flagEmoji: '🇸🇪',
    color: '#63b3ed',
    colorAlpha: 'rgba(99,179,237,0.15)',
    desc: 'Sweden boasts one of the world\'s highest living standards and a highly developed economy. Known for innovation, social welfare, and exports in automotive, telecommunications, and pharmaceuticals.'
  },
  'thailand': {
    name: 'Thailand',
    apiKey: 'thailand',
    flag: 'https://flagcdn.com/th.svg',
    flagEmoji: '🇹🇭',
    color: '#68d391',
    colorAlpha: 'rgba(104,211,145,0.15)',
    desc: 'Thailand is Southeast Asia\'s second-largest economy. A major tourism destination and manufacturing hub, Thailand exports electronics, vehicles, and agricultural products globally.'
  },
  'new+zealand': {
    name: 'New Zealand',
    apiKey: 'new zealand',
    flag: 'https://flagcdn.com/nz.svg',
    flagEmoji: '🇳🇿',
    color: '#9f7aea',
    colorAlpha: 'rgba(159,122,234,0.15)',
    desc: 'New Zealand is a high-income, highly developed economy with strong agricultural exports, tourism, and financial services. Known for its high quality of life and political stability.'
  }
};

// ── State ────────────────────────────────────────────
let currentCountry = 'mexico';
let currentRange   = 20;
let allData        = {};   // cache: country -> array of { year, value }
let lineChartInstance = null;
let barChartInstance  = null;

// ── Helpers ──────────────────────────────────────────
function fmt(val) {
  if (val >= 1000) return (val / 1000).toFixed(2) + 'T';
  return val.toFixed(1) + 'B';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function animateCounter(el, target, prefix = '', suffix = '') {
  const start = 0;
  const duration = 900;
  const startTime = performance.now();
  const targetNum = parseFloat(target);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + (targetNum - start) * ease;
    el.textContent = prefix + current.toFixed(1) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + targetNum.toFixed(1) + suffix;
  }
  requestAnimationFrame(step);
}

function setRangeActive(val) {
  document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
  if (val === 20) document.getElementById('range20').classList.add('active');
  else if (val === 40) document.getElementById('range40').classList.add('active');
  else  document.getElementById('rangeAll').classList.add('active');
}

// ── Fetch GDP history ────────────────────────────────
async function fetchGDP(country) {
  if (allData[country]) return allData[country]; // cache hit

  // Use apiKey for the actual API path (handles spaces properly)
  const apiCountry = encodeURIComponent(COUNTRIES[country].apiKey);
  const apiUrl = `https://api.tradingeconomics.com/historical/country/${apiCountry}/indicator/gdp?c=${API_KEY}`;
  const url = isLocal ? `${CORS_PROXY}${encodeURIComponent(apiUrl)}` : apiUrl;
  const resp = await fetch(url);
  const json = await resp.json();

  // Filter only real data rows (value > 0 and has a DateTime year)
  const parsed = json
    .filter(d => d.Value > 0 && d.DateTime)
    .map(d => ({
      year: new Date(d.DateTime).getFullYear(),
      value: parseFloat(d.Value.toFixed(2))
    }))
    .sort((a, b) => a.year - b.year);

  allData[country] = parsed;
  return parsed;
}

// ── Update stat cards ────────────────────────────────
function updateStats(data) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const latest = data[data.length - 1];
  const peak   = sorted[0];
  const yr2000 = data.find(d => d.year === 2000);

  const currentEl = document.getElementById('statCurrentGDP');
  const peakEl    = document.getElementById('statPeakGDP');
  const yearsEl   = document.getElementById('statYears');
  const growthEl  = document.getElementById('statGrowth');

  animateCounter(currentEl, latest.value, '', '');
  animateCounter(peakEl, peak.value, '', '');
  animateCounter(yearsEl, data.length, '', '');

  if (yr2000) {
    const pct = ((latest.value - yr2000.value) / yr2000.value * 100).toFixed(1);
    growthEl.textContent = (pct > 0 ? '+' : '') + pct + '%';
    growthEl.style.color = pct > 0 ? 'var(--accent-green)' : '#fc8181';
  } else {
    growthEl.textContent = 'N/A';
  }
}

// ── Update detail card ───────────────────────────────
function updateDetail(country, data) {
  const cfg = COUNTRIES[country];
  const latest  = data[data.length - 1];
  const sorted  = [...data].sort((a, b) => a.value - b.value);
  const minVal  = sorted[0];
  const avg     = data.reduce((s, d) => s + d.value, 0) / data.length;

  // Use image flag in detail card
  const detailFlagEl = document.getElementById('detailFlag');
  detailFlagEl.innerHTML = `<img src="${cfg.flag}" alt="${cfg.name} flag" style="width:70px;height:auto;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,0.4)"/>`;
  document.getElementById('detailCountry').textContent = cfg.name;
  document.getElementById('detailDesc').textContent    = cfg.desc;
  document.getElementById('dstatYear').textContent     = latest.year;
  document.getElementById('dstatMin').textContent      = fmt(minVal.value) + ' USD (' + minVal.year + ')';
  document.getElementById('dstatAvg').textContent      = fmt(avg) + ' USD';
}

// ── Render Line Chart ────────────────────────────────
function renderLineChart(country, data, range) {
  const cfg = COUNTRIES[country];
  const maxYear = data[data.length - 1].year;
  const filtered = range === 0
    ? data
    : data.filter(d => d.year >= maxYear - range);

  const labels = filtered.map(d => d.year);
  const values = filtered.map(d => d.value);

  document.getElementById('lineChartTitle').textContent =
    `${cfg.name} GDP — Historical Trend`;

  if (lineChartInstance) lineChartInstance.destroy();

  const ctx = document.getElementById('lineChart').getContext('2d');

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, cfg.colorAlpha.replace('0.15', '0.4'));
  gradient.addColorStop(1, cfg.colorAlpha.replace('0.15', '0.0'));

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${cfg.name} GDP (USD B)`,
        data: values,
        borderColor: cfg.color,
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointRadius: filtered.length < 30 ? 4 : 0,
        pointHoverRadius: 6,
        pointBackgroundColor: cfg.color,
        pointBorderColor: '#080c14',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeInOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8,12,20,0.95)',
          borderColor: cfg.color,
          borderWidth: 1,
          titleColor: '#f0f4ff',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toFixed(2)} Billion USD`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#4a5568', maxTicksLimit: 10, font: { size: 11 } },
          border: { color: 'transparent' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#4a5568',
            font: { size: 11 },
            callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1) + 'T' : v + 'B')
          },
          border: { color: 'transparent' }
        }
      }
    }
  });
}

// ── Render Bar Chart (comparison) ────────────────────
async function renderBarChart() {
  // Fetch all 4 countries sequentially with a small delay between each
  // to avoid hitting Trading Economics API rate limits on concurrent requests
  const keys = Object.keys(COUNTRIES);
  const results = [];

  for (const key of keys) {
    try {
      // Cache hit: no delay needed — data already in memory
      if (!allData[key]) await sleep(600);
      const data = await fetchGDP(key);
      results.push({ status: 'fulfilled', value: data });
    } catch (err) {
      console.warn(`Bar chart: failed to load ${key}`, err);
      results.push({ status: 'rejected' });
    }
  }

  document.getElementById('barLoader').style.display = 'none';
  document.getElementById('barChartWrapper').style.display = 'block';

  const labels = [];
  const values = [];
  const colors = [];
  const alphas = [];

  results.forEach((result, i) => {
    const k = keys[i];
    labels.push(COUNTRIES[k].name);
    const arr = result.status === 'fulfilled' ? result.value : [];
    values.push(arr.length ? arr[arr.length - 1].value : 0);
    colors.push(COUNTRIES[k].color);
    alphas.push(COUNTRIES[k].colorAlpha);
  });

  if (barChartInstance) barChartInstance.destroy();

  const ctx = document.getElementById('barChart').getContext('2d');
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'GDP (USD Billions)',
        data: values,
        backgroundColor: alphas,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeOutBounce' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8,12,20,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0f4ff',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toFixed(2)} Billion USD`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 13, weight: '500' } },
          border: { color: 'transparent' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#4a5568',
            font: { size: 11 },
            callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1) + 'T' : v + 'B')
          },
          border: { color: 'transparent' }
        }
      }
    }
  });
}

// ── Select Country ────────────────────────────────────
async function selectCountry(country) {
  currentCountry = country;

  // Update button states
  document.querySelectorAll('.country-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.country === country);
  });

  // Show loader for line chart
  document.getElementById('lineLoader').style.display = 'flex';
  document.getElementById('lineChartWrapper').style.display = 'none';

  try {
    const data = await fetchGDP(country);
    updateStats(data);
    updateDetail(country, data);

    document.getElementById('lineLoader').style.display = 'none';
    document.getElementById('lineChartWrapper').style.display = 'block';
    renderLineChart(country, data, currentRange);
  } catch (err) {
    console.error('Failed to load GDP data:', err);
    document.getElementById('lineLoader').innerHTML =
      '<p style="color:#fc8181">⚠️ Failed to load data. Please try again.</p>';
  }
}

// ── Set time range ────────────────────────────────────
function setRange(range) {
  currentRange = range;
  setRangeActive(range);
  if (allData[currentCountry]) {
    renderLineChart(currentCountry, allData[currentCountry], range);
  }
}

// ── Spawn Background Particles ────────────────────────
function spawnParticles() {
  const container = document.getElementById('bgParticles');
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 200 + 80;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --dur:${(Math.random() * 8 + 5).toFixed(1)}s;
      --delay:${(Math.random() * 4).toFixed(1)}s;
    `;
    container.appendChild(p);
  }
}

// ── Navbar scroll effect ──────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 40) {
    navbar.style.background = 'rgba(8,12,20,0.95)';
    navbar.style.boxShadow  = '0 2px 30px rgba(0,0,0,0.5)';
  } else {
    navbar.style.background = 'rgba(8,12,20,0.7)';
    navbar.style.boxShadow  = 'none';
  }
});

// ── Intersection Observer for card animations ─────────
function setupObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ── Init ─────────────────────────────────────────────
async function init() {
  spawnParticles();
  setupObserver();

  // Load initial country (Mexico)
  await selectCountry('mexico');

  // Wait briefly before firing bar chart requests so the initial Mexico
  // API call fully clears the rate-limit window before 3 more requests go out
  await sleep(1000);
  renderBarChart();
}

document.addEventListener('DOMContentLoaded', init);
