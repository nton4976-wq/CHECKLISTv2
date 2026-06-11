// ============================================
// Alumni & Seminar Dashboard — Enhanced v3
// Live Updates | Duplicate Detection | Smart UI
// ============================================

const CONFIG = {
    DEBOUNCE_MS: 150,
    STALE_THRESHOLD_MS: 300000,
    AUTO_REFRESH_INTERVAL_MS: 60000,
    LIVE_INDICATOR_DURATION_MS: 2000,
    DEFAULT_CONFIG_URL: 'https://script.google.com/macros/s/AKfycbzmuLzINxTAr11Gp8xLVs1hEr_vu5hU4I_oIFT9foEFhv7y5QBKgs70I04VZywz8wjJ/exec'
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MODULES = {
'alumni-info': {
    title: 'Alumni Info Sheet',
    subtitle: 'Alumni registration form responses',
    icon: 'fa-user',
    dataKey: 'alumniInfo',
    endpointKey: 'alumni-info',
    filters: ['All'],
    defaultSort: { column: 'fullName', direction: 'asc' },
    columns: [
        { key: 'timestamp',       label: 'Timestamp',              sortable: true, format: 'customDate', filterable: true, filterType: 'month' },
        { key: 'fullName',        label: 'Full Name',              sortable: true, computed: true },
        { key: 'email',           label: 'Email Address',          sortable: true, uppercase: false },
        { key: 'sexAtBirth',      label: 'Sex Assigned at Birth',  sortable: true, filterable: true },
        { key: 'genderIdentity',  label: 'Gender Identity',        sortable: true, filterable: true },
        { key: 'isPwd',           label: 'PWD Status',             sortable: true, filterable: true },
        { key: 'pwdType',         label: 'PWD Type',               sortable: true, filterable: true },
        { key: 'isIp',            label: 'IP Member',              sortable: true, filterable: true },
        { key: 'ipAffiliation',   label: 'IP Affiliation',         sortable: true, filterable: true },
        { key: 'civilStatus',     label: 'Civil Status',           sortable: true, filterable: true },
        { key: 'citizenship',     label: 'Citizenship',            sortable: true, filterable: true },
        { key: 'birthdate',       label: 'Birthdate',              sortable: true, format: 'birthdateWithAge', filterable: true, filterType: 'month' },
        { key: 'telephone',       label: 'Telephone / Mobile',     sortable: true },
        { key: 'facebook',        label: 'Facebook Account',       sortable: true },
        { key: 'homeAddress',     label: 'Home Address',           sortable: true, validateAddress: true },
        { key: 'firstGenCollege', label: 'First Gen College',      sortable: true, filterable: true },
        { key: 'degree',          label: 'Degree Completed at RSU', sortable: true, filterable: true },
        { key: 'yearGraduated',   label: 'Year Graduated',          sortable: true, filterable: true },
        { key: 'campus',          label: 'Campus',                  sortable: true, filterable: true }
    ]
},
    'nsrp-registration': {
        title: 'NSRP Registration',
        subtitle: 'NSRP form responses',
        icon: 'fa-id-card',
        dataKey: 'nsrp',
        endpointKey: 'nsrp-registration',
        filters: ['All'],
        defaultSort: { column: 'fullName', direction: 'asc' },
        columns: [
            { key: 'timestamp', label: 'Timestamp', sortable: true, format: 'customDate' },
            { key: 'fullName', label: 'Full Name', sortable: true, computed: true },
            { key: 'email', label: 'E-mail Address', sortable: true, uppercase: false },
            { key: 'address', label: 'Address', sortable: true, computed: true },
            { key: 'school', label: 'School Graduated', sortable: true, filterable: true },
            { key: 'course', label: 'Course', sortable: true, filterable: true, dependsOn: 'school' },
            { key: 'yearGraduated', label: 'Year Graduated', sortable: true, filterable: true }
        ]
    },
    'jops-evaluation': {
        title: 'JOPS Evaluation',
        subtitle: 'Job Orientation and Placement Seminar evaluation responses',
        icon: 'fa-clipboard-check',
        dataKey: 'jopsEvaluation',
        endpointKey: 'jops-evaluation',
        filters: ['All'],
        defaultSort: { column: 'fullName', direction: 'asc' },
        columns: [
            { key: 'timestamp', label: 'Timestamp', sortable: true, format: 'customDate' },
            { key: 'fullName', label: 'Full Name', sortable: true, computed: true },
            { key: 'email', label: 'Email Address', sortable: true, uppercase: false },
            { key: 'college', label: 'College/Campus', sortable: true, filterable: true },
            { key: 'degree', label: 'Degree & Specialization', sortable: true, filterable: true, dependsOn: 'college' }
        ]
    },
    'legs-participation': {
        title: 'LEGS Participation',
        subtitle: 'Labor Education attendance form responses',
        icon: 'fa-graduation-cap',
        dataKey: 'legsParticipation',
        endpointKey: 'legs-participation',
        filters: ['All', 'Green Checks'],
        defaultSort: { column: 'fullName', direction: 'asc' },
        columns: [
            { key: 'schedule', label: 'Webinar Schedule', sortable: true, filterable: true },
            { key: 'timestamp', label: 'Timestamp', sortable: true, format: 'customDate' },
            { key: 'fullName', label: 'Full Name', sortable: true, computed: true },
            { key: 'email', label: 'Email Address', sortable: true, uppercase: false },
            { key: 'degree', label: 'Degree & Specialization', sortable: true, filterable: true, dependsOn: 'campus' },
            { key: 'campus', label: 'Campus', sortable: true, filterable: true }
        ]
    },
    'legs-evaluation': {
        title: 'LEGS Evaluation',
        subtitle: 'Labor Education webinar evaluation responses',
        icon: 'fa-chalkboard-user',
        dataKey: 'legsEvaluation',
        endpointKey: 'legs-evaluation',
        filters: ['All'],
        defaultSort: { column: 'fullName', direction: 'asc' },
        columns: [
            { key: 'timestamp', label: 'Timestamp', sortable: true, format: 'customDate' },
            { key: 'fullName', label: 'Full Name', sortable: true, computed: false },
            { key: 'email', label: 'Email Address', sortable: true, uppercase: false },
            { key: 'college', label: 'College/Campus', sortable: true, filterable: true },
            { key: 'degree', label: 'Degree & Specialization', sortable: true, filterable: true, dependsOn: 'college' }
        ]
    }
};

const DROPDOWN_OPTIONS = {
    webinar: ['Attended', 'Please Verify your record at CARES Office', 'Missing', ''],
    legsEvaluation: ['Answered', 'Missing', 'No Record', '']
};

const STATUS_COLORS = {
    'complete': 'green', 'approved': 'green', 'verified': 'green', 'attended': 'green', 'answered': 'green',
    'incomplete': 'red', 'disapproved': 'red', 'mismatch': 'red', 'missing': 'red', 'no record': 'red',
    'pending': 'orange', 'please verify your record at cares office': 'red', '': 'gray'
};

class DashboardApp {
    constructor() {
        this.currentPage = 'alumni-info';
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = { column: null, direction: 'asc' };
        this.columnFilters = {};
        this.pagination = { page: 1, perPage: 20 };
        this.data = {
            alumniInfo: [], nsrp: [], jopsEvaluation: [], legsParticipation: [], legsEvaluation: []
        };
        this.settings = {
            darkMode: false,
            rowsPerPage: 20,
            visibleColumns: {},
            tableDensity: 'normal',
            showDuplicates: false
        };
        this.endpoints = {};
        this.lastFetch = {};
        this.loadingModules = new Set();
        this.searchDebounce = null;
        this.autoRefreshInterval = null;
        this.autoRefreshEnabled = false;
        this.previousData = {};
        this.duplicateNames = new Set();
        this.isSpeaking = false;
        this.speechNames = [];
        this.currentSpeakIndex = -1;
        this.currentUtterance = null;
        this.speechContext = null;
        this.speakTimeout = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadEndpointsFromStorage();
        this.loadLastFetch();
        this.loadColumnFilters();
        this.bindEvents();
        this.initSearchClear();
        this.checkLogin();
        setTimeout(() => this.loadEndpointsGlobal(), 500);
    }

    checkLogin() {
        const session = sessionStorage.getItem('dashboard_session');
        if (session === 'authenticated') {
            this.hideLogin();
            this.navigateTo('alumni-info');
            this.fetchAllDataOnInit();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value;
        const errorEl = document.getElementById('login-error');
        const card = document.querySelector('.login-card');
        if (user === 'AdminTon' && pass === '4CaresCheqList') {
            errorEl.textContent = '';
            sessionStorage.setItem('dashboard_session', 'authenticated');
            card.style.animation = 'loginSlideOut 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            setTimeout(() => {
                this.hideLogin();
                this.navigateTo('alumni-info');
                this.fetchAllDataOnInit();
            }, 500);
        } else {
            errorEl.textContent = 'Invalid username or password';
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'shake 0.4s ease';
        }
    }

    hideLogin() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            setTimeout(() => overlay.style.display = 'none', 600);
        }
    }

    togglePassword() {
        const input = document.getElementById('login-pass');
        const icon = document.getElementById('eye-icon');
        if (!input || !icon) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    loadSettings() {
        const dark = localStorage.getItem('dashboard_dark_mode');
        if (dark !== null) this.toggleDarkMode(dark === '1', true);
        const rows = localStorage.getItem('dashboard_rows_per_page');
        if (rows) {
            this.settings.rowsPerPage = parseInt(rows, 10);
            this.pagination.perPage = this.settings.rowsPerPage;
        }
        const cols = localStorage.getItem('dashboard_visible_columns');
        if (cols) this.settings.visibleColumns = JSON.parse(cols);
        const density = localStorage.getItem('dashboard_table_density');
        if (density) this.settings.tableDensity = density;
        const showDups = localStorage.getItem('dashboard_show_duplicates');
        if (showDups !== null) this.settings.showDuplicates = showDups === '1';
    }

    saveSettings() {
        localStorage.setItem('dashboard_rows_per_page', this.settings.rowsPerPage);
        localStorage.setItem('dashboard_visible_columns', JSON.stringify(this.settings.visibleColumns));
        localStorage.setItem('dashboard_table_density', this.settings.tableDensity);
        localStorage.setItem('dashboard_show_duplicates', this.settings.showDuplicates ? '1' : '0');
    }

    loadEndpointsFromStorage() {
        const ep = localStorage.getItem('dashboard_endpoints');
        if (ep) {
            try { this.endpoints = JSON.parse(ep); } catch (e) {}
        }
    }

async loadEndpointsGlobal() {
    let configUrl = localStorage.getItem('dashboard_config_endpoint');
    if (!configUrl && CONFIG.DEFAULT_CONFIG_URL) {
        configUrl = CONFIG.DEFAULT_CONFIG_URL;
    }
    if (!configUrl) return;

    try {
        const url = new URL(configUrl);
        url.searchParams.set('action', 'getEndpoints');
        
        const res = await fetch(url.toString(), { redirect: 'follow' });
        const data = await res.json();

        if (data.success && data.endpoints) {
            this.endpoints = { ...this.endpoints, ...data.endpoints };
            this.saveEndpointsToStorage();
            console.log('Global endpoints loaded:', this.endpoints);
        }
    } catch (err) {
        console.warn('Global load failed:', err);
    }
}

async saveEndpointsGlobal() {
    let configUrl = localStorage.getItem('dashboard_config_endpoint');
    if (!configUrl && CONFIG.DEFAULT_CONFIG_URL) {
        configUrl = CONFIG.DEFAULT_CONFIG_URL;
    }
    if (!configUrl) return;

    try {
        const url = new URL(configUrl);
        url.searchParams.set('action', 'saveEndpoints');
        
        Object.entries(this.endpoints).forEach(([key, val]) => {
            if (val) {
                const paramKey = 'ep-' + key
                    .replace('alumni-info', 'alumni')
                    .replace('nsrp-registration', 'nsrp')
                    .replace('jops-evaluation', 'jops')
                    .replace('legs-participation', 'legs-part')
                    .replace('legs-evaluation', 'legs-eval');
                url.searchParams.set(paramKey, val);
            }
        });

        const response = await fetch(url.toString(), { redirect: 'follow' });
        const result = await response.json();

        if (result.success) {
            console.log('Global endpoints saved successfully');
        } else {
            console.warn('Global save returned error:', result.message);
        }
    } catch (err) {
        console.warn('Global save failed:', err);
    }
}

    loadLastFetch() {
        const lf = localStorage.getItem('dashboard_last_fetch');
        if (lf) this.lastFetch = JSON.parse(lf);
    }

    saveLastFetch() {
        localStorage.setItem('dashboard_last_fetch', JSON.stringify(this.lastFetch));
    }

    loadColumnFilters() {
        const cf = localStorage.getItem('dashboard_column_filters');
        if (cf) this.columnFilters = JSON.parse(cf);
    }

    saveColumnFilters() {
        localStorage.setItem('dashboard_column_filters', JSON.stringify(this.columnFilters));
    }

    hasEndpoint(page) {
        return !!this.endpoints[MODULES[page].endpointKey];
    }

    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        const btn = document.getElementById('auto-refresh-btn');
        const icon = document.getElementById('auto-refresh-icon');
        const indicator = document.getElementById('live-indicator');
        if (this.autoRefreshEnabled) {
            btn.classList.add('active');
            btn.querySelector('span').textContent = 'Auto: On';
            indicator.classList.remove('hidden');
            this.startAutoRefresh();
            this.showToast('Auto-refresh enabled (1 min)', 'info');
        } else {
            btn.classList.remove('active');
            btn.querySelector('span').textContent = 'Auto: Off';
            indicator.classList.add('hidden');
            this.stopAutoRefresh();
            this.showToast('Auto-refresh disabled', 'info');
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = setInterval(() => {
            this.fetchAllDataSilent();
        }, CONFIG.AUTO_REFRESH_INTERVAL_MS);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    async fetchAllDataSilent() {
        const pages = Object.keys(MODULES).filter(p => this.hasEndpoint(p));
        if (pages.length === 0) return;
        this.previousData = JSON.parse(JSON.stringify(this.data));
        await Promise.all(pages.map(p => this.fetchModuleData(p, false, true)));
        this.detectNewRecords();
        this.updateDashboardCounts();
        this.renderPage();
    }

    detectNewRecords() {
        const mod = MODULES[this.currentPage];
        const currentRecords = this.data[mod.dataKey] || [];
        const previousRecords = this.previousData[mod.dataKey] || [];
        if (currentRecords.length > previousRecords.length) {
            const newCount = currentRecords.length - previousRecords.length;
            this.showToast(`${newCount} new record(s) detected`, 'success');
            const previousIds = new Set(previousRecords.map(r => r.id || JSON.stringify(r)));
            currentRecords.forEach(r => {
                const key = r.id || JSON.stringify(r);
                if (!previousIds.has(key)) {
                    r._isNew = true;
                }
            });
            setTimeout(() => {
                currentRecords.forEach(r => delete r._isNew);
            }, 3000);
        }
    }

    findDuplicates(records) {
        const nameMap = new Map();
        records.forEach(r => {
            const name = this.getDuplicateNameKey(r);
            if (name && name !== ',' && name !== ' , ') {
                if (!nameMap.has(name)) {
                    nameMap.set(name, []);
                }
                nameMap.get(name).push(r);
            }
        });
        const duplicates = new Map();
        nameMap.forEach((records, name) => {
            if (records.length > 1) {
                duplicates.set(name, records);
            }
        });
        return duplicates;
    }

    updateDuplicateNames(records) {
        this.duplicateNames.clear();
        const duplicates = this.findDuplicates(records);
        duplicates.forEach((recs, name) => {
            this.duplicateNames.add(name);
        });
        return duplicates;
    }

    toggleDuplicateHighlight() {
        this.settings.showDuplicates = !this.settings.showDuplicates;
        this.saveSettings();
        const icon = document.getElementById('duplicate-icon');
        const btn = icon.closest('.glass-btn');
        if (this.settings.showDuplicates) {
            btn.classList.add('active');
            this.showToast('Duplicate highlighting enabled', 'info');
        } else {
            btn.classList.remove('active');
            this.showToast('Duplicate highlighting disabled', 'info');
        }
        this.renderPage();
    }

    openDuplicateModal() {
        const mod = MODULES[this.currentPage];
        const records = this.data[mod.dataKey] || [];
        const duplicates = this.findDuplicates(records);
        if (duplicates.size === 0) {
            this.showToast('No duplicates found', 'info');
            return;
        }
        const body = document.getElementById('duplicate-modal-body');
        let html = '<div class="duplicate-list">';
        duplicates.forEach((recs, name) => {
            html += `
                <div class="duplicate-group">
                    <div class="duplicate-group-header">
                        <i class="fas fa-clone"></i>
                        <span>${this.escapeHtml(name)} (${recs.length} records)</span>
                    </div>
                    <div class="duplicate-group-records">
                        ${recs.map(r => `
                            <div class="duplicate-record-item">
                                ${r.email ? this.escapeHtml(r.email) : 'No email'}
                                ${r.timestamp ? '— ' + this.formatCustomDate(r.timestamp) : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        body.innerHTML = html;
        this.openModal('duplicate-modal');
    }

    playBeep() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
            setTimeout(() => ctx.close(), 300);
        } catch (e) {
            console.warn('Beep failed:', e);
        }
    }

    advancePageForSpeech() {
        const mod = MODULES[this.currentPage];
        const records = this.data[mod.dataKey] || [];
        const filtered = this.filterRecords(records, this.currentPage);
        const totalPages = Math.ceil(filtered.length / this.pagination.perPage);
        if (this.pagination.page >= totalPages) {
            this.playBeep();
            this.stopSpeaking();
            this.showToast('Finished reading all names', 'success');
            return;
        }
        this.pagination.page++;
        this.renderPage();
        window.scrollTo(0, 0);
        if (this.speechContext) this.speechContext.pageNum = this.pagination.page;
        const sorted = this.sortRecords(filtered, this.currentPage);
        const paginated = this.getPaginatedRecords(sorted);
        this.speechNames = paginated.records.map(r => this.getFullName(r)).filter(n => n && n !== ',' && n !== ' , ');
        this.currentSpeakIndex = 0;
        if (this.speechNames.length === 0) {
            this.speakTimeout = setTimeout(() => this.advancePageForSpeech(), 500);
            return;
        }
        this.speakTimeout = setTimeout(() => this.speakNext(), 1500);
    }

    getFilipinoVoice() {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;
        const filVoice = voices.find(v => 
            v.lang === 'fil-PH' || v.lang === 'tl-PH' || 
            v.lang === 'fil' || v.lang === 'tl'
        );
        if (filVoice) return filVoice;
        const partialMatch = voices.find(v => 
            /philippines|tagalog|filipino|fil/i.test(v.lang + ' ' + v.name)
        );
        if (partialMatch) return partialMatch;
        return voices.find(v => /filipino|tagalog/i.test(v.name)) || null;
    }

    async startSpeakingNames() {
        if (!window.speechSynthesis) {
            this.showToast('Text-to-speech not supported in this browser', 'error');
            return;
        }
        this.stopSpeaking();
        const mod = MODULES[this.currentPage];
        const records = this.data[mod.dataKey] || [];
        const filtered = this.filterRecords(records, this.currentPage);
        const sorted = this.sortRecords(filtered, this.currentPage);
        const paginated = this.getPaginatedRecords(sorted);
        this.speechNames = paginated.records.map(r => this.getFullName(r)).filter(n => n && n !== ',' && n !== ' , ');
        if (this.speechNames.length === 0) {
            this.showToast('No names to read on this page', 'warning');
            return;
        }
        if (window.speechSynthesis.getVoices().length === 0) {
            await new Promise(resolve => {
                const handler = () => { window.speechSynthesis.removeEventListener('voiceschanged', handler); resolve(); };
                window.speechSynthesis.addEventListener('voiceschanged', handler);
                setTimeout(resolve, 1000);
            });
        }
        const chosenVoice = this.getFilipinoVoice();
        if (chosenVoice) {
            this.showToast(`Using Filipino voice: ${chosenVoice.name}`, 'info');
        } else {
            this.showToast('No Filipino voice found — using default accent', 'warning');
        }
        this.isSpeaking = true;
        this.currentSpeakIndex = 0;
        this.speechContext = {
            page: this.currentPage,
            filter: this.currentFilter,
            search: this.currentSearch,
            sortColumn: this.currentSort.column,
            sortDir: this.currentSort.direction,
            pageNum: this.pagination.page,
            columnFiltersHash: JSON.stringify(this.columnFilters[this.currentPage] || {})
        };
        this.renderPage();
        this.speakNext();
    }

    speakNext() {
        if (!this.isSpeaking) return;
        if (this.currentSpeakIndex >= this.speechNames.length) {
            this.advancePageForSpeech();
            return;
        }
        if (this.isSpeechContextChanged()) {
            this.stopSpeaking();
            this.showToast('Reading stopped — view changed', 'info');
            return;
        }
        const name = this.speechNames[this.currentSpeakIndex];
        this.updateSpeakingHighlight();
        const utterance = new SpeechSynthesisUtterance(name);
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.lang = 'fil-PH';
        const filVoice = this.getFilipinoVoice();
        if (filVoice) utterance.voice = filVoice;
        utterance.onend = () => {
            this.currentSpeakIndex++;
            this.speakTimeout = setTimeout(() => this.speakNext(), 3000);
        };
        utterance.onerror = (e) => {
            if (e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn('Speech error:', e.error);
            }
            this.currentSpeakIndex++;
            this.speakTimeout = setTimeout(() => this.speakNext(), 3000);
        };
        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    updateSpeakingHighlight() {
        document.querySelectorAll('.speaking-row').forEach(el => el.classList.remove('speaking-row'));
        document.querySelectorAll('.speaking-card').forEach(el => el.classList.remove('speaking-card'));
        const row = document.querySelector(`tr[data-speak-index="${this.currentSpeakIndex}"]`);
        if (row) {
            row.classList.add('speaking-row');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const card = document.querySelector(`.record-card[data-speak-index="${this.currentSpeakIndex}"]`);
        if (card) {
            card.classList.add('speaking-card');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    stopSpeaking() {
        if (!this.isSpeaking && !window.speechSynthesis) return;
        this.isSpeaking = false;
        this.speechNames = [];
        this.currentSpeakIndex = -1;
        this.speechContext = null;
        this.currentUtterance = null;
        if (this.speakTimeout) {
            clearTimeout(this.speakTimeout);
            this.speakTimeout = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        document.querySelectorAll('.speaking-row').forEach(el => el.classList.remove('speaking-row'));
        document.querySelectorAll('.speaking-card').forEach(el => el.classList.remove('speaking-card'));
        this.renderPage();
    }

    isSpeechContextChanged() {
        if (!this.speechContext) return true;
        return this.speechContext.page !== this.currentPage ||
               this.speechContext.filter !== this.currentFilter ||
               this.speechContext.search !== this.currentSearch ||
               this.speechContext.sortColumn !== this.currentSort.column ||
               this.speechContext.sortDir !== this.currentSort.direction ||
               this.speechContext.pageNum !== this.pagination.page ||
               this.speechContext.columnFiltersHash !== JSON.stringify(this.columnFilters[this.currentPage] || {});
    }

    exportDuplicates() {
        const mod = MODULES[this.currentPage];
        const records = this.data[mod.dataKey] || [];
        const duplicates = this.findDuplicates(records);
        if (duplicates.size === 0) return;
        const exportData = [];
        duplicates.forEach((recs, name) => {
            recs.forEach(r => {
                exportData.push({
                    'Duplicate Name': name,
                    'Email': r.email || '',
                    'Timestamp': r.timestamp ? this.formatCustomDate(r.timestamp) : '',
                    'Module': mod.title
                });
            });
        });
        const headers = Object.keys(exportData[0]);
        const csv = [headers.join(',')];
        exportData.forEach(row => {
            csv.push(headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','));
        });
        const blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `duplicates-${this.currentPage}-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast('Duplicates exported successfully');
    }

    async fetchAllDataOnInit() {
        const pages = Object.keys(MODULES).filter(p => this.hasEndpoint(p));
        if (pages.length === 0) return;
        this.showLoading(true);
        await Promise.all(pages.map(p => this.fetchModuleData(p, false)));
        this.showLoading(false);
        this.updateDashboardCounts();
        this.renderPage();
    }

    async fetchModuleData(page, showToast = true, silent = false) {
        const mod = MODULES[page];
        const url = this.endpoints[mod.endpointKey];
        if (!url) {
            if (showToast) this.showToast(`No endpoint configured for ${mod.title}`, 'error');
            return;
        }
        this.loadingModules.add(page);
        if (!silent) this.renderPage();
        try {
            const response = await fetch(url + '?action=getData&sheet=' + encodeURIComponent(mod.dataKey));
            const result = await response.json();
            if (result.success) {
                this.data[mod.dataKey] = Array.isArray(result.data) ? result.data : [];
                this.lastFetch[page] = Date.now();
                this.saveLastFetch();
                const count = this.data[mod.dataKey].length;
                if (showToast) {
                    if (count === 0 && result.rowCount === 0) {
                        this.showToast(`${mod.title} ready — sheet is empty`, 'info');
                    } else {
                        this.showToast(`${mod.title} refreshed — ${count} records`, 'success');
                    }
                }
            } else {
                const legacyRes = await fetch(url + '?action=getData');
                const legacyResult = await legacyRes.json();
                if (legacyResult.success && Array.isArray(legacyResult.data)) {
                    this.data[mod.dataKey] = legacyResult.data;
                    this.lastFetch[page] = Date.now();
                    this.saveLastFetch();
                    if (showToast) this.showToast(`${mod.title} refreshed — ${legacyResult.data.length} records`, 'success');
                } else {
                    throw new Error(result.message || legacyResult.message || 'Invalid response');
                }
            }
        } catch (err) {
            console.error(`Fetch error [${page}]:`, err);
            if (showToast) this.showToast(`Failed to load ${mod.title}`, 'error');
        } finally {
            this.loadingModules.delete(page);
            if (!silent) this.renderPage();
        }
    }

    async refreshData() {
        this.stopSpeaking();
        const pages = Object.keys(MODULES).filter(p => this.hasEndpoint(p));
        if (pages.length === 0) {
            this.showToast('No data sources configured', 'error');
            return;
        }
        this.showLoading(true);
        await Promise.all(pages.map(p => this.fetchModuleData(p, false)));
        this.showLoading(false);
        this.updateDashboardCounts();
        this.showToast('All modules refreshed', 'success');
        this.renderPage();
    }

    updateDashboardCounts() {
        const counts = {
            'alumni-info': this.data.alumniInfo.length,
            'nsrp-registration': this.data.nsrp.length,
            'jops-evaluation': this.data.jopsEvaluation.length,
            'legs-participation': this.data.legsParticipation.length,
            'legs-evaluation': this.data.legsEvaluation.length
        };
        document.getElementById('dash-alumni-count').textContent = counts['alumni-info'];
        document.getElementById('dash-nsrp-count').textContent = counts['nsrp-registration'];
        document.getElementById('dash-jops-count').textContent = counts['jops-evaluation'];
        document.getElementById('dash-legs-count').textContent = counts['legs-participation'] + counts['legs-evaluation'];
        Object.keys(MODULES).forEach(page => {
            const badge = document.getElementById(`nav-badge-${page}`);
            if (badge) badge.textContent = counts[page];
        });
    }

    navigateTo(page) {
        this.stopSpeaking();
        this.currentPage = page;
        this.currentFilter = 'all';
        const mod = MODULES[page];
        this.currentSort = mod.defaultSort ? { ...mod.defaultSort } : { column: null, direction: 'asc' };
        this.pagination.page = 1;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        document.getElementById('breadcrumb-current').textContent = mod.title;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('mobile-overlay').classList.add('hidden');
        this.renderPage();
        window.scrollTo(0, 0);
    }

    renderPage() {
        const mod = MODULES[this.currentPage];
        const content = document.getElementById('page-content');
        let html = this.renderModuleTable(this.currentPage);
        content.innerHTML = html;
        this.updateLastUpdated();
    }

    renderModuleDashboard(page) {
        const mod = MODULES[page];
        const records = this.data[mod.dataKey] || [];
        const filtered = this.filterRecords(records, page);
        const duplicates = this.findDuplicates(records);
        const dupCount = duplicates.size;
        let cards = '';
        cards += `
            <div class="dashboard-card primary">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-icon"><i class="fas fa-database"></i></div>
                </div>
                <div class="dashboard-card-value">${records.length}</div>
                <div class="dashboard-card-label">Total Records</div>
                <div class="dashboard-card-footer">
                    <i class="fas fa-filter"></i> ${filtered.length} filtered
                </div>
            </div>
        `;
        if (dupCount > 0) {
            cards += `
                <div class="dashboard-card warning" onclick="app.openDuplicateModal()">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-clone"></i></div>
                        <div class="dashboard-card-trend trend-down"><i class="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <div class="dashboard-card-value">${dupCount}</div>
                    <div class="dashboard-card-label">Duplicate Names</div>
                    <div class="dashboard-card-footer">
                        <i class="fas fa-eye"></i> Click to view details
                    </div>
                </div>
            `;
        }
        if (page === 'alumni-info') {
            const uniqueDegrees = new Set(records.map(r => r.degree).filter(Boolean)).size;
            const uniqueCampuses = new Set(records.map(r => r.campus).filter(Boolean)).size;
            cards += `
                <div class="dashboard-card info">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-graduation-cap"></i></div>
                    </div>
                    <div class="dashboard-card-value">${uniqueDegrees}</div>
                    <div class="dashboard-card-label">Unique Degrees</div>
                </div>
                <div class="dashboard-card success">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-building"></i></div>
                    </div>
                    <div class="dashboard-card-value">${uniqueCampuses}</div>
                    <div class="dashboard-card-label">Campuses</div>
                </div>
            `;
        } else if (page === 'nsrp-registration') {
            const uniqueSchools = new Set(records.map(r => r.school).filter(Boolean)).size;
            const uniqueCourses = new Set(records.map(r => r.course).filter(Boolean)).size;
            cards += `
                <div class="dashboard-card info">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-school"></i></div>
                    </div>
                    <div class="dashboard-card-value">${uniqueSchools}</div>
                    <div class="dashboard-card-label">Schools</div>
                </div>
                <div class="dashboard-card success">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-book"></i></div>
                    </div>
                    <div class="dashboard-card-value">${uniqueCourses}</div>
                    <div class="dashboard-card-label">Courses</div>
                </div>
            `;
        } else if (page === 'legs-evaluation') {
            const complete = records.filter(r => r.status === 'Complete').length;
            const incomplete = records.filter(r => r.status === 'Incomplete').length;
            cards += `
                <div class="dashboard-card success">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                    <div class="dashboard-card-value">${complete}</div>
                    <div class="dashboard-card-label">Complete</div>
                </div>
                <div class="dashboard-card danger">
                    <div class="dashboard-card-header">
                        <div class="dashboard-card-icon"><i class="fas fa-times-circle"></i></div>
                    </div>
                    <div class="dashboard-card-value">${incomplete}</div>
                    <div class="dashboard-card-label">Incomplete</div>
                </div>
            `;
        }
        return `<div class="module-dashboard">${cards}</div>`;
    }

    renderModuleTable(page) {
        const mod = MODULES[page];
        const records = this.data[mod.dataKey] || [];
        if (this.loadingModules.has(page)) {
            return this.renderSkeletonTable(mod);
        }
        if (!this.hasEndpoint(page) && records.length === 0) {
            return this.renderSetupEmptyState(page);
        }
        const filtered = this.filterRecords(records, page);
        this.updateDuplicateNames(filtered);
        const duplicates = this.findDuplicates(filtered);
        const dupCount = duplicates.size;
        const sorted = this.sortRecords(filtered, page);
        const paginated = this.getPaginatedRecords(sorted);
        const visibleColumns = mod.columns.filter(c => this.isColumnVisible(page, c.key));
        let rowsHtml = '';
        paginated.records.forEach((r, index) => {
            const isDuplicate = this.settings.showDuplicates && this.duplicateNames.has(this.getDuplicateNameKey(r));
            const isNew = r._isNew;
            const isMatched = this.isScheduleMatch(r, page);
            const isSpeaking = this.isSpeaking && this.currentSpeakIndex === index;
            const rowClass = [];
            if (isDuplicate) rowClass.push('duplicate-row');
            if (isNew) rowClass.push('new-record');
            if (isMatched) rowClass.push('schedule-matched');
            if (isSpeaking) rowClass.push('speaking-row');
            rowsHtml += `<tr class="${rowClass.join(' ')}" data-speak-index="${index}">`;
            visibleColumns.forEach(col => {
                rowsHtml += `<td>${this.renderCell(r, col, page, isMatched)}</td>`;
            });
            rowsHtml += `</tr>`;
        });
        let cardsHtml = '';
        paginated.records.forEach((r, index) => {
            const isMatched = this.isScheduleMatch(r, page);
            cardsHtml += this.renderRecordCard(r, page, visibleColumns, isMatched, index);
        });
        const freshness = this.renderFreshnessBadge(page);
        const activeFilterChips = this.renderActiveFilterChips(page);
        const duplicateBanner = dupCount > 0 ? this.renderDuplicateBanner(dupCount) : '';
        const searchCount = this.currentSearch ? `<span class="search-results-badge"><i class="fas fa-search"></i> ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${this.escapeHtml(this.currentSearch)}"</span>` : '';
        const controlsBar = `<div class="table-controls-bar">
            <div class="controls-left">
                ${this.renderFilterTabs(page)}
                ${freshness}
                ${searchCount}
            </div>
            <div class="controls-right">
                <div class="density-toggle">
                    <button class="density-btn ${this.settings.tableDensity === 'compact' ? 'active' : ''}" onclick="app.setTableDensity('compact')" title="Compact"><i class="fas fa-compress"></i></button>
                    <button class="density-btn ${this.settings.tableDensity === 'normal' ? 'active' : ''}" onclick="app.setTableDensity('normal')" title="Normal"><i class="fas fa-grip-lines"></i></button>
                    <button class="density-btn ${this.settings.tableDensity === 'comfortable' ? 'active' : ''}" onclick="app.setTableDensity('comfortable')" title="Comfortable"><i class="fas fa-expand"></i></button>
                </div>
                <button class="btn btn-secondary btn-sm fullscreen-btn" onclick="app.toggleFullscreenTable()" title="Fullscreen Table (Esc to exit)">
                    <i class="fas fa-expand" id="fullscreen-icon"></i>
                </button>
                <div class="column-toggle">
                    <button class="btn btn-secondary btn-sm" onclick="app.toggleColumnMenu(event)" title="Columns"><i class="fas fa-columns"></i></button>
                    <div class="column-toggle-menu" id="column-menu-${page}">
                        ${mod.columns.map(c => `
                            <label class="column-toggle-item">
                                <input type="checkbox" ${this.isColumnVisible(page, c.key) ? 'checked' : ''} onchange="app.toggleColumn('${page}', '${c.key}', this.checked)">
                                ${c.label}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="app.fetchModuleData('${page}')" title="Refresh" id="refresh-btn-${page}"><i class="fas fa-rotate"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="app.exportCurrentModule()"><i class="fas fa-download"></i> CSV</button>
            </div>
        </div>`;
        return duplicateBanner +
            controlsBar +
            activeFilterChips +
            (rowsHtml ? this.renderTableWrapper(visibleColumns, rowsHtml, page) : this.renderEmptyState('No records match your filters.')) +
            `<div class="cards-view">${cardsHtml || this.renderEmptyState('No records match your filters.')}</div>` +
            this.renderPagination(paginated.total, this.pagination.page, this.pagination.perPage);
    }

    renderDuplicateBanner(count) {
        return `
            <div class="duplicate-banner" onclick="app.openDuplicateModal()">
                <div class="duplicate-banner-content">
                    <div class="duplicate-banner-icon"><i class="fas fa-clone"></i></div>
                    <div class="duplicate-banner-text">
                        <span>${count}</span> duplicate name(s) detected in this module
                    </div>
                </div>
                <div class="duplicate-banner-action">View Details <i class="fas fa-arrow-right"></i></div>
            </div>
        `;
    }

    renderSkeletonTable(mod) {
        let rows = '';
        for (let i = 0; i < 5; i++) {
            rows += `<tr>`;
            mod.columns.forEach(() => {
                rows += `<td><div class="skeleton skeleton-text"></div></td>`;
            });
            rows += `</tr>`;
        }
        return `<div class="table-section"><div class="table-wrapper"><table class="data-table"><thead><tr>${mod.columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }

    renderSetupEmptyState(page) {
        const mod = MODULES[page];
        return `
            <div class="empty-state empty-state-setup">
                <i class="fas fa-plug"></i>
                <h3>Connect Data Source</h3>
                <p>No endpoint is configured for <strong>${mod.title}</strong>. Paste your Google Apps Script Web App URL in Data Sources to begin.</p>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="app.openSettingsModal()"><i class="fas fa-gear"></i> Open Data Sources</button>
                </div>
            </div>
        `;
    }

    renderEmptyState(message) {
        return `<div class="empty-state"><i class="fas fa-inbox"></i><p>${message}</p></div>`;
    }

    renderStatsCards(stats, page, dupCount = 0) {
        let cards = '';
        cards += this.renderStatCard('Total Records', stats.total, 'total');
        if (page === 'legs-evaluation') {
            cards += this.renderStatCard('Complete', stats.complete, 'complete');
            cards += this.renderStatCard('Incomplete', stats.incomplete, 'incomplete');
        }
        if (dupCount > 0) {
            cards += this.renderStatCard('Duplicates', dupCount, 'duplicate');
        }
        return `<div class="cards-grid">${cards}</div>`;
    }

    renderStatCard(label, value, type) {
        return `<div class="summary-card ${type}"><div class="card-label">${label}</div><div class="card-value">${value}</div></div>`;
    }

    renderFilterTabs(page) {
        const tabs = MODULES[page].filters || ['All'];
        let html = `<div class="filter-tabs">`;
        tabs.forEach(tab => {
            const active = this.currentFilter === tab.toLowerCase() ? 'active' : '';
            html += `<button class="filter-tab ${active}" onclick="app.setFilter('${tab.toLowerCase()}')">${tab}</button>`;
        });
        html += `</div>`;
        return html;
    }

    renderTableWrapper(columns, rowsHtml, page) {
        let headerHtml = `<thead><tr>`;
        columns.forEach(col => {
            const sortClass = col.sortable ? 'sortable' : '';
            const sortDir = this.currentSort.column === col.key ? this.currentSort.direction : '';
            const sortOnclick = col.sortable ? `onclick="app.sortBy('${col.key}')"` : '';
            let filterIcon = '';
            const hasActiveFilter = this.columnFilters[page] && this.columnFilters[page][col.key] && this.columnFilters[page][col.key].length > 0;
            if (col.filterable) {
                const filterActiveClass = hasActiveFilter ? 'filter-active' : '';
                filterIcon = ` <span class="header-filter-icon ${filterActiveClass}" onclick="event.stopPropagation(); app.openHeaderFilterDropdown(event, '${page}', '${col.key}')" title="Filter ${col.label}"><i class="fas fa-filter"></i></span>`;
            }
            headerHtml += `<th class="${sortClass} ${sortDir}" ${sortOnclick}>${col.label}${filterIcon}</th>`;
        });
        headerHtml += `</tr></thead>`;
        return `<div class="table-section"><div class="table-wrapper"><table class="data-table">${headerHtml}<tbody>${rowsHtml}</tbody></table></div></div>`;
    }

    renderPagination(total, current, perPage) {
        perPage = perPage || this.settings.rowsPerPage;
        const totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) return '';
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (current < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        let html = `<div class="pagination">`;
        html += `<span class="pagination-info">Showing ${Math.min((current - 1) * perPage + 1, total)}–${Math.min(current * perPage, total)} of ${total}</span>`;
        html += `<div class="pagination-controls">`;
        html += `<button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="app.changePage(${current - 1})"><i class="fas fa-chevron-left"></i></button>`;
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="page-btn dots" disabled>…</span>`;
            } else {
                html += `<button class="page-btn ${p === current ? 'active' : ''}" onclick="app.changePage(${p})">${p}</button>`;
            }
        });
        html += `<button class="page-btn" ${current === totalPages ? 'disabled' : ''} onclick="app.changePage(${current + 1})"><i class="fas fa-chevron-right"></i></button>`;
        const speakBtnClass = this.isSpeaking ? 'speak-btn speaking' : 'speak-btn';
        const speakIcon = this.isSpeaking ? 'fa-stop' : 'fa-volume-high';
        const speakTitle = this.isSpeaking ? 'Stop reading names' : 'Read names aloud (auto-paging)';
        const speakAction = this.isSpeaking ? 'app.stopSpeaking()' : 'app.startSpeakingNames()';
        html += `<div class="speak-divider"></div><button class="page-btn ${speakBtnClass}" onclick="${speakAction}" title="${speakTitle}"><i class="fas ${speakIcon}"></i></button>`;
        html += `</div></div>`;
        return html;
    }

    renderRecordCard(r, page, visibleColumns, isMatched, index) {
        const isDuplicate = this.settings.showDuplicates && this.duplicateNames.has(this.getDuplicateNameKey(r));
        const isSpeaking = this.isSpeaking && this.currentSpeakIndex === index;
        let cardClass = '';
        if (isDuplicate) cardClass += ' duplicate-card';
        if (isMatched) cardClass += ' schedule-matched';
        if (isSpeaking) cardClass += ' speaking-card';
        let rows = '';
        visibleColumns.forEach(col => {
            let rawValue = col.computed ? this.formatRow(r, col.key, page) : r[col.key];
            let miniBadge = '';
            if (page === 'legs-participation' && col.key === 'fullName') {
                if (isMatched) {
                    miniBadge = ' <span class="mini-check" title="Date & time match schedule"><i class="fas fa-check"></i></span>';
                } else {
                    miniBadge = ' <span class="mini-x" title="Date or time does not match schedule"><i class="fas fa-times"></i></span>';
                }
            }
            const textValue = this.highlightSearch(rawValue);
            const value = textValue + miniBadge;
            rows += `<div class="record-card-row"><span class="record-card-label">${col.label}</span><span class="record-card-value">${value}</span></div>`;
        });
        return `<div class="record-card${cardClass}" data-speak-index="${index}"><div class="record-card-body">${rows}</div></div>`;
    }

    renderCell(r, col, page, isMatched) {
        let rawValue = col.computed ? this.formatRow(r, col.key, page) : r[col.key];

        if (col.format === 'customDate' && rawValue) {
            rawValue = this.formatCustomDate(rawValue);
        }

        if (col.format === 'birthdateWithAge' && rawValue) {
            rawValue = this.formatBirthdateWithAge(rawValue);
        }

        let miniBadge = '';
        if (page === 'legs-participation' && col.key === 'fullName') {
            if (isMatched) {
                miniBadge = ' <span class="mini-check" title="Date & time match schedule"><i class="fas fa-check"></i></span>';
            } else {
                miniBadge = ' <span class="mini-x" title="Date or time does not match schedule"><i class="fas fa-times"></i></span>';
            }
        }

        let dupBadge = '';
        if (col.key === 'fullName' && this.settings.showDuplicates) {
            const name = this.getDuplicateNameKey(r);
            if (this.duplicateNames.has(name)) {
                dupBadge = ' <span class="duplicate-badge"><i class="fas fa-clone"></i> Duplicate</span>';
            }
        }

        const textValue = this.highlightSearch(rawValue);

        // Apply uppercase for non-email columns
        let displayValue = textValue;
        if (col.uppercase !== false && col.key !== 'email') {
            displayValue = textValue.toUpperCase();
        }

        const value = displayValue + miniBadge + dupBadge;

        if (page === 'legs-evaluation') {
            if (col.key === 'webinar') return this.renderSelect(rawValue, DROPDOWN_OPTIONS.webinar, 'webinar', r.id, 'app.updateLegsField');
            if (col.key === 'evaluation') return this.renderSelect(rawValue, DROPDOWN_OPTIONS.legsEvaluation, 'evaluation', r.id, 'app.updateLegsField');
            if (col.key === 'date') {
                return `<input type="date" class="table-input" value="${this.escapeHtml(rawValue)}" onchange="app.updateLegsField('${r.id}', 'date', this.value)">`;
            }
            if (col.key === 'status') return this.renderBadge(rawValue);
        }

        if (col.validateAddress && rawValue && !this.isValidAddressFormat(rawValue)) {
            return `<span class="invalid-address" title="Invalid address format. Must be: Word, Word, Word (e.g., Gabawan, Odiongan, Romblon)">${value}</span>`;
        }

        return value;
    }

    // ============================================
    // ADDRESS VALIDATION
    // ============================================
    isValidAddressFormat(address) {
        if (!address || typeof address !== 'string') return false;
        const trimmed = address.trim();
        // Must match exactly: Word, Word, Word (3 parts separated by comma+space)
        // Each part should be a single word (no spaces within)
        const regex = /^[^,\s]+,\s[^,\s]+,\s[^,\s]+$/;
        return regex.test(trimmed);
    }

    // ============================================
    // BIRTHDATE WITH AGE FORMATTING
    // ============================================
    formatBirthdateWithAge(dateInput) {
        if (!dateInput) return '';
        let date;
        if (dateInput instanceof Date) {
            date = dateInput;
        } else if (typeof dateInput === 'string') {
            date = new Date(dateInput);
            if (isNaN(date.getTime())) {
                const parts = dateInput.split(/[/\-]/);
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[0] - 1, parts[1]);
                    if (isNaN(date.getTime())) {
                        date = new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                }
            }
        }
        if (!date || isNaN(date.getTime())) return String(dateInput);
        const monthName = MONTH_NAMES[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        // Calculate age
        const today = new Date();
        let age = today.getFullYear() - year;
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return `${monthName} ${day}, ${year},(${age})`;
    }

    // ============================================
    // MONTH FILTER HELPERS
    // ============================================
    getMonthFromValue(value, colKey) {
        if (!value) return '';
        const str = String(value).trim();
        if (colKey === 'birthdate') {
            const match = str.match(/^([A-Za-z]+)/);
            if (match) return match[1];
            const d = new Date(str);
            if (!isNaN(d.getTime())) return MONTH_NAMES[d.getMonth()];
        }
        if (colKey === 'timestamp') {
            const d = new Date(str);
            if (!isNaN(d.getTime())) return MONTH_NAMES[d.getMonth()];
            const parts = str.split(/[/\-]/);
            if (parts.length >= 2) {
                const monthNum = parseInt(parts[0], 10);
                if (monthNum >= 1 && monthNum <= 12) return MONTH_NAMES[monthNum - 1];
            }
        }
        return '';
    }

    getUniqueMonthValues(records, colKey) {
        const months = new Set();
        records.forEach(r => {
            const val = colKey === 'birthdate' ? r.birthdate : r.timestamp;
            const month = this.getMonthFromValue(val, colKey);
            if (month) months.add(month);
        });
        return [...months].sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b));
    }

    setTableDensity(density) {
        this.settings.tableDensity = density;
        this.saveSettings();
        const root = document.documentElement;
        if (density === 'compact') {
            root.style.setProperty('--density', '0.7');
        } else if (density === 'comfortable') {
            root.style.setProperty('--density', '1.3');
        } else {
            root.style.setProperty('--density', '1');
        }
        this.renderPage();
    }

    toggleFullscreenTable() {
        const doc = document;
        const icon = document.getElementById('fullscreen-icon');
        const btn = icon ? icon.closest('button') : null;
        const isNativeFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        if (!isNativeFullscreen) {
            const app = document.querySelector('.app-container');
            if (app.requestFullscreen) {
                app.requestFullscreen().catch(err => {
                    console.warn('Fullscreen denied:', err);
                    this.enterCssFullscreen();
                });
            } else if (app.webkitRequestFullscreen) {
                app.webkitRequestFullscreen();
            } else if (app.mozRequestFullScreen) {
                app.mozRequestFullScreen();
            } else if (app.msRequestFullscreen) {
                app.msRequestFullscreen();
            } else {
                this.enterCssFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }

    enterCssFullscreen() {
        const app = document.querySelector('.app-container');
        app.classList.add('table-fullscreen');
        const icon = document.getElementById('fullscreen-icon');
        const btn = icon ? icon.closest('button') : null;
        if (icon) icon.className = 'fas fa-compress';
        if (btn) btn.title = 'Exit Fullscreen (Esc)';
        document.body.style.overflow = 'hidden';
        this.showToast('Fullscreen mode active', 'info');
    }

    exitCssFullscreen() {
        const app = document.querySelector('.app-container');
        app.classList.remove('table-fullscreen');
        const icon = document.getElementById('fullscreen-icon');
        const btn = icon ? icon.closest('button') : null;
        if (icon) icon.className = 'fas fa-expand';
        if (btn) btn.title = 'Fullscreen Table (Esc to exit)';
        document.body.style.overflow = '';
    }

    handleFullscreenChange() {
        const doc = document;
        const isFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        if (isFullscreen) {
            const app = document.querySelector('.app-container');
            app.classList.add('table-fullscreen');
            const icon = document.getElementById('fullscreen-icon');
            const btn = icon ? icon.closest('button') : null;
            if (icon) icon.className = 'fas fa-compress';
            if (btn) btn.title = 'Exit Fullscreen (Esc)';
            document.body.style.overflow = 'hidden';
        } else {
            this.exitCssFullscreen();
        }
    }

    exitFullscreenTable() {
        const doc = document;
        const isNativeFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        if (isNativeFullscreen) {
            if (doc.exitFullscreen) doc.exitFullscreen();
            else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
            else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
            else if (doc.msExitFullscreen) doc.msExitFullscreen();
        }
        this.exitCssFullscreen();
    }

    formatCustomDate(dateInput) {
        if (!dateInput) return '';
        let date;
        if (dateInput instanceof Date) {
            date = dateInput;
        } else if (typeof dateInput === 'string') {
            date = new Date(dateInput);
            if (isNaN(date.getTime())) {
                const parts = dateInput.split(/[/\-]/);
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
        }
        if (!date || isNaN(date.getTime())) return String(dateInput);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const monthName = MONTH_NAMES[date.getMonth()];
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${month}/${day}/${year}(${monthName})${hours}:${minutes}${ampm}`;
    }

    extractDateKey(dateInput) {
        if (!dateInput) return '';
        if (dateInput instanceof Date) {
            return (dateInput.getMonth() + 1) + '/' + dateInput.getDate() + '/' + dateInput.getFullYear();
        }
        const str = String(dateInput).trim();
        const usMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (usMatch) return parseInt(usMatch[1], 10) + '/' + parseInt(usMatch[2], 10) + '/' + usMatch[3];
        const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return parseInt(isoMatch[2], 10) + '/' + parseInt(isoMatch[3], 10) + '/' + isoMatch[1];
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        }
        return '';
    }

    extractScheduleDateKey(scheduleStr) {
        if (!scheduleStr) return '';
        const str = String(scheduleStr);
        const m = str.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
        if (m) {
            const names = ['january','february','march','april','may','june',
                           'july','august','september','october','november','december'];
            const idx = names.indexOf(m[1].toLowerCase());
            if (idx >= 0) return (idx + 1) + '/' + m[2] + '/' + m[3];
        }
        const usMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (usMatch) return parseInt(usMatch[1], 10) + '/' + parseInt(usMatch[2], 10) + '/' + usMatch[3];
        return '';
    }

    isScheduleMatch(r, page) {
        if (page !== 'legs-participation') return false;
        const dateOk = this.isDateMatch(r.timestamp, r.schedule);
        const timeOk = this.isTimeInRange(r.timestamp, r.schedule);
        return dateOk && timeOk;
    }

    isDateMatch(timestamp, schedule) {
        const ts = this.extractDateKey(timestamp);
        const sc = this.extractScheduleDateKey(schedule);
        return ts && sc && ts === sc;
    }

    isTimeInRange(timestamp, schedule) {
        if (!timestamp || !schedule) return false;
        const schedMatch = String(schedule).match(
            /(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)\s*-\s*(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)/i
        );
        if (!schedMatch) return false;
        const sH   = parseInt(schedMatch[1], 10);
        const sM   = parseInt(schedMatch[2], 10);
        const sAmpm = schedMatch[3].toLowerCase().replace(/\./g, '');
        const eH   = parseInt(schedMatch[4], 10);
        const eM   = parseInt(schedMatch[5], 10);
        const eAmpm = schedMatch[6].toLowerCase().replace(/\./g, '');
        const schedStart = this.toMinutes(sH, sM, sAmpm);
        const schedEnd   = this.toMinutes(eH, eM, eAmpm);
        const tsMinutes = this.extractTimestampMinutes(timestamp);
        if (tsMinutes === null) return false;
        const graceBefore = 15;
        const graceAfter  = 30;
        return tsMinutes >= (schedStart - graceBefore) && tsMinutes <= (schedEnd + graceAfter);
    }

    extractTimestampMinutes(timestamp) {
        if (!timestamp) return null;
        const tsStr = String(timestamp).trim();
        const match12 = tsStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
        if (match12) {
            return this.toMinutes(parseInt(match12[1], 10), parseInt(match12[2], 10), match12[3].toLowerCase());
        }
        let d = null;
        if (timestamp instanceof Date) {
            d = timestamp;
        } else if (typeof timestamp === 'string' && (timestamp.includes('/') || timestamp.includes('-') || timestamp.includes(','))) {
            d = new Date(timestamp);
        }
        if (d && !isNaN(d.getTime())) {
            return d.getHours() * 60 + d.getMinutes();
        }
        const match24Full = tsStr.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);
        if (match24Full) {
            return parseInt(match24Full[1], 10) * 60 + parseInt(match24Full[2], 10);
        }
        const match24Short = tsStr.match(/\b(\d{1,2}):(\d{2})\b/);
        if (match24Short) {
            const h = parseInt(match24Short[1], 10);
            if (h >= 0 && h <= 23) return h * 60 + parseInt(match24Short[2], 10);
        }
        return null;
    }

    toMinutes(h, m, ampm) {
        let hour = parseInt(h, 10) % 12;
        if (ampm && ampm.charAt(0) === 'p') hour += 12;
        return hour * 60 + parseInt(m, 10);
    }

    formatRow(r, key, page) {
        if (key === 'fullName') return this.getFullName(r);
        if (key === 'address') return this.getAddress(r);
        return r[key];
    }

    getFullName(r) {
        if (r.fullName && typeof r.fullName === 'string' && r.fullName.trim() !== '' && r.fullName !== ',') {
            return r.fullName;
        }
        const last = (r.lastName || r.surname || '').toUpperCase();
        const first = r.firstName || '';
        const middle = r.middleName || '';
        if (middle) return `${last}, ${first} ${middle}`;
        return `${last}, ${first}`;
    }

    getAddress(r) {
        const parts = [r.barangay, r.municipality, r.province].filter(Boolean);
        return parts.join(', ');
    }

    getDuplicateNameKey(r) {
        const name = this.getFullName(r);
        if (!name || typeof name !== 'string') return '';
        return name
            .replace(/\s+N\/A\s*$/i, '')
            .replace(/\s+NA\s*$/i, '')
            .replace(/\s+N\.A\.\s*$/i, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }

    renderSelect(value, options, field, id, onChange) {
        const extraClass = this.getSelectClass(value);
        let html = `<select class="table-input table-select ${extraClass}" onchange="${onChange}('${id}', '${field}', this.value)">`;
        options.forEach(opt => {
            const selected = opt === value ? 'selected' : '';
            html += `<option value="${this.escapeHtml(opt)}" ${selected}>${opt || '—'}</option>`;
        });
        html += `</select>`;
        return html;
    }

    renderBadge(value) {
        if (!value || value === '—') return `<span class="badge badge-gray">—</span>`;
        const color = this.getStatusColor(value);
        return `<span class="badge badge-${color}">${this.escapeHtml(value)}</span>`;
    }

    getSelectClass(value) {
        const color = this.getStatusColor(value);
        return color ? `select-${color}` : '';
    }

    getStatusColor(status) {
        if (!status) return 'gray';
        const key = String(status).toLowerCase().trim();
        return STATUS_COLORS[key] || 'gray';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    highlightSearch(text) {
        if (!this.currentSearch || !text) return this.escapeHtml(text);
        const search = this.currentSearch.toLowerCase();
        const str = String(text);
        const regex = new RegExp(`(${this.escapeRegex(search)})`, 'gi');
        const parts = str.split(regex);
        return parts.map((part, i) => {
            if (i % 2 === 1) return `<mark class="search-highlight">${this.escapeHtml(part)}</mark>`;
            return this.escapeHtml(part);
        }).join('');
    }

    isColumnVisible(page, key) {
        const pageSettings = this.settings.visibleColumns[page];
        if (!pageSettings) return true;
        return pageSettings[key] !== false;
    }

    toggleColumn(page, key, visible) {
        if (!this.settings.visibleColumns[page]) this.settings.visibleColumns[page] = {};
        this.settings.visibleColumns[page][key] = visible;
        this.saveSettings();
        this.renderPage();
    }

    toggleColumnMenu(event) {
        event.stopPropagation();
        const menu = document.getElementById(`column-menu-${this.currentPage}`);
        const isOpen = menu.classList.contains('open');
        document.querySelectorAll('.column-toggle-menu').forEach(m => m.classList.remove('open'));
        if (!isOpen) menu.classList.add('open');
    }

    renderFreshnessBadge(page) {
        const last = this.lastFetch[page];
        if (!last) return `<span class="freshness-badge never"><i class="fas fa-clock"></i> Never updated</span>`;
        const diff = Date.now() - last;
        const stale = diff > CONFIG.STALE_THRESHOLD_MS;
        const text = this.getFreshnessText(diff);
        return `<span class="freshness-badge ${stale ? 'stale' : 'fresh'}"><i class="fas fa-clock"></i> ${text}</span>`;
    }

    getFreshnessText(diffMs) {
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    renderActiveFilterChips(page) {
        const pageFilters = this.columnFilters[page];
        if (!pageFilters || Object.keys(pageFilters).length === 0) return '';
        const mod = MODULES[page];
        let chipsHtml = '';
        Object.keys(pageFilters).forEach(colKey => {
            const allowedValues = pageFilters[colKey];
            if (!allowedValues || allowedValues.length === 0) return;
            const col = mod.columns.find(c => c.key === colKey);
            if (!col) return;
            let chipLabel = '';
            if (allowedValues.length === 1) {
                chipLabel = `${col.label} : ${allowedValues[0]}`;
            } else {
                chipLabel = `${col.label} : Multiple Values`;
            }
            chipsHtml += `
                <span class="filter-chip" onclick="app.openHeaderFilterDropdown(event, '${page}', '${col.key}')">
                    ${this.escapeHtml(chipLabel)}
                    <i class="fas fa-times chip-remove" onclick="event.stopPropagation(); app.clearColumnFilter('${page}', '${col.key}')"></i>
                </span>
            `;
        });
        if (!chipsHtml) return '';
        return `
            <div class="active-filters-bar">
                <span class="filters-label"><i class="fas fa-filter"></i> Filters</span>
                ${chipsHtml}
                <button class="clear-all-btn" onclick="app.clearAllFilters('${page}')">Clear All</button>
            </div>
        `;
    }

    clearAllFilters(page) {
        this.stopSpeaking();
        if (this.columnFilters[page]) {
            delete this.columnFilters[page];
        }
        this.saveColumnFilters();
        this.pagination.page = 1;
        this.renderPage();
        this.showToast('All filters cleared', 'info');
    }

    openHeaderFilterDropdown(event, page, colKey) {
        event.stopPropagation();
        document.querySelectorAll('.header-filter-dropdown').forEach(d => d.remove());
        const mod = MODULES[page];
        const col = mod.columns.find(c => c.key === colKey);
        if (!col || !col.filterable) return;
        const records = this.data[mod.dataKey] || [];

        // For month-based filters (birthdate, timestamp), show month names
        let uniqueValues;
        if (col.filterType === 'month') {
            uniqueValues = this.getUniqueMonthValues(records, colKey);
        } else {
            uniqueValues = [...new Set(records.map(r => {
                const val = col.computed ? this.formatRow(r, col.key, page) : r[col.key];
                return String(val || '').trim();
            }).filter(v => v))].sort();
        }

        const activeFilters = (this.columnFilters[page] && this.columnFilters[page][colKey]) || [];
        let optionsHtml = '';
        uniqueValues.forEach(val => {
            const checked = activeFilters.includes(val) ? 'checked' : '';
            optionsHtml += `
                <label class="filter-dropdown-option">
                    <input type="checkbox" ${checked} onchange="app.toggleFilterValue('${page}', '${colKey}', '${this.escapeHtml(val)}', this.checked)">
                    <span>${this.escapeHtml(val)}</span>
                </label>
            `;
        });
        const dropdownHtml = `
            <div class="header-filter-dropdown" id="header-filter-dd-${page}-${colKey}">
                <div class="header-filter-dropdown-header">
                    <span><i class="fas fa-filter"></i> ${col.label}</span>
                    <button class="btn-clear" onclick="event.stopPropagation(); app.clearColumnFilter('${page}', '${colKey}')">Clear</button>
                </div>
                <div class="header-filter-dropdown-body">
                    ${optionsHtml}
                </div>
                <div class="header-filter-dropdown-footer">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); document.querySelectorAll('.header-filter-dropdown').forEach(d => d.remove())">Close</button>
                </div>
            </div>
        `;
        const target = event.target.closest('.header-filter-icon') || event.target.closest('.filter-chip');
        if (target) {
            const rect = target.getBoundingClientRect();
            const container = document.createElement('div');
            container.innerHTML = dropdownHtml;
            const dropdown = container.firstElementChild;
            dropdown.style.position = 'fixed';
            dropdown.style.top = (rect.bottom + 4) + 'px';
            dropdown.style.left = rect.left + 'px';
            dropdown.style.minWidth = '220px';
            dropdown.style.maxHeight = '320px';
            dropdown.style.zIndex = '10000';
            document.body.appendChild(dropdown);
            const ddRect = dropdown.getBoundingClientRect();
            if (ddRect.right > window.innerWidth) {
                dropdown.style.left = (window.innerWidth - ddRect.width - 10) + 'px';
            }
            if (ddRect.bottom > window.innerHeight) {
                dropdown.style.top = (rect.top - ddRect.height - 4) + 'px';
            }
            const closeHandler = (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            setTimeout(() => document.addEventListener('click', closeHandler), 0);
        }
    }

    toggleFilterValue(page, colKey, value, checked) {
        this.stopSpeaking();
        if (!this.columnFilters[page]) this.columnFilters[page] = {};
        if (!this.columnFilters[page][colKey]) this.columnFilters[page][colKey] = [];
        const arr = this.columnFilters[page][colKey];
        const idx = arr.indexOf(value);
        if (checked && idx === -1) arr.push(value);
        if (!checked && idx > -1) arr.splice(idx, 1);
        if (arr.length === 0) delete this.columnFilters[page][colKey];
        this.saveColumnFilters();
        this.pagination.page = 1;
        this.renderPage();
    }

    clearColumnFilter(page, colKey) {
        this.stopSpeaking();
        if (this.columnFilters[page]) delete this.columnFilters[page][colKey];
        this.saveColumnFilters();
        this.pagination.page = 1;
        this.renderPage();
    }

    filterRecords(records, page) {
        let filtered = [...records];
        if (this.currentFilter !== 'all') {
            if (page === 'legs-participation' && this.currentFilter === 'green checks') {
                filtered = filtered.filter(r => this.isScheduleMatch(r, page));
            } else {
                filtered = filtered.filter(r => (r.status || '').toLowerCase() === this.currentFilter);
            }
        }
        const pageFilters = this.columnFilters[page];
        if (pageFilters) {
            Object.keys(pageFilters).forEach(colKey => {
                const allowedValues = pageFilters[colKey];
                if (allowedValues && allowedValues.length > 0) {
                    const col = MODULES[page].columns.find(c => c.key === colKey);
                    filtered = filtered.filter(r => {
                        let val;
                        if (col.filterType === 'month') {
                            // For month filters, extract month from the raw value
                            const rawVal = col.computed ? this.formatRow(r, colKey, page) : r[colKey];
                            val = this.getMonthFromValue(rawVal, colKey);
                        } else {
                            val = col.computed ? this.formatRow(r, colKey, page) : r[colKey];
                            val = String(val || '').trim();
                        }
                        return allowedValues.includes(val);
                    });
                }
            });
        }
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            const mod = MODULES[page];
            filtered = filtered.filter(r => {
                return mod.columns.some(col => {
                    let val = col.computed ? this.formatRow(r, col.key, page) : r[col.key];
                    if (col.format === 'birthdateWithAge' && val) {
                        val = this.formatBirthdateWithAge(val);
                    }
                    return String(val).toLowerCase().includes(search);
                });
            });
        }
        return filtered;
    }

    sortRecords(records, page) {
        // Always sort by fullName ascending first, then by current sort column
        return records.sort((a, b) => {
            // Primary sort: fullName alphabetically
            const nameA = (a.fullName || this.getFullName(a)).toLowerCase();
            const nameB = (b.fullName || this.getFullName(b)).toLowerCase();
            const nameCompare = nameA.localeCompare(nameB);
            if (nameCompare !== 0) return nameCompare;

            // Secondary sort: by currentSort column if different from fullName
            if (this.currentSort.column && this.currentSort.column !== 'fullName') {
                const col = MODULES[page].columns.find(c => c.key === this.currentSort.column);
                if (col) {
                    let valA = col.computed ? this.formatRow(a, col.key, page) : a[col.key];
                    let valB = col.computed ? this.formatRow(b, col.key, page) : b[col.key];
                    valA = String(valA || '').toLowerCase();
                    valB = String(valB || '').toLowerCase();
                    if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    getPaginatedRecords(records) {
        const perPage = this.settings.rowsPerPage;
        const total = records.length;
        const start = (this.pagination.page - 1) * perPage;
        const end = start + perPage;
        return { records: records.slice(start, end), total, start: start + 1, end: Math.min(end, total) };
    }

    calculateStats(records, page) {
        const stats = { total: records.length };
        if (page === 'legs-evaluation') {
            stats.complete = records.filter(r => r.status === 'Complete').length;
            stats.incomplete = records.filter(r => r.status === 'Incomplete').length;
        }
        return stats;
    }

    updateLegsField(id, field, value) {
        const record = this.data.legsEvaluation.find(r => r.id === id);
        if (!record) return;
        record[field] = value;
        record.status = this.computeLegsStatus(record);
        this.renderPage();
        this.showToast(`Updated ${this.getFullName(record)}`);
    }

    computeLegsStatus(r) {
        const req = [r.webinar, r.date, r.evaluation];
        const hasAll = req.every(v => v && String(v).trim() !== '' && !['no record', 'missing', 'please verify your record at cares office'].includes(String(v).toLowerCase()));
        return hasAll ? 'Complete' : 'Incomplete';
    }

    exportCurrentModule() {
        const page = this.currentPage;
        const mod = MODULES[page];
        const records = this.data[mod.dataKey] || [];
        let filtered = this.filterRecords(records, page);
        filtered = this.sortRecords(filtered, page);
        const visibleColumns = mod.columns.filter(c => this.isColumnVisible(page, c.key));
        const exportData = filtered.map(r => {
            const obj = {};
            visibleColumns.forEach(col => {
                let val = col.computed ? this.formatRow(r, col.key, page) : r[col.key];
                if (col.format === 'customDate' && val) val = this.formatCustomDate(val);
                if (col.format === 'birthdateWithAge' && val) val = this.formatBirthdateWithAge(val);
                obj[col.label] = val;
            });
            return obj;
        });
        if (!exportData.length) {
            this.showToast('No data to export', 'error');
            return;
        }
        const headers = Object.keys(exportData[0]);
        const csv = [headers.join(',')];
        exportData.forEach(row => {
            csv.push(headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','));
        });
        const blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${page}-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast('CSV exported successfully');
    }

    setFilter(filter) {
        this.stopSpeaking();
        this.currentFilter = filter;
        this.pagination.page = 1;
        this.renderPage();
    }

    sortBy(column) {
        this.stopSpeaking();
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        this.renderPage();
    }

    changePage(page) {
        this.stopSpeaking();
        this.pagination.page = page;
        this.renderPage();
        window.scrollTo(0, 0);
    }

    handleSearch(value) {
        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) clearBtn.classList.toggle('visible', !!value);
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => {
            this.stopSpeaking();
            this.currentSearch = (value || '').trim();
            this.pagination.page = 1;
            this.renderPage();
        }, CONFIG.DEBOUNCE_MS);
    }

    triggerSearch() {
        this.stopSpeaking();
        const input = document.getElementById('global-search');
        if (!input) return;
        const value = input.value.trim();
        this.currentSearch = value;
        this.pagination.page = 1;
        this.renderPage();
        const mod = MODULES[this.currentPage];
        const records = this.data[mod.dataKey] || [];
        const filtered = this.filterRecords(records, this.currentPage);
        if (value) {
            this.showToast(`${filtered.length} match(es) for "${value}"`, 'info');
        } else {
            this.showToast(`Showing all ${records.length} records`, 'info');
        }
    }

    clearSearch() {
        const input = document.getElementById('global-search');
        const btn = document.getElementById('search-clear-btn');
        if (input) input.value = '';
        if (btn) btn.classList.remove('visible');
        this.currentSearch = '';
        this.pagination.page = 1;
        this.renderPage();
        if (input) input.focus();
    }

    toggleDarkMode(enabled, skipSave) {
        if (typeof enabled === 'undefined') enabled = !this.settings.darkMode;
        this.settings.darkMode = enabled;
        document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = enabled ? 'fas fa-sun' : 'fas fa-moon';
        if (!skipSave) {
            localStorage.setItem('dashboard_dark_mode', enabled ? '1' : '0');
            this.showToast(enabled ? 'Dark mode enabled' : 'Light mode enabled');
        }
    }

    openSettingsModal() {
        const container = document.getElementById('endpoint-inputs');
        const configEp = localStorage.getItem('dashboard_config_endpoint') || '';
        let html = `
            <div class="form-group">
                <label><i class="fas fa-globe"></i> Global Config Endpoint (optional)</label>
                <input type="url" class="form-input" id="ep-config" placeholder="https://script.google.com/..." value="${this.escapeHtml(configEp)}">
                <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">If set, endpoints are saved globally and shared across devices.</p>
            </div>
            <hr style="border:0;border-top:1px solid var(--border-light);margin:1rem 0;">
        `;
        Object.values(MODULES).forEach(mod => {
            const current = this.endpoints[mod.endpointKey] || '';
            html += `
                <div class="form-group">
                    <label>${mod.title}</label>
                    <input type="url" class="form-input" id="ep-${mod.endpointKey}" placeholder="https://script.google.com/..." value="${this.escapeHtml(current)}">
                </div>
            `;
        });
        container.innerHTML = html;
        this.openModal('settings-modal');
    }

    async saveEndpoints() {
        const configInput = document.getElementById('ep-config');
        if (configInput) {
            const configVal = configInput.value.trim();
            if (configVal) localStorage.setItem('dashboard_config_endpoint', configVal);
            else if (!CONFIG.DEFAULT_CONFIG_URL) localStorage.removeItem('dashboard_config_endpoint');
        }
        Object.values(MODULES).forEach(mod => {
            const val = document.getElementById(`ep-${mod.endpointKey}`).value.trim();
            if (val) this.endpoints[mod.endpointKey] = val;
            else delete this.endpoints[mod.endpointKey];
        });
        this.saveEndpointsToStorage();
        this.closeModal('settings-modal');
        this.showToast('Data sources saved');
        this.fetchAllDataOnInit();
    }

    openModal(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.style.overflow = '';
    }

    showLoading(show) {
        const el = document.getElementById('loading-overlay');
        const bar = document.getElementById('loading-bar');
        if (show) {
            el.classList.remove('hidden');
            if (bar) { bar.style.width = '30%'; setTimeout(() => bar.style.width = '70%', 200); }
        } else {
            if (bar) bar.style.width = '100%';
            setTimeout(() => el.classList.add('hidden'), 300);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-circle-xmark';
        if (type === 'warning') icon = 'fa-triangle-exclamation';
        if (type === 'info') icon = 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${this.escapeHtml(message)}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('hidden');
    }

    updateLastUpdated() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('last-updated').textContent = `Updated ${timeStr}`;
    }

    initSearchClear() {
        const input = document.getElementById('global-search');
        const btn = document.getElementById('search-clear-btn');
        if (input && this.currentSearch) {
            input.value = this.currentSearch;
        }
        if (input && btn && input.value) btn.classList.add('visible');
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ['settings-modal', 'shortcuts-modal', 'duplicate-modal'].forEach(id => this.closeModal(id));
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('mobile-overlay').classList.add('hidden');
                document.querySelectorAll('.column-toggle-menu, .filter-dropdown').forEach(m => m.classList.remove('open'));
                this.exitFullscreenTable();
            }
            if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.openModal('shortcuts-modal');
            }
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('global-search').focus();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.fetchModuleData(this.currentPage);
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDuplicateHighlight();
            }
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                const densities = ['compact', 'normal', 'comfortable'];
                const currentIdx = densities.indexOf(this.settings.tableDensity);
                const nextIdx = (currentIdx + 1) % densities.length;
                this.setTableDensity(densities[nextIdx]);
            }
            if (e.key === 'ArrowLeft' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                if (this.pagination.page > 1) this.changePage(this.pagination.page - 1);
            }
            if (e.key === 'ArrowRight' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                this.changePage(this.pagination.page + 1);
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.column-toggle') && !e.target.closest('.column-filter-item')) {
                document.querySelectorAll('.column-toggle-menu, .filter-dropdown').forEach(m => m.classList.remove('open'));
            }
        });

        const searchInput = document.getElementById('global-search');
        const searchClear = document.getElementById('search-clear-btn');
        if (searchInput && searchClear) {
            searchInput.addEventListener('input', () => {
                if (searchInput.value) {
                    searchClear.classList.add('visible');
                } else {
                    searchClear.classList.remove('visible');
                }
            });
        }

        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
}

const app = new DashboardApp();
