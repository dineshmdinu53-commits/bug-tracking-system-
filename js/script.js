/* =============================================
   Tailwind Config
   ============================================= */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ec4899",
                "primary-start": "#ec4899",
                "primary-end": "#f97316",
                "secondary": "#f97316",
                "accent": "#f97316",
                "accent-orange": "#f97316",
                "background-dark": "#0f172a",
                "card-dark": "#1e293b",
                "surface-dark": "#1e293b",
                "border-dark": "#334155",
                "glossy-border": "rgba(255, 255, 255, 0.1)",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                'card-gloss': 'linear-gradient(145deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)',
                'glossy': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                'bug-red': 'linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)',
                'bug-orange': 'linear-gradient(135deg, #f97316 0%, #9a3412 100%)',
                'bug-green': 'linear-gradient(135deg, #22c55e 0%, #14532d 100%)',
            },
            borderRadius: {
                "DEFAULT": "0.375rem",
                "lg": "0.5rem",
                "xl": "1rem",
                "2xl": "1.5rem",
                "full": "9999px"
            },
        },
    },
};

/* =============================================
   API Helper
   ============================================= */
const API_BASE = 'php';

async function apiGet(endpoint) {
    try {
        const fullEndpoint = `${API_BASE}/${endpoint}`;
        const separator = fullEndpoint.includes('?') ? '&' : '?';
        const urlWithCacheBust = `${fullEndpoint}${separator}_t=${Date.now()}`;
        const res = await fetch(urlWithCacheBust, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('API GET error:', err);
        throw err;
    }
}

async function apiPost(endpoint, data) {
    try {
        const isFormData = data instanceof FormData;
        const res = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            body: isFormData ? data : new URLSearchParams(data),
            credentials: 'include'
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            let message = 'Request failed';
            try {
                const parsed = JSON.parse(errText);
                message = parsed.message || parsed.status || message;
            } catch {
                if (errText.trim()) {
                    message = errText;
                }
            }
            throw new Error(message);
        }
        return await res.json();
    } catch (err) {
        console.error('API POST error:', err);
        throw err;
    }
}

function getCurrentUser() {
    return localStorage.getItem('bugTrackerUser') || 'Anonymous';
}

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function getStatusColor(status) {
    const colors = {
        'Open': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
        'In Progress': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' },
        'Review': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' },
        'Resolved': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' },
        'Closed': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-500' }
    };
    return colors[status] || colors['Open'];
}

function getPriorityColor(priority) {
    const colors = {
        'Critical': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
        'High': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
        'Medium': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
        'Low': { bg: 'bg-slate-700/50', text: 'text-slate-400', border: 'border-slate-600/30' }
    };
    return colors[priority] || colors['Medium'];
}

/* =============================================
   Toast Notification
   ============================================= */
