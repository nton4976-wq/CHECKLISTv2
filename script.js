/**
 * ALUMNI PORTAL - SECURE & OPTIMIZED FRONTEND
 * Features: Security-first, Performance-optimized, Auto-refresh, Wide Table, Smart Pagination
 */

// ============================================
// SECURITY UTILITIES
// ============================================
const Security = {
  // XSS: Escape HTML entities
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Sanitize user input for search
  sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>'"&]/g, '').trim().substring(0, 100);
  },

  // Validate URL (prevent open redirects)
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('googleusercontent.com') || 
             parsed.hostname === 'script.google.com' ||
             parsed.hostname === window.location.hostname;
    } catch {
      return false;
    }
  },

  // Generate safe ID
  safeId(str) {
    return 'id-' + str.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
  },

  // Content Security Policy helper - log violations
  initCSPReporting() {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.warn('CSP Violation:', {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy
      });
    });
  }
};

// ============================================
// API CONFIGURATION & FETCH UTILITIES
// ============================================
const API_CONFIG = {
  // Replace with your actual Google Apps Script Web App URLs
  endpoints: {
    alumni: 'https://script.google.com/macros/s/YOUR_ALUMNI_SCRIPT_ID/exec',
    nsrp: 'https://script.google.com/macros/s/AKfycbzBJ6moUMp90X4xOl9UVhP6hs38MSXpp381Dggi1XvcOipZMyfcrPGxuYTGZMOrfZlw/exec',
    jops: 'https://script.google.com/macros/s/YOUR_JOPS_SCRIPT_ID/exec',
    legs: 'https://script.google.com/macros/s/YOUR_LEGS_SCRIPT_ID/exec',
    stats: 'https://script.google.com/macros/s/YOUR_STATS_SCRIPT_ID/exec'
  },
  timeout: 15000,           // 15 seconds
  retries: 3,               // Retry failed requests
  retryDelay: 1000,         // Initial retry delay (ms)
  cacheDuration: 5 * 60 * 1000, // 5 minutes client cache
  autoRefreshInterval: 60000,   // 1 minute auto refresh
  pageSize: 20,             // Records per page
  maxConcurrent: 3          // Max concurrent API calls
};