function showToast(message, type = 'success') {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = `fixed top-6 right-6 z-[100] ${colors[type] || colors.info} text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-pulse`;
    toast.innerHTML = `<span class="material-symbols-outlined text-lg">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

let currentUser = null;

/* =============================================
   Authentication & RBAC
   ============================================= */
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/auth_status.php`, { credentials: 'include' });
        const data = await res.json();
        const pageId = document.body.id;

        if (data.loggedIn) {
            currentUser = data.user;
            localStorage.setItem('bugTrackerUser', currentUser.name);
            const role = currentUser.role;

            if (pageId === 'page-login' || pageId === 'page-register') {
                if (role === 'Admin') window.location.replace('dashboard.html');
                else if (role === 'Developer') window.location.replace('bug-list.html');
                else if (role === 'Reporter') window.location.replace('create-bug.html');
                else window.location.replace('dashboard.html');
                return false;
            }

            // Strict Role-Based Access Control Page Blocking
            const renderAccessDenied = (message) => {
                document.body.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background:#0f172a; color:#f87171; font-family:sans-serif;">
                    <h1 style="font-size:32px; font-weight:bold; margin-bottom:10px;">Access Denied</h1>
                    <p style="color:#94a3b8;">${message}</p>
                    <a href="index.html" onclick="localStorage.clear();" style="margin-top:20px; color:#ec4899; text-decoration:none;">Return to Login</a>
                </div>`;
            };

            if (pageId === 'page-assign-bug' && role !== 'Admin') {
                renderAccessDenied('Assign Bug pages are only accessible by Admins.');
                return false;
            }
            if (false) {
                renderAccessDenied('Update Status pages are only accessible by Developers.');
                return false;
            }
            if (pageId === 'page-create-bug' && role !== 'Reporter') {
                renderAccessDenied('Create Bug pages are only accessible by Reporters.');
                return false;
            }

            // Display welcome message
            const navBar = document.querySelector('nav .flex.items-center.gap-4');
            if (navBar && !document.getElementById('welcome-msg')) {
                const welcome = document.createElement('div');
                welcome.id = 'welcome-msg';
                welcome.className = 'text-sm text-slate-300 mr-2 hidden sm:block';
                welcome.innerHTML = `Welcome, <span class="font-bold text-white">${currentUser.name}</span> (${role})`;
                navBar.insertBefore(welcome, navBar.firstChild);
            }

            applyRBACUI();
            return true;
        } else {
            // Not logged in — only login and register pages are public
            if (pageId !== 'page-login' && pageId !== 'page-register') {
                window.location.replace('index.html');
                return false;
            }
        }
    } catch (err) {
        console.error('Auth check failed', err);
        const pid = document.body.id;
        if (pid !== 'page-login' && pid !== 'page-register') {
            window.location.replace('index.html');
        }
    }
}

function applyRBACUI() {
    if (!currentUser) return;
    const role = currentUser.role;

    // RBAC: Hide "Assign Bug" if not Admin. 
    // Wait, there's no assign button natively on dashboard, it is usually linked from bug list or report.
    // For now we just store the currentUser global and let pages handle it, or we hide specifically.
    const createLinks = document.querySelectorAll('a[href="create-bug.html"]');
    const updateStatusLinks = document.querySelectorAll('a[href^="update_status.html"]');
    const assignLinks = document.querySelectorAll('a[href^="assign_bug.html"], a[href^="assign-bug.html"]');

    if (role !== 'Reporter' && role !== 'Admin') {
        createLinks.forEach(el => el.style.display = 'none');
    }
    if (role !== 'Admin') {
        assignLinks.forEach(el => el.style.display = 'none');
    }
    if (role !== 'Developer') {
        const commentForm = document.getElementById('comment-form');
        if (commentForm) commentForm.style.display = 'none';
    }

    if (role !== 'Developer' && role !== 'Admin') {
        const aiFixBtn = document.getElementById('ai-fix-btn');
        if (aiFixBtn) aiFixBtn.style.display = 'none';
    }

    const dashboardReportBtn = document.getElementById('dashboard-report-bug-btn');
    if (dashboardReportBtn) {
        if (role === 'Reporter') {
            dashboardReportBtn.classList.remove('hidden');
            dashboardReportBtn.classList.add('flex');
            dashboardReportBtn.style.display = 'flex';
        } else {
            dashboardReportBtn.classList.add('hidden');
            dashboardReportBtn.classList.remove('flex');
            dashboardReportBtn.style.display = 'none';
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Immediately check auth
    const authValid = await checkAuth();
    if (authValid === false) return;

    const pageId = document.body.id;

    // Setup logout link
    document.querySelectorAll('a[href="login.html"], a[href="index.html"]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch(`${API_BASE}/logout.php`, { credentials: 'include' });
            localStorage.removeItem('bugTrackerUser');
            window.location.href = 'index.html';
        });
    });

    switch (pageId) {
        case 'page-login':
            initLoginPage();
            break;
        case 'page-register':
            initRegisterPage();
            break;
        case 'page-dashboard':
            initDashboardPage();
            break;
        case 'page-create-bug':
            initCreateBugPage();
            break;
        case 'page-bug-list':
            initBugListPage();
            break;
        case 'page-bug-report':
            initBugReportPage();
            break;
    }
});

/* =============================================
   LOGIN PAGE
   ============================================= */
function initLoginPage() {
    // --- Password eye toggle ---
    const toggleBtn = document.getElementById('login-toggle-password');
    const passwordIn = document.getElementById('password');
    const eyeIcon = document.getElementById('login-eye-icon');
    if (toggleBtn && passwordIn && eyeIcon) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = passwordIn.type === 'password';
            passwordIn.type = isHidden ? 'text' : 'password';
            eyeIcon.textContent = isHidden ? 'visibility_off' : 'visibility';
        });
    }

    // --- Login form submit ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password')?.value || '';

            if (!email || !password) {
                showToast('Please enter both email and password', 'error');
                return;
            }

            const btn = loginForm.querySelector('button[type="submit"]');
            const origText = btn.innerHTML;
            btn.innerHTML = 'Signing in...';
            btn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);

                const data = await apiPost('login.php', formData);
                if (data.status === 'success') {
                    showToast('Login successful!', 'success');
                    const role = data.user.role;
                    if (role === 'Admin') window.location.href = 'dashboard.html';
                    else if (role === 'Developer') window.location.href = 'bug-list.html';
                    else if (role === 'Reporter') window.location.href = 'create-bug.html';
                    else window.location.href = 'dashboard.html';
                } else {
                    showToast(data.message || 'Login failed', 'error');
                }
            } catch (err) {
                showToast(err.message || 'Invalid credentials', 'error');
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }
}

/* =============================================
   REGISTER PAGE
   ============================================= */
function initRegisterPage() {
    // --- Password eye toggle (password field) ---
    function setupEyeToggle(btnId, inputId, iconId) {
        const btn = document.getElementById(btnId);
        const inp = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (btn && inp && icon) {
            btn.addEventListener('click', () => {
                const hidden = inp.type === 'password';
                inp.type = hidden ? 'text' : 'password';
                icon.textContent = hidden ? 'visibility_off' : 'visibility';
            });
        }
    }
    setupEyeToggle('reg-toggle-password', 'reg-password', 'reg-eye-icon');
    setupEyeToggle('reg-toggle-confirm', 'reg-confirm', 'reg-confirm-eye-icon');

    // --- Register form submit ---
    const registerForm = document.getElementById('registerForm');
    const errorBox = document.getElementById('register-error');
    const errorText = document.getElementById('register-error-text');

    function showFormError(msg) {
        if (errorBox && errorText) {
            errorText.textContent = msg;
            errorBox.classList.remove('hidden');
            errorBox.classList.add('flex');
        } else {
            showToast(msg, 'error');
        }
    }
    function hideFormError() {
        if (errorBox) {
            errorBox.classList.add('hidden');
            errorBox.classList.remove('flex');
        }
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideFormError();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            const role = document.getElementById('reg-role').value;

            // Client-side validation
            if (!name || !email || !password || !confirm) {
                showFormError('Please fill in all fields.');
                return;
            }
            if (password.length < 6) {
                showFormError('Password must be at least 6 characters.');
                return;
            }
            if (password !== confirm) {
                showFormError('Passwords do not match.');
                return;
            }

            const btn = document.getElementById('register-btn');
            const origText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin mr-1">progress_activity</span> Creating account...';
            btn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('role', role);

                const data = await apiPost('register.php', formData);

                if (data.status === 'success') {
                    showToast('Account created! Redirecting to login...', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1800);
                } else {
                    showFormError(data.message || 'Registration failed. Please try again.');
                }
            } catch (err) {
                // Provide a friendly error; never show raw "Failed to fetch"
                const msg = (err.message && !err.message.includes('fetch'))
                    ? err.message
                    : 'Could not connect to server. Make sure XAMPP is running.';
                showFormError(msg);
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }
}

/* =============================================
   DASHBOARD PAGE
   ============================================= */
async function initDashboardPage() {
    try {
        // Fetch stats and recent bugs in parallel
        const [stats, recentBugs] = await Promise.all([
            apiGet('dashboard.php?action=stats'),
            apiGet('dashboard.php?action=recent')
        ]);

        // Update stat cards
        const statCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
        if (statCards.length >= 4) {
            // Open Bugs
            const openCount = statCards[0].querySelector('h2');
            if (openCount) openCount.textContent = stats.open || 0;
            const openBar = statCards[0].querySelector('.bg-white.h-full');
            if (openBar) {
                const openPct = stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0;
                openBar.style.width = openPct + '%';
            }

            // In Progress
            const progressCount = statCards[1].querySelector('h2');
            if (progressCount) progressCount.textContent = stats.inProgress || 0;
            const progressBar = statCards[1].querySelector('.bg-white.h-full');
            if (progressBar) {
                const progressPct = stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0;
                progressBar.style.width = progressPct + '%';
            }

            // Resolved
            const resolvedCount = statCards[2].querySelector('h2');
            if (resolvedCount) resolvedCount.textContent = stats.resolved || 0;
            const resolvedBar = statCards[2].querySelector('.bg-white.h-full');
            if (resolvedBar) {
                const resolvedPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                resolvedBar.style.width = resolvedPct + '%';
            }

            // Critical
            const criticalCount = statCards[3].querySelector('h2');
            if (criticalCount) criticalCount.textContent = stats.critical || 0;
            const criticalBar = statCards[3].querySelector('.bg-red-500.h-full');
            if (criticalBar) {
                const criticalPct = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;
                criticalBar.style.width = criticalPct + '%';
            }
        }

        // Populate recent bugs table
        const tbody = document.getElementById('dashboard-bug-tbody');
        if (tbody && recentBugs) {
            tbody.innerHTML = '';
            if (recentBugs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">No bugs found. <a href="create-bug.html" class="text-primary font-bold hover:underline">Create one!</a></td></tr>`;
            } else {
                recentBugs.forEach(bug => {
                    const sc = getStatusColor(bug.status);
                    const pc = getPriorityColor(bug.priority);
                    const assigneeName = bug.assignee_name || 'Unassigned';
                    tbody.innerHTML += `
                        <tr class="border-b border-slate-800/30 group cursor-pointer hover:bg-white/5 transition-all" onclick="window.location.href='bug-report.html?id=${bug.id}'">
                            <td class="py-4 text-slate-500">${bug.bug_id}</td>
                            <td class="py-4 font-medium text-slate-200">${bug.title}</td>
                            <td class="py-4">
                                <span class="px-2.5 py-1 rounded ${sc.bg} ${sc.text} text-[10px] font-bold uppercase border ${sc.border}">${bug.status}</span>
                            </td>
                            <td class="py-4">
                                <span class="px-2.5 py-1 rounded ${pc.bg} ${pc.text} text-[10px] font-bold uppercase border ${pc.border}">${bug.priority}</span>
                            </td>
                            <td class="py-4 flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-300">${getInitials(assigneeName)}</div>
                                <span class="text-slate-300">${assigneeName}</span>
                            </td>
                        </tr>`;
                });
            }
        }

        // Update trends chart
        const trends = await apiGet('dashboard.php?action=trends');
        updateTrendsChart(trends);

        // Update top issues
        updateTopIssues(recentBugs);

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

function updateTrendsChart(trends) {
    const chartBars = document.querySelectorAll('.h-32.flex.items-end > div');
    if (!chartBars || chartBars.length < 4) return;

    const maxVal = Math.max(trends.critical || 1, trends.high || 1, trends.medium || 1, trends.low || 1, 1);
    const values = [trends.critical || 0, trends.high || 0, trends.medium || 0, trends.low || 0];

    chartBars.forEach((bar, i) => {
        const pct = Math.max(10, Math.round((values[i] / maxVal) * 100));
        bar.style.height = pct + '%';
        const inner = bar.querySelector('div:first-child');
        if (inner) inner.style.height = '100%';
    });
}

function updateTopIssues(bugs) {
    const list = document.querySelector('#page-dashboard .space-y-8 ul');
    if (!list || !bugs) return;
    list.innerHTML = '';
    const topBugs = bugs.filter(b => b.status !== 'Resolved' && b.status !== 'Closed').slice(0, 3);
    if (topBugs.length === 0) {
        list.innerHTML = '<li class="text-slate-500 text-sm">No open issues!</li>';
        return;
    }
    topBugs.forEach(bug => {
        list.innerHTML += `
            <li class="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer group" onclick="window.location.href='bug-report.html?id=${bug.id}'">
                <div class="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                <span class="text-sm">${bug.title}</span>
            </li>`;
    });
}