// Request queue to limit concurrent API calls
class RequestQueue {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const apiQueue = new RequestQueue(API_CONFIG.maxConcurrent);

// Centralized fetch with retry, timeout, caching
async function apiFetch(endpointKey, params = {}, options = {}) {
  const url = API_CONFIG.endpoints[endpointKey];
  if (!url) throw new Error(`Unknown endpoint: ${endpointKey}`);

  // Build cache key
  const cacheKey = `cache_${endpointKey}_${JSON.stringify(params)}`;
  const cached = CacheManager.get(cacheKey);

  // Return cached data if valid and not forcing refresh
  if (cached && !options.forceRefresh) {
    return cached;
  }

  return apiQueue.enqueue(async () => {
    let lastError;

    for (let attempt = 0; attempt < API_CONFIG.retries; attempt++) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${url}?${queryString}`;

        // Validate URL security
        if (!Security.isValidUrl(fullUrl) && !fullUrl.includes('script.google.com')) {
          throw new Error('Invalid API URL');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        const response = await fetch(fullUrl, {
          method: 'GET',
          mode: 'cors',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }

        // Cache successful response
        CacheManager.set(cacheKey, data, API_CONFIG.cacheDuration);

        return data;

      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.message && error.message.includes('HTTP 4')) {
          break;
        }

        // Exponential backoff
        if (attempt < API_CONFIG.retries - 1) {
          const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    throw lastError;
  });
}

// ============================================
// CLIENT-SIDE CACHE MANAGER
// ============================================
const CacheManager = {
  prefix: 'alumni_portal_',

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const { data, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(key, data, duration) {
    try {
      const item = {
        data,
        expiry: Date.now() + duration
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      // If quota exceeded, clear old caches
      if (e.name === 'QuotaExceededError') {
        this.clearExpired();
      }
    }
  },

  clearExpired() {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item.expiry && item.expiry < now) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  },

  clear() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
};

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
  },

  show(message, type = 'info', duration = 4000) {
    if (!this.container) return;

    const icons = {
      success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      ${icons[type] || icons.info}
      <div class="toast-content">
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${Security.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  },

  dismiss(toast) {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  },

  success(msg, duration) { return this.show(msg, 'success', duration); },
  error(msg, duration) { return this.show(msg, 'error', duration); },
  warning(msg, duration) { return this.show(msg, 'warning', duration); },
  info(msg, duration) { return this.show(msg, 'info', duration); }
};

// ============================================
// APPLICATION STATE
// ============================================
const AppState = {
  currentSheet: 'alumni',
  currentPage: 1,
  pageSize: API_CONFIG.pageSize,
  searchQuery: '',
  filters: {},
  viewMode: 'list',       // 'list', 'grid', 'compact'
  sortColumn: null,
  sortDirection: 'asc',
  lastRefresh: null,
  autoRefreshEnabled: false,
  autoRefreshIntervalId: null,
  isLoading: false,
  isOffline: false,
  data: [],               // Full dataset
  filteredData: [],       // Filtered dataset
  totalRecords: 0,
  stats: {},

  // Column definitions per sheet
  columns: {
    alumni: [
      { key: 'timestamp', label: 'TIMESTAMP', sortable: true, width: '180px', type: 'timestamp' },
      { key: 'fullName', label: 'FULL NAME', sortable: true, width: 'auto', type: 'text' },
      { key: 'email', label: 'EMAIL ADDRESS', sortable: true, width: 'auto', type: 'email' },
      { key: 'degree', label: 'DEGREE COMPLETED AT RSU', sortable: true, width: '220px', type: 'badge' },
      { key: 'year', label: 'YEAR GRADUATED', sortable: true, width: '140px', type: 'text' },
      { key: 'campus', label: 'CAMPUS', sortable: true, width: '120px', type: 'text' }
    ],
    nsrp: [
      { key: 'timestamp', label: 'TIMESTAMP', sortable: true, width: '180px', type: 'timestamp' },
      { key: 'fullName', label: 'FULL NAME', sortable: true, width: 'auto', type: 'text' },
      { key: 'email', label: 'EMAIL', sortable: true, width: 'auto', type: 'email' },
      { key: 'status', label: 'STATUS', sortable: true, width: '120px', type: 'badge' }
    ],
    jops: [
      { key: 'timestamp', label: 'TIMESTAMP', sortable: true, width: '180px', type: 'timestamp' },
      { key: 'fullName', label: 'FULL NAME', sortable: true, width: 'auto', type: 'text' },
      { key: 'email', label: 'EMAIL', sortable: true, width: 'auto', type: 'email' },
      { key: 'score', label: 'SCORE', sortable: true, width: '100px', type: 'text' }
    ],
    legs: [
      { key: 'timestamp', label: 'TIMESTAMP', sortable: true, width: '180px', type: 'timestamp' },
      { key: 'fullName', label: 'FULL NAME', sortable: true, width: 'auto', type: 'text' },
      { key: 'email', label: 'EMAIL', sortable: true, width: 'auto', type: 'email' },
      { key: 'participation', label: 'PARTICIPATION', sortable: true, width: '150px', type: 'badge' }
    ]
  },

  // Sheet metadata
  sheets: {
    alumni: { name: 'Alumni Info Sheet', statId: 'statAlumni', badgeId: 'badgeAlumni' },
    nsrp: { name: 'NSRP Registration', statId: 'statNsrp', badgeId: 'badgeNsrp' },
    jops: { name: 'JOPS Evaluation', statId: 'statJops', badgeId: 'badgeJops' },
    legs: { name: 'LEGS Participation', statId: 'statLegs', badgeId: 'badgeLegs' }
  }
};

// ============================================
// DEBOUNCE UTILITY
// ============================================
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================
// DOM REFERENCES
// ============================================
const DOM = {
  get(id) { return document.getElementById(id); },

  // Lazy initialization
  refs: {},

  init() {
    const ids = [
      'sidebar', 'mainContent', 'contentArea', 'tableOuterWrapper', 'tableInnerWrapper',
      'dataTable', 'tableHead', 'tableHeaderRow', 'tableBody', 'tableFooter',
      'paginationInfo', 'pagination', 'pageNumbers', 'prevPage', 'nextPage',
      'searchInput', 'searchBtn', 'searchClear', 'searchWrapper',
      'toolbarWrapper', 'toolbarCenter', 'activeFilters',
      'skeletonLoader', 'emptyState', 'errorState', 'errorMessage',
      'breadcrumbActive', 'lastUpdatedBadge', 'lastUpdatedText',
      'statAlumni', 'statNsrp', 'statJops', 'statLegs',
      'badgeAlumni', 'badgeNsrp', 'badgeJops', 'badgeLegs',
      'recordsNav', 'refreshAllBtn', 'autoToggle', 'autoStatus',
      'lastSidebarUpdate', 'offlineBanner', 'toastContainer',
      'refreshBtn', 'exportBtn', 'fullscreenBtn', 'retryBtn', 'clearFiltersBtn',
      'helpBtn', 'settingsBtn'
    ];

    ids.forEach(id => {
      this.refs[id] = document.getElementById(id);
    });
  },

  ref(id) {
    if (!this.refs[id]) {
      this.refs[id] = document.getElementById(id);
    }
    return this.refs[id];
  }
};

// ============================================
// TABLE RENDERING ENGINE
// ============================================
const TableRenderer = {
  // Render table headers
  renderHeaders() {
    const columns = AppState.columns[AppState.currentSheet] || [];
    const headerRow = DOM.ref('tableHeaderRow');

    // Use DocumentFragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;

      if (col.sortable) {
        th.classList.add('sortable');
        th.style.cursor = 'pointer';
        th.setAttribute('role', 'columnheader');
        th.setAttribute('scope', 'col');

        if (AppState.sortColumn === col.key) {
          th.classList.add(AppState.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }

        th.addEventListener('click', () => this.handleSort(col.key));
      }

      fragment.appendChild(th);
    });

    headerRow.innerHTML = '';
    headerRow.appendChild(fragment);
  },

  // Render table rows with virtual pagination
  renderRows() {
    const tbody = DOM.ref('tableBody');
    const columns = AppState.columns[AppState.currentSheet] || [];

    // Calculate pagination
    const start = (AppState.currentPage - 1) * AppState.pageSize;
    const end = start + AppState.pageSize;
    const pageData = AppState.filteredData.slice(start, end);

    // Use DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    if (pageData.length === 0) {
      tbody.innerHTML = '';
      return;
    }

    pageData.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 30}ms`;

      columns.forEach(col => {
        const td = document.createElement('td');
        const value = row[col.key] || '';

        switch (col.type) {
          case 'timestamp':
            td.className = 'timestamp-cell';
            td.textContent = this.formatTimestamp(value);
            break;

          case 'email':
            td.className = 'email-cell';
            if (value) {
              const a = document.createElement('a');
              a.href = `mailto:${Security.escapeHtml(value)}`;
              a.textContent = value;
              a.style.color = 'inherit';
              a.style.textDecoration = 'none';
              td.appendChild(a);
            }
            break;

          case 'badge':
            if (value) {
              const badge = document.createElement('span');
              badge.className = 'degree-badge';
              badge.textContent = value;
              td.appendChild(badge);
            }
            break;

          default:
            // Highlight search matches
            if (AppState.searchQuery && value) {
              const escapedQuery = Security.escapeHtml(AppState.searchQuery);
              const escapedValue = Security.escapeHtml(String(value));
              td.innerHTML = escapedValue.replace(regex, '<span class="search-highlight">$1</span>');
            } else {
              td.textContent = value;
            }
        }

        tr.appendChild(td);
      });

      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  },

  // Format timestamp for display
  formatTimestamp(ts) {
    if (!ts) return '--';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  },

  // Handle column sorting
  handleSort(columnKey) {
    if (AppState.sortColumn === columnKey) {
      AppState.sortDirection = AppState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      AppState.sortColumn = columnKey;
      AppState.sortDirection = 'asc';
    }

    // Sort the filtered data
    AppState.filteredData.sort((a, b) => {
      const aVal = (a[columnKey] || '').toString().toLowerCase();
      const bVal = (b[columnKey] || '').toString().toLowerCase();

      if (aVal < bVal) return AppState.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return AppState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.renderHeaders();
    this.renderRows();
    this.updatePagination();
  },

  // Smart pagination - show limited page numbers
  updatePagination() {
    const totalPages = Math.ceil(AppState.filteredData.length / AppState.pageSize) || 1;
    const current = AppState.currentPage;

    // Update info text
    const start = AppState.filteredData.length === 0 ? 0 : (current - 1) * AppState.pageSize + 1;
    const end = Math.min(current * AppState.pageSize, AppState.filteredData.length);
    DOM.ref('paginationInfo').textContent = 
      `Showing ${start}-${end} of ${AppState.filteredData.length}`;

    // Update prev/next buttons
    DOM.ref('prevPage').disabled = current <= 1;
    DOM.ref('nextPage').disabled = current >= totalPages;

    // Generate smart page numbers (max 7 visible: first, last, current, neighbors, ellipsis)
    const pageNumbers = DOM.ref('pageNumbers');
    pageNumbers.innerHTML = '';

    const pages = this.getSmartPagination(current, totalPages);

    pages.forEach(page => {
      if (page === '...') {
        const span = document.createElement('span');
        span.className = 'page-ellipsis';
        span.textContent = '...';
        pageNumbers.appendChild(span);
      } else {
        const btn = document.createElement('button');
        btn.className = `page-number ${page === current ? 'active' : ''}`;
        btn.textContent = page;
        btn.setAttribute('aria-label', `Page ${page}`);
        btn.addEventListener('click', () => this.goToPage(page));
        pageNumbers.appendChild(btn);
      }
    });
  },

  // Generate smart pagination array
  getSmartPagination(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  },

  goToPage(page) {
    const totalPages = Math.ceil(AppState.filteredData.length / AppState.pageSize) || 1;
    if (page < 1 || page > totalPages) return;

    AppState.currentPage = page;
    this.renderRows();
    this.updatePagination();

    // Scroll to top of table
    DOM.ref('tableOuterWrapper').scrollTop = 0;
  },

  // Show/hide loading skeleton
  setLoading(loading) {
    AppState.isLoading = loading;
    const skeleton = DOM.ref('skeletonLoader');
    const table = DOM.ref('dataTable');

    if (loading) {
      skeleton.style.display = 'block';
      table.style.opacity = '0.3';
    } else {
      skeleton.style.display = 'none';
      table.style.opacity = '1';
    }
  },

  // Show empty state
  showEmptyState() {
    DOM.ref('emptyState').style.display = 'flex';
    DOM.ref('dataTable').style.display = 'none';
    DOM.ref('tableFooter').style.display = 'none';
  },

  hideEmptyState() {
    DOM.ref('emptyState').style.display = 'none';
    DOM.ref('dataTable').style.display = 'table';
    DOM.ref('tableFooter').style.display = 'flex';
  },

  // Show error state
  showError(message) {
    DOM.ref('errorState').style.display = 'flex';
    DOM.ref('errorMessage').textContent = message || 'Failed to load data';
    DOM.ref('dataTable').style.display = 'none';
    DOM.ref('tableFooter').style.display = 'none';
    DOM.ref('skeletonLoader').style.display = 'none';
  },

  hideError() {
    DOM.ref('errorState').style.display = 'none';
  }
};

// ============================================
// DATA MANAGEMENT
// ============================================
const DataManager = {
  // Load data for current sheet (lazy loading)
  async loadData(sheetKey, forceRefresh = false) {
    if (AppState.isLoading) return;

    TableRenderer.setLoading(true);
    TableRenderer.hideError();
    TableRenderer.hideEmptyState();

    try {
      // Simulate API call - replace with actual endpoint
      // const response = await apiFetch(sheetKey, {}, { forceRefresh });

      // For demo, generate mock data
      const response = await this.mockFetch(sheetKey);

      AppState.data = response.data || [];
      AppState.totalRecords = response.total || AppState.data.length;

      // Apply filters and search
      this.applyFilters();

      // Update UI
      TableRenderer.renderHeaders();
      TableRenderer.renderRows();
      TableRenderer.updatePagination();

      // Update stats
      this.updateStats(sheetKey, AppState.totalRecords);

      // Update timestamp
      AppState.lastRefresh = new Date();
      this.updateTimestamps();

      TableRenderer.setLoading(false);

      if (AppState.filteredData.length === 0) {
        TableRenderer.showEmptyState();
      }

    } catch (error) {
      console.error('Load data error:', error);
      TableRenderer.setLoading(false);
      TableRenderer.showError(error.message);

      // Try to use cached data as fallback
      const cached = CacheManager.get(`cache_${sheetKey}_`);
      if (cached && cached.data) {
        Toast.warning('Using cached data. Some information may be outdated.', 5000);
        AppState.data = cached.data;
        this.applyFilters();
        TableRenderer.renderHeaders();
        TableRenderer.renderRows();
        TableRenderer.updatePagination();
        TableRenderer.hideError();
      } else {
        Toast.error('Failed to load data. Please check your connection.', 5000);
      }
    }
  },

  // Mock data generator for demo (replace with actual API)
  async mockFetch(sheetKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = [];
        const count = sheetKey === 'alumni' ? 224 : 0;

        const degrees = ['BSBA', 'BSBA - Operations Management', 'BSCS', 'BSED', 'BEED'];
        const campuses = ['Main', 'Branch'];
        const years = ['2026', '2025', '2024', '2023'];

        for (let i = 0; i < count; i++) {
          mockData.push({
            timestamp: new Date(2026, 4, 17, 20 + Math.floor(i/10), Math.floor(Math.random() * 60)).toISOString(),
            fullName: this.generateName(i),
            email: `user${i}@gmail.com`,
            degree: degrees[Math.floor(Math.random() * degrees.length)],
            year: years[Math.floor(Math.random() * years.length)],
            campus: campuses[Math.floor(Math.random() * campuses.length)]
          });
        }

        resolve({ data: mockData, total: count });
      }, 800);
    });
  },

  generateName(index) {
    const lastNames = ['ACAT', 'ADRIGUEZ', 'AGNOTE', 'AGUSTIN', 'BAUTISTA', 'CABRERA', 'DELA CRUZ', 'ESPIRITU', 'FERNANDEZ', 'GARCIA'];
    const firstNames = ['Ma. Luisa Madrona', 'Jearon Densing', 'Clarence Tiburania', 'Daniela Mae Ricafrente', 'Juan', 'Maria', 'Pedro', 'Ana', 'Jose', 'Carmen'];
    return `${lastNames[index % lastNames.length]}, ${firstNames[index % firstNames.length]}`;
  },

  // Apply all filters and search
  applyFilters() {
    let result = [...AppState.data];

    // Apply search
    if (AppState.searchQuery) {
      const query = AppState.searchQuery.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(query)
        );
      });
    }

    // Apply dropdown filters
    Object.entries(AppState.filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => {
          const rowVal = String(row[key] || '').toLowerCase();
          return rowVal.includes(value.toLowerCase());
        });
      }
    });

    // Apply segment filter (all/recent/archived)
    const segmentFilter = document.querySelector('.segment-btn.active')?.dataset.filter;
    if (segmentFilter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter(row => {
        const rowDate = new Date(row.timestamp);
        return rowDate >= oneWeekAgo;
      });
    }

    AppState.filteredData = result;
    AppState.currentPage = 1;

    this.updateActiveFilters();
  },

  // Update active filter chips
  updateActiveFilters() {
    const container = DOM.ref('activeFilters');
    const chips = [];

    if (AppState.searchQuery) {
      chips.push({ key: 'search', label: `Search: "${AppState.searchQuery}"` });
    }

    Object.entries(AppState.filters).forEach(([key, value]) => {
      if (value) {
        const col = (AppState.columns[AppState.currentSheet] || []).find(c => c.key === key);
        chips.push({ key, label: `${col?.label || key}: ${value}` });
      }
    });

    if (chips.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = '';

    chips.forEach(chip => {
      const div = document.createElement('div');
      div.className = 'filter-chip';
      div.innerHTML = `
        <span>${Security.escapeHtml(chip.label)}</span>
        <button aria-label="Remove filter ${Security.escapeHtml(chip.label)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      div.querySelector('button').addEventListener('click', () => {
        if (chip.key === 'search') {
          AppState.searchQuery = '';
          DOM.ref('searchInput').value = '';
          DOM.ref('searchClear').style.display = 'none';
        } else {
          AppState.filters[chip.key] = '';
          // Reset filter dropdown UI
          const filterBtn = document.querySelector(`[id^="filter"]`);
          if (filterBtn) {
            const defaultText = filterBtn.querySelector('span')?.dataset.default || 'Filter';
            filterBtn.querySelector('span').textContent = defaultText;
          }
        }
        this.applyFilters();
        TableRenderer.renderRows();
        TableRenderer.updatePagination();
      });

      container.appendChild(div);
    });
  },

  // Update sidebar stats
  updateStats(sheetKey, count) {
    const sheet = AppState.sheets[sheetKey];
    if (!sheet) return;

    const statEl = DOM.ref(sheet.statId);
    const badgeEl = DOM.ref(sheet.badgeId);

    if (statEl) statEl.textContent = count;
    if (badgeEl) badgeEl.textContent = count;

    // Animate the number
    this.animateNumber(statEl, count);
  },

  animateNumber(element, target) {
    if (!element) return;
    const start = parseInt(element.textContent) || 0;
    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(update);
  },

  // Update all timestamps
  updateTimestamps() {
    if (!AppState.lastRefresh) return;

    const now = new Date();
    const diff = Math.floor((now - AppState.lastRefresh) / 1000 / 60); // minutes

    let text;
    if (diff < 1) text = 'Just now';
    else if (diff === 1) text = '1m ago';
    else if (diff < 60) text = `${diff}m ago`;
    else if (diff < 1440) text = `${Math.floor(diff / 60)}h ago`;
    else text = `${Math.floor(diff / 1440)}d ago`;

    const badge = DOM.ref('lastUpdatedBadge');
    const textEl = DOM.ref('lastUpdatedText');
    const sidebarText = DOM.ref('lastSidebarUpdate');

    if (textEl) textEl.textContent = text;
    if (sidebarText) sidebarText.textContent = AppState.lastRefresh.toLocaleTimeString();

    // Update badge color based on age
    if (badge) {
      badge.style.background = diff > 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
      badge.style.borderColor = diff > 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
      badge.style.color = diff > 30 ? '#ef4444' : '#10b981';
    }
  }
};

// ============================================
// SEARCH & FILTER HANDLERS
// ============================================
const SearchFilter = {
  init() {
    // Search input with debounce
    const searchInput = DOM.ref('searchInput');
    const searchBtn = DOM.ref('searchBtn');
    const searchClear = DOM.ref('searchClear');

    // Debounced search (300ms)
    const debouncedSearch = debounce((query) => {
      AppState.searchQuery = Security.sanitizeInput(query);
      DataManager.applyFilters();
      TableRenderer.renderRows();
      TableRenderer.updatePagination();

      if (AppState.filteredData.length === 0 && AppState.searchQuery) {
        TableRenderer.showEmptyState();
      } else {
        TableRenderer.hideEmptyState();
      }
    }, 300);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      searchClear.style.display = query ? 'flex' : 'none';
      debouncedSearch(query);
    });

    // Search button click
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value;
      AppState.searchQuery = Security.sanitizeInput(query);
      DataManager.applyFilters();
      TableRenderer.renderRows();
      TableRenderer.updatePagination();
    });

    // Clear search
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      AppState.searchQuery = '';
      DataManager.applyFilters();
      TableRenderer.renderRows();
      TableRenderer.updatePagination();
      TableRenderer.hideEmptyState();
      searchInput.focus();
    });

    // Enter key in search
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });

    // Filter dropdowns
    this.initFilterDropdowns();

    // Segment controls (All/Recent/Archived)
    document.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        DataManager.applyFilters();
        TableRenderer.renderRows();
        TableRenderer.updatePagination();
      });
    });

    // Clear all filters
    DOM.ref('clearFiltersBtn')?.addEventListener('click', () => {
      AppState.searchQuery = '';
      AppState.filters = {};
      searchInput.value = '';
      searchClear.style.display = 'none';

      // Reset dropdowns
      document.querySelectorAll('.filter-btn').forEach(btn => {
        const span = btn.querySelector('span');
        if (span && span.dataset.default) {
          span.textContent = span.dataset.default;
        }
      });

      document.querySelectorAll('.filter-option').forEach(opt => {
        opt.classList.remove('selected');
      });

      document.querySelectorAll('.segment-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === 0);
        btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      });

      DataManager.applyFilters();
      TableRenderer.renderRows();
      TableRenderer.updatePagination();
      TableRenderer.hideEmptyState();
    });
  },

  initFilterDropdowns() {
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      const btn = dropdown.querySelector('.filter-btn');
      const menu = dropdown.querySelector('.filter-menu');
      const options = dropdown.querySelectorAll('.filter-option');
      const filterId = btn.id;

      // Store default text
      const span = btn.querySelector('span');
      if (span && !span.dataset.default) {
        span.dataset.default = span.textContent;
      }

      // Toggle dropdown
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close all other dropdowns
        document.querySelectorAll('.filter-btn[aria-expanded="true"]').forEach(b => {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            b.nextElementSibling?.setAttribute('hidden', '');
          }
        });

        btn.setAttribute('aria-expanded', !isExpanded);
        if (isExpanded) {
          menu.setAttribute('hidden', '');
        } else {
          menu.removeAttribute('hidden');
        }
      });

      // Select option
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();

          const value = option.dataset.value;
          const text = option.textContent;

          // Update UI
          options.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');

          // Update button text
          if (span) span.textContent = text;

          // Close dropdown
          btn.setAttribute('aria-expanded', 'false');
          menu.setAttribute('hidden', '');

          // Map filter ID to column key
          const filterMap = {
            'filterDegree': 'degree',
            'filterYear': 'year',
            'filterCampus': 'campus'
          };

          const columnKey = filterMap[filterId];
          if (columnKey) {
            AppState.filters[columnKey] = value;
            DataManager.applyFilters();
            TableRenderer.renderRows();
            TableRenderer.updatePagination();

            if (AppState.filteredData.length === 0) {
              TableRenderer.showEmptyState();
            } else {
              TableRenderer.hideEmptyState();
            }
          }
        });
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[aria-expanded="true"]').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.nextElementSibling?.setAttribute('hidden', '');
      });
    });
  }
};

// ============================================
// NAVIGATION & SHEET SWITCHING (LAZY LOADING)
// ============================================
const Navigation = {
  init() {
    // Stat cards click
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const sheet = card.dataset.sheet;
        if (sheet) this.switchSheet(sheet);
      });

      // Keyboard accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const sheet = card.dataset.sheet;
          if (sheet) this.switchSheet(sheet);
        }
      });
    });

    // Record tabs
    document.querySelectorAll('.record-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const sheet = tab.dataset.sheet;
        if (sheet) this.switchSheet(sheet);
      });
    });

    // Pagination buttons
    DOM.ref('prevPage')?.addEventListener('click', () => {
      TableRenderer.goToPage(AppState.currentPage - 1);
    });

    DOM.ref('nextPage')?.addEventListener('click', () => {
      TableRenderer.goToPage(AppState.currentPage + 1);
    });
  },

  switchSheet(sheetKey) {
    if (sheetKey === AppState.currentSheet) return;

    // Update state
    AppState.currentSheet = sheetKey;
    AppState.currentPage = 1;
    AppState.searchQuery = '';
    AppState.filters = {};
    AppState.sortColumn = null;
    AppState.sortDirection = 'asc';

    // Update sidebar UI
    document.querySelectorAll('.stat-card').forEach(c => {
      c.classList.toggle('active', c.dataset.sheet === sheetKey);
      c.setAttribute('aria-pressed', c.dataset.sheet === sheetKey ? 'true' : 'false');
    });

    document.querySelectorAll('.record-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.sheet === sheetKey);
      t.setAttribute('aria-selected', t.dataset.sheet === sheetKey ? 'true' : 'false');
    });

    // Update breadcrumb
    const sheetInfo = AppState.sheets[sheetKey];
    if (sheetInfo) {
      DOM.ref('breadcrumbActive').textContent = sheetInfo.name;
    }

    // Reset search
    const searchInput = DOM.ref('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    const searchClear = DOM.ref('searchClear');
    if (searchClear) {
      searchClear.style.display = 'none';
    }

    // Reset filters UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const span = btn.querySelector('span');
      if (span && span.dataset.default) {
        span.textContent = span.dataset.default;
      }
    });

    document.querySelectorAll('.filter-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Reset segment
    document.querySelectorAll('.segment-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === 0);
      btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    });

    // Hide active filters
    DOM.ref('activeFilters').style.display = 'none';
    DOM.ref('activeFilters').innerHTML = '';

    // Load data (lazy - only when needed)
    DataManager.loadData(sheetKey);

    Toast.info(`Switched to ${sheetInfo?.name || sheetKey}`);
  }
};

// ============================================
// AUTO REFRESH SYSTEM
// ============================================
const AutoRefresh = {
  init() {
    const toggle = DOM.ref('autoToggle');
    const status = DOM.ref('autoStatus');

    toggle?.addEventListener('click', () => {
      AppState.autoRefreshEnabled = !AppState.autoRefreshEnabled;

      toggle.setAttribute('aria-pressed', AppState.autoRefreshEnabled ? 'true' : 'false');
      status.textContent = AppState.autoRefreshEnabled ? 'On' : 'Off';

      if (AppState.autoRefreshEnabled) {
        this.start();
        Toast.success('Auto-refresh enabled (1 minute)', 3000);
      } else {
        this.stop();
        Toast.info('Auto-refresh disabled', 3000);
      }
    });

    // Manual refresh button
    DOM.ref('refreshBtn')?.addEventListener('click', () => {
      this.manualRefresh();
    });

    DOM.ref('refreshAllBtn')?.addEventListener('click', () => {
      this.manualRefresh();
    });

    // Retry button
    DOM.ref('retryBtn')?.addEventListener('click', () => {
      this.manualRefresh();
    });
  },

  start() {
    this.stop();

    // Immediate first refresh
    this.tick();

    // Set interval
    AppState.autoRefreshIntervalId = setInterval(() => {
      this.tick();
    }, API_CONFIG.autoRefreshInterval);

    // Update timestamp display every minute
    this.timeUpdateId = setInterval(() => {
      DataManager.updateTimestamps();
    }, 60000);
  },

  stop() {
    if (AppState.autoRefreshIntervalId) {
      clearInterval(AppState.autoRefreshIntervalId);
      AppState.autoRefreshIntervalId = null;
    }
    if (this.timeUpdateId) {
      clearInterval(this.timeUpdateId);
      this.timeUpdateId = null;
    }
  },

  async tick() {
    // Don't refresh if user is interacting with filters/search
    if (document.querySelector('.filter-menu:not([hidden])')) return;

    try {
      await DataManager.loadData(AppState.currentSheet, true);

      // Subtle notification
      Toast.success('Data refreshed', 2000);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      // Silent fail on auto-refresh, don't annoy user
    }
  },

  async manualRefresh() {
    const btn = DOM.ref('refreshBtn') || DOM.ref('refreshAllBtn');
    btn?.classList.add('spinning');

    try {
      await DataManager.loadData(AppState.currentSheet, true);
      Toast.success('Data refreshed successfully', 3000);
    } catch (error) {
      Toast.error('Refresh failed. Please try again.', 3000);
    } finally {
      btn?.classList.remove('spinning');
    }
  }
};

// ============================================
// VIEW MODES & FULLSCREEN
// ============================================
const ViewManager = {
  init() {
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.setViewMode(view);
      });
    });

    // Fullscreen toggle
    DOM.ref('fullscreenBtn')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Export CSV
    DOM.ref('exportBtn')?.addEventListener('click', () => {
      this.exportCSV();
    });
  },

  setViewMode(mode) {
    AppState.viewMode = mode;

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === mode);
      btn.setAttribute('aria-pressed', btn.dataset.view === mode ? 'true' : 'false');
    });

    const table = DOM.ref('dataTable');
    const wrapper = DOM.ref('tableOuterWrapper');

    // Remove previous mode classes
    table.classList.remove('view-list', 'view-grid', 'view-compact');
    wrapper.classList.remove('view-list', 'view-grid', 'view-compact');

    // Apply new mode
    table.classList.add(`view-${mode}`);
    wrapper.classList.add(`view-${mode}`);

    // Re-render if needed
    if (mode === 'grid') {
      // Grid view would need different rendering
      Toast.info('Grid view activated', 2000);
    } else if (mode === 'compact') {
      AppState.pageSize = 50;
      TableRenderer.renderRows();
      TableRenderer.updatePagination();
      Toast.info('Compact view: 50 rows per page', 2000);
    } else {
      AppState.pageSize = API_CONFIG.pageSize;
      TableRenderer.renderRows();
      TableRenderer.updatePagination();
    }
  },

  toggleFullscreen() {
    const body = document.body;
    const isFullscreen = body.classList.toggle('fullscreen-mode');

    if (isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      Toast.info('Fullscreen mode. Press ESC to exit.', 3000);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  },
};

// ============================================
// OFFLINE DETECTION
// ============================================
const OfflineManager = {
  init() {
    window.addEventListener('online', () => {
      AppState.isOffline = false;
      DOM.ref('offlineBanner').classList.remove('visible');
      Toast.success('Back online', 3000);

      // Refresh data
      DataManager.loadData(AppState.currentSheet);
    });

    window.addEventListener('offline', () => {
      AppState.isOffline = true;
      DOM.ref('offlineBanner').classList.add('visible');
      Toast.warning('You are offline. Using cached data.', 5000);
    });

    // Initial check
    if (!navigator.onLine) {
      AppState.isOffline = true;
      DOM.ref('offlineBanner').classList.add('visible');
    }
  }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
const KeyboardShortcuts = {
  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.ref('searchInput')?.focus();
      }

      // Ctrl/Cmd + R: Refresh (prevent default browser refresh, do app refresh)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        AutoRefresh.manualRefresh();
      }

      // Escape: Close dropdowns, clear search
      if (e.key === 'Escape') {
        document.querySelectorAll('.filter-menu').forEach(m => m.setAttribute('hidden', ''));
        document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }
    });
  }
};

// ============================================
// PERFORMANCE MONITORING
// ============================================
const PerformanceMonitor = {
  init() {
    // Log initial load time
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${Math.round(entry.duration)}ms`);
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
    }
  }
};