/* =============================================
   CREATE BUG PAGE
   ============================================= */
async function initCreateBugPage() {
    // Load users for assignee dropdown
    try {
        const users = await apiGet('users.php?role=Developer');
        const select = document.getElementById('bug-assignee');
        if (select && users) {
            select.innerHTML = '<option value="">Select Developer</option>';
            users.forEach(u => {
                select.innerHTML += `<option value="${u.id}">${u.name} (${u.role})</option>`;
            });
        }
    } catch (err) {
        console.error('Failed to load users:', err);
    }

    const form = document.getElementById('create-bug-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('bug-title').value.trim());
            formData.append('description', document.getElementById('bug-description').value.trim());
            formData.append('priority', document.getElementById('bug-priority').value);
            formData.append('assignee_id', document.getElementById('bug-assignee').value);
            formData.append('reporter_name', localStorage.getItem('bugTrackerUser') || 'Anonymous');

            const codeInput = document.getElementById('bug-code');
            if (codeInput && codeInput.value.trim()) {
                formData.append('code_snippet', codeInput.value.trim());
            }

            const screenshotInput = document.getElementById('bug-screenshot');
            if (screenshotInput && screenshotInput.files[0]) {
                formData.append('screenshot', screenshotInput.files[0]);
            }

            try {
                const result = await apiPost('bugs.php?action=create', formData);
                showToast('Bug created successfully!', 'success');
                setTimeout(() => window.location.href = 'bug-list.html', 1000);
            } catch (err) {
                showToast(err.message || 'Failed to create bug', 'error');
            }
        });
    }

    // Screenshot preview
    const screenshotInput = document.getElementById('bug-screenshot');
    if (screenshotInput) {
        screenshotInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const label = screenshotInput.closest('.relative')?.querySelector('span:last-of-type');
            if (file && label) {
                label.textContent = file.name;
            }
        });
    }
}

/* =============================================
   BUG LIST PAGE
   ============================================= */
let bugListState = {
    page: 1,
    limit: 10,
    status: '',
    priority: '',
    search: '',
    tab: ''
};

async function initBugListPage() {
    // Search input
    const searchInput = document.getElementById('bug-search');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                bugListState.search = e.target.value.trim();
                bugListState.page = 1;
                loadBugList();
            }, 400);
        });
    }

    // Tab navigation
    const tabs = document.querySelectorAll('#bug-tabs a');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => {
                t.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 text-sm font-semibold transition-colors';
            });
            e.currentTarget.className = 'border-b-2 border-primary text-primary pb-3 text-sm font-bold flex items-center gap-2';
            bugListState.tab = e.currentTarget.dataset.tab || '';
            bugListState.page = 1;
            loadBugList();
        });
    });

    // Filter dropdowns
    setupFilterDropdown('filter-status', 'status', ['All', 'Open', 'In Progress', 'Review', 'Resolved', 'Closed']);
    setupFilterDropdown('filter-priority', 'priority', ['All', 'Low', 'Medium', 'High', 'Critical']);

    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            bugListState.page = 1;
            bugListState.status = '';
            bugListState.priority = '';
            bugListState.search = '';
            bugListState.tab = ''; // Clear tab

            // Reset tab UI
            const tabs = document.querySelectorAll('#bug-tabs a');
            tabs.forEach(t => {
                t.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 text-sm font-semibold transition-colors';
            });
            const allBugsTab = document.querySelector('#bug-tabs a[data-tab=""]');
            if (allBugsTab) {
                allBugsTab.className = 'border-b-2 border-primary text-primary pb-3 text-sm font-bold flex items-center gap-2';
            }
            if (searchInput) searchInput.value = '';
            document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());
            document.querySelectorAll('[id^="filter-"] .filter-value').forEach(v => v.textContent = 'All');
            loadBugList();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        showToast(error, 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Initial load
    await loadBugList();
}

function setupFilterDropdown(buttonId, stateKey, options) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove existing dropdowns
        document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());

        const dropdown = document.createElement('div');
        dropdown.className = 'filter-dropdown absolute mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 py-2 min-w-[140px]';

        options.forEach(opt => {
            const item = document.createElement('button');
            item.className = 'w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors';
            item.textContent = opt;
            if (bugListState[stateKey] === opt || (!bugListState[stateKey] && opt === 'All')) {
                item.className += ' text-primary font-bold';
            }
            item.addEventListener('click', () => {
                bugListState[stateKey] = opt === 'All' ? '' : opt;
                bugListState.page = 1;
                const valueSpan = btn.querySelector('.filter-value');
                if (valueSpan) valueSpan.textContent = opt;
                dropdown.remove();
                loadBugList();
            });
            dropdown.appendChild(item);
        });

        btn.style.position = 'relative';
        btn.appendChild(dropdown);

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown() {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }, { once: true });
        }, 10);
    });
}