// ============================================
// INTERSECTION OBSERVER (Lazy loading images if any)
// ============================================
const LazyLoader = {
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.observer.unobserve(img);
            }
          }
        });
      }, { rootMargin: '50px' });
    }
  },

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }
};

// ============================================
// STICKY TOOLBAR ON SCROLL (Wide Table)
// ============================================
const StickyToolbar = {
  init() {
    const toolbar = DOM.ref('toolbarWrapper');
    const contentArea = DOM.ref('contentArea');

    if (!toolbar || !contentArea) return;

    let lastScrollTop = 0;

    contentArea.addEventListener('scroll', debounce(() => {
      const scrollTop = contentArea.scrollTop;

      // Add shadow when scrolled
      if (scrollTop > 10) {
        toolbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      } else {
        toolbar.style.boxShadow = 'none';
      }

      lastScrollTop = scrollTop;
    }, 50));
  }
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Initialize DOM references
  DOM.init();

  // Initialize security
  Security.initCSPReporting();

  // Initialize subsystems
  Toast.init();
  SearchFilter.init();
  Navigation.init();
  AutoRefresh.init();
  ViewManager.init();
  OfflineManager.init();
  KeyboardShortcuts.init();
  PerformanceMonitor.init();
  LazyLoader.init();
  StickyToolbar.init();

  // Clear expired cache on startup
  CacheManager.clearExpired();

  // Load initial data (lazy - only alumni on startup)
  DataManager.loadData('alumni');

  // Start timestamp updater
  setInterval(() => DataManager.updateTimestamps(), 30000);

  console.log('Alumni Portal initialized. Security features active.');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose minimal API for debugging (no sensitive data)
window.PortalDebug = {
  getState() {
    return {
      currentSheet: AppState.currentSheet,
      totalRecords: AppState.totalRecords,
      filteredCount: AppState.filteredData.length,
      currentPage: AppState.currentPage,
      autoRefresh: AppState.autoRefreshEnabled,
      isOffline: AppState.isOffline,
      lastRefresh: AppState.lastRefresh
    };
  },
  refresh() {
    AutoRefresh.manualRefresh();
  },
  clearCache() {
    CacheManager.clear();
    Toast.success('Cache cleared', 3000);
  }
};