async function loadBugList() {
    const tbody = document.getElementById('bug-list-tbody');
    if (!tbody) return;

    try {
        const params = new URLSearchParams();
        params.set('page', bugListState.page);
        params.set('limit', bugListState.limit);
        if (bugListState.status) params.set('status', bugListState.status);
        if (bugListState.priority) params.set('priority', bugListState.priority);
        if (bugListState.search) params.set('search', bugListState.search);
        if (bugListState.tab) params.set('tab', bugListState.tab);

        const data = await apiGet(`bugs.php?action=list&${params.toString()}`);
        const { bugs, pagination } = data;

        // Update total count in tab
        const totalBadge = document.getElementById('bug-total-count');
        if (totalBadge) totalBadge.textContent = pagination.total;

        // Render rows
        tbody.innerHTML = '';
        if (bugs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500 text-sm">No bugs found matching your criteria.</td></tr>`;
        } else {
            bugs.forEach(bug => {
                const sc = getStatusColor(bug.status);
                const pc = getPriorityColor(bug.priority);
                const assigneeName = bug.assignee_name || 'Unassigned';
                const shortDescription = escapeHtml((bug.description || '').substring(0, 60));
                tbody.innerHTML += `
                    <tr class="hover:bg-white/5 transition-all group cursor-pointer border-l-[3px] border-red-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" onclick="window.location.href='bug-report.html?id=${bug.id}'">
                        <td class="px-6 py-5 font-mono text-xs text-primary font-bold">${escapeHtml(bug.bug_id)}</td>
                        <td class="px-6 py-5">
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-slate-100 group-hover:text-primary transition-colors">${escapeHtml(bug.title)}</span>
                                <span class="text-xs text-slate-500 mt-1">${shortDescription}${bug.description && bug.description.length > 60 ? '...' : ''}</span>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <span class="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold ${pc.bg} ${pc.text} border ${pc.border} uppercase tracking-wider">${escapeHtml(bug.priority)}</span>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-2">
                                <span class="size-2 rounded-full ${sc.dot} shadow-[0_0_8px_currentColor]"></span>
                                <span class="text-xs font-bold text-slate-300">${escapeHtml(bug.status)}</span>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-3">
                                <div class="size-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">${getInitials(assigneeName)}</div>
                                <span class="text-xs font-bold text-slate-300">${escapeHtml(assigneeName)}</span>
                            </div>
                        </td>
                        <td class="px-6 py-5 text-xs font-semibold text-slate-500">${formatDate(bug.created_at)}</td>
                        <td class="px-6 py-5 text-right">
                            <div class="flex items-center justify-end gap-3">
                                ${currentUser && currentUser.role === 'Admin' ? `<a href="admin/assign_bug.php?id=${bug.id}" class="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-white transition-colors stop-propagation" onclick="event.stopPropagation();">Assign</a>` : ''}
                                <span class="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
                            </div>
                        </td>
                    </tr>`;
            });
        }

        // Update pagination
        renderPagination(pagination);

        // Update results count
        const resultsInfo = document.getElementById('results-info');
        if (resultsInfo) {
            const start = pagination.total === 0 ? 0 : ((pagination.current - 1) * pagination.limit) + 1;
            const end = pagination.total === 0 ? 0 : start + bugs.length - 1;
            resultsInfo.textContent = `Showing ${start}-${end} of ${pagination.total} results`;
        }

    } catch (err) {
        console.error('Bug list load error:', err);
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-red-400 text-sm">Failed to load bugs. Make sure XAMPP is running.</td></tr>`;
    }
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    container.innerHTML = '';

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'size-9 flex items-center justify-center rounded-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20';
    prevBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">chevron_left</span>';
    prevBtn.disabled = pagination.current <= 1;
    prevBtn.addEventListener('click', () => { bugListState.page--; loadBugList(); });
    container.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= Math.min(pagination.pages, 5); i++) {
        const pageBtn = document.createElement('button');
        if (i === pagination.current) {
            pageBtn.className = 'size-9 flex items-center justify-center rounded-xl primary-action text-white font-bold text-sm';
        } else {
            pageBtn.className = 'size-9 flex items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold';
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => { bugListState.page = i; loadBugList(); });
        container.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'size-9 flex items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all';
    nextBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">chevron_right</span>';
    nextBtn.disabled = pagination.current >= pagination.pages;
    nextBtn.addEventListener('click', () => { bugListState.page++; loadBugList(); });
    container.appendChild(nextBtn);
}

/* =============================================
   BUG REPORT / DETAIL PAGE
   ============================================= */
async function initBugReportPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const bugId = urlParams.get('id');

    if (!bugId) {
        document.querySelector('main').innerHTML = `
            <div class="col-span-3 flex flex-col items-center justify-center py-20">
                <span class="material-symbols-outlined text-6xl text-slate-600 mb-4">pest_control</span>
                <h2 class="text-xl font-bold text-slate-400 mb-2">No Bug Selected</h2>
                <p class="text-slate-500 mb-6">Select a bug from the bug list to view details.</p>
                <a href="bug-list.html" class="primary-btn text-white text-sm font-bold px-6 py-3 rounded-lg">Go to Bug List</a>
            </div>`;
        return;
    }

    try {
        // Fetch total bug count for the top navbar indicator
        apiGet('bugs.php?action=list&limit=1').then(data => {
            const countEl = document.getElementById('global-bug-count');
            if (countEl && data.pagination) {
                countEl.textContent = data.pagination.total;
                countEl.title = `Total Bugs: ${data.pagination.total}`;
            }
        }).catch(err => console.error('Failed to get bug count', err));

        const bug = await apiGet(`bugs.php?action=get&id=${bugId}`);
        renderBugDetail(bug);
        setupCommentForm(bugId);
        setupStatusUpdate(bug);
        setupAIFix(bug);
    } catch (err) {
        console.error('Bug report load error:', err);
        document.querySelector('main').innerHTML = `
            <div class="col-span-3 flex flex-col items-center justify-center py-20">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h2 class="text-xl font-bold text-slate-400 mb-2">Failed to Load Bug</h2>
                <p class="text-slate-500 mb-6">${err.message}</p>
                <a href="bug-list.html" class="primary-btn text-white text-sm font-bold px-6 py-3 rounded-lg">Back to Bug List</a>
            </div>`;
    }
}

function renderBugDetail(bug) {
    const sc = getStatusColor(bug.status);
    const pc = getPriorityColor(bug.priority);
    const assigneeName = bug.assignee_name || 'Unassigned';
    const assigneeRole = bug.assignee_role || '';

    // Title
    const titleEl = document.getElementById('bug-detail-title');
    if (titleEl) titleEl.textContent = bug.title;

    // Assign Link
    const assignLink = document.getElementById('assign-bug-link');
    if (assignLink) {
        assignLink.href = `admin/assign_bug.php?id=${bug.id}`;
        // Hide if not admin
        if (currentUser && currentUser.role !== 'Admin') {
            assignLink.classList.add('hidden');
        } else {
            assignLink.classList.remove('hidden');
        }
    }

    // Priority badge
    const priorityBadge = document.getElementById('bug-detail-priority');
    if (priorityBadge) {
        priorityBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${pc.bg} ${pc.text} border ${pc.border}`;
        priorityBadge.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold">priority_high</span>${escapeHtml(bug.priority)} Priority`;
    }

    // Status badge
    const statusBadge = document.getElementById('bug-detail-status');
    if (statusBadge) {
        statusBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${sc.bg} ${sc.text} border ${sc.border}`;
        statusBadge.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold">sync</span>${escapeHtml(bug.status)}`;
    }

    // Bug ID tag
    const tagBadge = document.getElementById('bug-detail-tag');
    if (tagBadge) {
        tagBadge.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold">label</span>${escapeHtml(bug.bug_id)}`;
    }

    // Description
    const descEl = document.getElementById('bug-detail-description');
    if (descEl) {
        descEl.innerHTML = `<p>${escapeHtml(bug.description).replace(/\n/g, '<br>')}</p>`;
    }

    // Code Snippet
    const codeSection = document.getElementById('bug-detail-code-section');
    const codeEl = document.getElementById('bug-detail-code');
    if (codeSection && codeEl) {
        if (bug.code_snippet && bug.code_snippet.trim().length > 0) {
            codeEl.textContent = bug.code_snippet;
            codeSection.classList.remove('hidden');
        } else {
            codeSection.classList.add('hidden');
        }
    }

    // Screenshot
    const screenshotEl = document.getElementById('bug-detail-screenshot');
    if (screenshotEl) {
        if (bug.screenshot) {
            screenshotEl.innerHTML = `<img class="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" src="${encodeURI(bug.screenshot)}" alt="Bug screenshot" />`;
        } else {
            screenshotEl.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">image</span>
                    <span class="text-sm">No screenshot attached</span>
                </div>`;
        }
    }

    // Assignee sidebar
    const assigneeEl = document.getElementById('bug-detail-assignee');
    if (assigneeEl) {
        assigneeEl.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span class="text-sm font-bold text-indigo-400">${getInitials(assigneeName)}</span>
            </div>
            <div>
                <p class="text-sm font-bold text-white">${escapeHtml(assigneeName)}</p>
                <p class="text-[11px] font-medium text-slate-500">${escapeHtml(assigneeRole)}</p>
            </div>`;
    }

    // Reporter sidebar
    const reporterEl = document.getElementById('bug-detail-reporter');
    if (reporterEl) {
        reporterEl.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span class="text-sm font-bold text-primary">${getInitials(bug.reporter_name)}</span>
            </div>
            <div>
                <p class="text-sm font-bold text-white">${escapeHtml(bug.reporter_name)}</p>
                <p class="text-[11px] font-medium text-slate-500">Reporter</p>
            </div>`;
    }

    // Meta info
    const createdEl = document.getElementById('bug-detail-created');
    if (createdEl) createdEl.textContent = formatDate(bug.created_at);

    const updatedEl = document.getElementById('bug-detail-updated');
    if (updatedEl) updatedEl.textContent = formatDate(bug.updated_at);

    // Render comments
    const commentsEl = document.getElementById('bug-comments-list');
    if (commentsEl) {
        commentsEl.innerHTML = '';
        if (bug.comments && bug.comments.length > 0) {
            bug.comments.forEach(c => {
                commentsEl.innerHTML += renderComment(c);
            });
        } else {
            commentsEl.innerHTML = '<p class="text-slate-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>';
        }
    }
}

function renderComment(comment) {
    const initials = getInitials(comment.author_name);
    return `
        <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-primary">${initials}</span>
            </div>
            <div class="flex-1 space-y-1.5 glossy-card p-4 rounded-xl">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white">${escapeHtml(comment.author_name)}</span>
                    <span class="text-[10px] font-medium text-slate-500">${timeAgo(comment.created_at)}</span>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(comment.text).replace(/\n/g, '<br>')}</p>
            </div>
        </div>`;
}

function setupCommentForm(bugId) {
    const form = document.getElementById('comment-form');
    const textarea = document.getElementById('comment-text');
    const submitBtn = document.getElementById('comment-submit');

    if (form && textarea && submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text) {
                showToast('Please enter a comment', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';

            try {
                const result = await apiPost('comments.php', {
                    bug_id: bugId,
                    author_name: getCurrentUser(),
                    text: text
                });

                // Add comment to list
                const commentsEl = document.getElementById('bug-comments-list');
                const emptyMsg = commentsEl.querySelector('p.text-slate-500');
                if (emptyMsg) emptyMsg.remove();
                commentsEl.innerHTML += renderComment(result);

                textarea.value = '';
                showToast('Comment posted!', 'success');
            } catch (err) {
                showToast('Failed to post comment', 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Post Comment';
        });
    }
}

function setupStatusUpdate(bug) {
    const statusSelect = document.getElementById('bug-status-select');
    if (statusSelect) {
        statusSelect.value = bug.status;
        statusSelect.addEventListener('change', async (e) => {
            try {
                await apiPost('bugs.php?action=update', {
                    id: bug.id,
                    status: e.target.value
                });
                showToast('Status updated!', 'success');
                // Update badge
                const sc = getStatusColor(e.target.value);
                const statusBadge = document.getElementById('bug-detail-status');
                if (statusBadge) {
                    statusBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${sc.bg} ${sc.text} border ${sc.border}`;
                    statusBadge.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold">sync</span>${escapeHtml(e.target.value)}`;
                }
            } catch (err) {
                showToast('Failed to update status', 'error');
            }
        });
    }
}

function setupAIFix(bug) {
    const btn = document.getElementById('ai-fix-btn');
    const panel = document.getElementById('ai-fix-panel');
    const fixedCodeEl = document.getElementById('ai-fixed-code');
    const acceptBtn = document.getElementById('accept-fix-btn');
    const rejectBtn = document.getElementById('reject-fix-btn');

    if (!btn || !panel || !fixedCodeEl || !acceptBtn || !rejectBtn) return;

    if (!bug.code_snippet || bug.code_snippet.trim() === '') {
        btn.classList.add('hidden');
        return;
    }

    // Check if user has permission (Admin or Developer)
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Developer')) {
        btn.classList.add('hidden');
        return;
    }

    btn.classList.remove('hidden');

    btn.addEventListener('click', async () => {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Analyzing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('code_snippet', bug.code_snippet);
            const data = await apiPost('ai_fix.php', formData);

            if (data.status === 'success') {
                if (typeof Diff !== 'undefined') {
                    fixedCodeEl.dataset.cleanCode = data.fixed_code;
                    const diff = Diff.diffLines(bug.code_snippet, data.fixed_code);
                    const fragment = document.createDocumentFragment();
                    diff.forEach((part) => {
                        const span = document.createElement('span');
                        if (part.added) {
                            span.classList.add('bg-green-500/20', 'text-green-400', 'block');
                            span.textContent = part.value.replace(/^/gm, '+ ');
                        } else if (part.removed) {
                            span.classList.add('bg-red-500/20', 'text-red-400', 'block', 'line-through', 'opacity-50');
                            span.textContent = part.value.replace(/^/gm, '- ');
                        } else {
                            span.classList.add('text-slate-300');
                            span.textContent = part.value;
                        }
                        fragment.appendChild(span);
                    });
                    fixedCodeEl.innerHTML = '';
                    fixedCodeEl.appendChild(fragment);
                } else {
                    fixedCodeEl.dataset.cleanCode = data.fixed_code;
                    fixedCodeEl.textContent = data.fixed_code;
                }
                
                const errorListContainer = document.getElementById('ai-error-list-container');
                const errorList = document.getElementById('ai-error-list');
                const errorCountEl = document.getElementById('ai-error-count');
                
                if (data.error_descriptions && Array.isArray(data.error_descriptions) && data.error_descriptions.length > 0) {
                    if (errorListContainer && errorList) {
                        errorList.innerHTML = '';
                        data.error_descriptions.forEach(desc => {
                            const li = document.createElement('li');
                            li.textContent = desc;
                            errorList.appendChild(li);
                        });
                        errorListContainer.classList.remove('hidden');
                    }
                    if (errorCountEl) {
                        errorCountEl.textContent = data.error_descriptions.length;
                    }
                } else {
                    if (errorListContainer) errorListContainer.classList.add('hidden');
                    if (errorCountEl) errorCountEl.textContent = '1';
                }
                
                panel.classList.remove('hidden');
            } else {
                showToast(data.message || 'AI Error', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Failed to connect to AI service', 'error');
        } finally {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    });

    rejectBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        fixedCodeEl.textContent = '';
    });

    acceptBtn.addEventListener('click', async () => {
        const origHtml = acceptBtn.innerHTML;
        acceptBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Saving...';
        acceptBtn.disabled = true;

        try {
            await apiPost('bugs.php?action=update', {
                id: bug.id,
                code_snippet: fixedCodeEl.dataset.cleanCode || fixedCodeEl.textContent
            });
            showToast('Code fix applied successfully!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            showToast('Failed to save code fix', 'error');
            acceptBtn.innerHTML = origHtml;
            acceptBtn.disabled = false;
        }
    });
}
