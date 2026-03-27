// CodePulse Premium Prototype Logic

const app = {
    currentView: 'login-view',
    currentOnboardingStep: 1,

    appData: {
        currentUser: { name: 'Sarah J.', role: 'Admin', wakatimeConnected: true },
        group: { id: 'CP-8492', name: 'CS101 Study Group', totalMembers: 8 },
        members: [
            { id: 1, name: 'Sarah J.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', topLang: 'Python', project: 'ML_Assignment', time: '14h 20m', joinDate: 'Oct 12', rank: 1, rawMinutes: 860, streak: 12, badges: [{icon: 'ph-fire', type: 'fire', text: '12-Day Streak'}, {icon: 'ph-code', type: 'owl', text: 'Polyglot'}] },
            { id: 2, name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026724d', topLang: 'TypeScript', project: 'ReactPortfolio', time: '12h 45m', joinDate: 'Oct 14', rank: 2, rawMinutes: 765, streak: 5, badges: [{icon: 'ph-moon-stars', type: 'owl', text: 'Night Owl'}] },
            { id: 3, name: 'Elena R.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', topLang: 'Java', project: 'Compiler_Design', time: '9h 10m', joinDate: 'Oct 12', rank: 3, rawMinutes: 550, streak: 2, badges: [] },
            { id: 4, name: 'Marcus T.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', topLang: 'Rust', project: 'OS_Kernel', time: '4h 30m', joinDate: 'Oct 15', rank: 4, rawMinutes: 270, streak: 0, badges: [] }
        ],
        goals: [
            { id: 1, title: 'Code in Python for 2h', language: 'Python', target: 120, deadline: 'Today', emailAlert: true, status: 'pending', progress: 45 },
            { id: 2, title: 'Algorithm Practice', language: 'Java', target: 60, deadline: 'End of Week', emailAlert: false, status: 'completed', progress: 60 }
        ],
        arenaGroups: [
            { rank: 1, name: "MIT Hackers", score: "420h", icon: "ph-student" },
            { rank: 2, name: "CS101 Study Group", score: "290h", icon: "ph-users", highlight: true },
            { rank: 3, name: "React India", score: "210h", icon: "ph-atom" },
            { rank: 4, name: "100DaysOfCode Global", score: "185h", icon: "ph-globe" }
        ]
    },

    // ─── CORE NAVIGATION ───
    navigateTo(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        setTimeout(() => {
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            if (viewId === 'app-view') this.initDashboard();
        }, 50);
        this.currentView = viewId;
    },

    // ─── THEME & SIDEBAR ───
    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        const iconClasses = isLight ? 'ph-fill ph-sun text-warning' : 'ph ph-moon text-muted';
        
        const mIcon = document.getElementById('mobile-theme-icon');
        const dIcon = document.getElementById('desktop-theme-icon');
        if (mIcon) mIcon.className = iconClasses;
        if (dIcon) dIcon.className = iconClasses;

        this.showToast('Theme Updated', `Switched to ${isLight ? 'Light' : 'Premium Dark'} Mode`, isLight ? 'ph-sun' : 'ph-moon');
    },

    toggleSidebar() {
        document.getElementById('app-sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    },

    closeSidebar() {
        document.getElementById('app-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },

    // ─── SOCIAL NUDGES & TOASTS ───
    showToast(title, message, iconStr = 'ph-bell-ringing') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="ph-fill ${iconStr} toast-icon"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        container.appendChild(toast);
        
        // Trigger reflow for animation
        void toast.offsetWidth;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400); // Wait for CSS transition
        }, 3500);
    },

    nudgeMember(name) {
        this.showToast('Nudge Sent! 🔥', `${name} just got an email nudge to keep coding.`, 'ph-paper-plane-tilt');
    },

    giveKudos(name) {
        this.showToast('Kudos Sent! 🎉', `You gave ${name} a high-five for their streak.`, 'ph-hands-clapping');
    },

    // ─── SHORTCUT NAVIGATION HELPERS ───
    goToSettings() { this.switchTab('sub-settings', document.querySelector('[data-target="sub-settings"]')); },
    goToMembers() { this.switchTab('sub-members', document.querySelector('[data-target="sub-members"]')); },
    goToGoals() { this.switchTab('sub-goals', document.querySelector('[data-target="sub-goals"]')); },

    // ─── ONBOARDING WIZARD ───
    onboardingNext() {
        if (this.currentOnboardingStep < 3) {
            this.currentOnboardingStep++;
            this.updateOnboardingUI();
        } else {
            this.navigateTo('app-view');
        }
    },
    onboardingPrev() {
        if (this.currentOnboardingStep > 1) {
            this.currentOnboardingStep--;
            this.updateOnboardingUI();
        }
    },
    updateOnboardingUI() {
        document.querySelectorAll('.onboarding-steps .step').forEach((el, i) => {
            if (i + 1 === this.currentOnboardingStep) { el.classList.add('active'); el.classList.remove('completed'); }
            else if (i + 1 < this.currentOnboardingStep) { el.classList.add('completed'); el.classList.remove('active'); }
            else { el.classList.remove('active', 'completed'); }
        });
        document.querySelectorAll('.step-line').forEach((el, i) => el.classList.toggle('active', i + 1 < this.currentOnboardingStep));
        document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${this.currentOnboardingStep}`).classList.add('active');

        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        prevBtn.classList.toggle('hidden', this.currentOnboardingStep === 1);
        nextBtn.textContent = this.currentOnboardingStep === 3 ? "Connect & Finish" : "Next Step";
    },

    // ─── SUB-VIEW TABS ───
    switchTab(targetId, navLinkEl) {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        if (navLinkEl) navLinkEl.parentElement.classList.add('active');

        document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        const titleEl = document.getElementById('page-title');
        const actionsEl = document.getElementById('topbar-actions');
        actionsEl.style.visibility = 'visible';

        const titles = {
            'sub-dashboard': 'Overview',
            'sub-goals': 'My Goals',
            'sub-arena': 'The Arena (Global)',
            'sub-analytics': 'Deep Analytics',
            'sub-members': 'Member Stats',
            'sub-email': 'Email Settings & Logs',
            'sub-settings': 'Settings'
        };
        titleEl.textContent = titles[targetId] || 'Overview';

        if (['sub-email', 'sub-settings'].includes(targetId)) actionsEl.style.visibility = 'hidden';
        if (targetId === 'sub-goals') this.renderFullGoals('active');

        this.closeSidebar();
    },

    switchSettingsTab(tabId, tabEl) {
        document.querySelectorAll('.settings-tabs li').forEach(li => li.classList.remove('active'));
        tabEl.classList.add('active');
        document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`settings-${tabId}`).classList.add('active');
    },

    // ─── MODALS ───
    openModal(modalId) {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    },
    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    // ─── RENDERING & DATA VISUALIZATION ───
    getLangColor(lang) {
        const colors = { 'Python': '#3b82f6', 'TypeScript': '#3178c6', 'Java': '#ef4444', 'Rust': '#f97316' };
        return colors[lang] || '#6366f1';
    },

    initDashboard() {
        this.renderLeaderboard();
        this.renderDashboardGoals();
        this.renderMembersTable();
        this.renderArena();
        this.renderHeatmap();
    },

    renderLeaderboard() {
        const container = document.getElementById('leaderboard');
        if(!container) return;
        container.innerHTML = '';
        const maxMins = this.appData.members[0].rawMinutes;

        this.appData.members.forEach(member => {
            const widthPct = (member.rawMinutes / maxMins) * 100;
            
            // Generate Badges HTML
            let badgesHtml = '';
            if (member.badges && member.badges.length > 0) {
                badgesHtml = member.badges.map(b => `<span class="premium-badge badge-${b.type}"><i class="ph-fill ${b.icon}"></i> ${b.text}</span>`).join('');
            }

            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="bar-bg" style="width: 0%"></div>
                <div class="rank">#${member.rank}</div>
                <img src="${member.avatar}" alt="${member.name}" class="avatar" style="width:42px;height:42px">
                
                <div class="member-info">
                    <div class="member-header-row">
                        <span class="name">${member.name}</span>
                        <div class="badge-stack">${badgesHtml}</div>
                    </div>
                    <span class="project"><div style="width:8px;height:8px;border-radius:50%;background:${this.getLangColor(member.topLang)};display:inline-block;"></div> ${member.topLang} • ${member.project}</span>
                </div>
                
                <div class="interaction-actions">
                    <button class="action-btn kudos" title="Give Kudos" onclick="app.giveKudos('${member.name}')"><i class="ph-fill ph-hands-clapping"></i></button>
                    ${member.streak < 3 ? `<button class="action-btn nudge" title="Send Nudge" onclick="app.nudgeMember('${member.name}')"><i class="ph-fill ph-paper-plane-tilt"></i></button>` : ''}
                </div>

                <div class="stat-time">${member.time}</div>
            `;
            container.appendChild(item);
            setTimeout(() => { item.querySelector('.bar-bg').style.width = widthPct + '%'; }, 100);
        });
    },

    renderArena() {
        const container = document.getElementById('arena-list');
        if(!container) return;
        container.innerHTML = '';

        this.appData.arenaGroups.forEach(group => {
            const item = document.createElement('div');
            item.className = `arena-item ${group.highlight ? 'top-1' : ''}`;
            item.innerHTML = `
                <div class="arena-info">
                    <div class="arena-rank">#${group.rank}</div>
                    <div class="stat-icon" style="background:var(--bg-white-10); color:var(--text-muted)"><i class="${group.icon}"></i></div>
                    <div class="arena-details">
                        <h3>${group.name} ${group.highlight ? ' (You)' : ''}</h3>
                        <p>Top active study group this month</p>
                    </div>
                </div>
                <div class="arena-score">${group.score}</div>
            `;
            container.appendChild(item);
        });
    },

    renderHeatmap() {
        const container = document.getElementById('heatmap-container');
        if(!container) return;
        container.innerHTML = '<div class="heatmap-grid" id="heatmap-grid"></div>';
        const grid = document.getElementById('heatmap-grid');
        
        // Generate 140 random nodes imitating GitHub heatmap
        for(let i = 0; i < 140; i++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            // Randomly assign a level 0-4 for opacity
            const level = Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0;
            if (level > 0) cell.setAttribute('data-level', level);
            grid.appendChild(cell);
        }
    },

    renderDashboardGoals() {
        const container = document.getElementById('dashboard-goals-list');
        if(!container) return;
        container.innerHTML = '';
        this.appData.goals.slice(0, 3).forEach(goal => container.appendChild(this.createGoalCard(goal)));
    },

    renderFullGoals(filter = 'all') {
        const container = document.getElementById('full-goals-list');
        if(!container) return;
        container.innerHTML = '';
        const filtered = this.appData.goals.filter(g => {
            if (filter === 'active') return g.status === 'pending';
            if (filter === 'completed') return g.status === 'completed';
            return true;
        });
        if (!filtered.length) { container.innerHTML = '<p class="text-muted text-center w-full" style="padding:3rem 0">No goals found.</p>'; return; }
        filtered.forEach(goal => container.appendChild(this.createGoalCard(goal)));
    },

    filterGoals(type) { this.renderFullGoals(type); },

    createGoalCard(goal) {
        const done = goal.status === 'completed';
        const pct = done ? 100 : Math.min(100, (goal.progress / goal.target) * 100);
        const card = document.createElement('div');
        card.className = `goal-card ${goal.status} ${goal.emailAlert && !done ? 'email-alert' : ''}`;
        const emailHtml = goal.emailAlert && !done ? '<div class="email-badge"><i class="ph-fill ph-envelope-simple"></i> Email Alert Pending</div>' : '';
        const statusIcon = done ? '<i class="ph-fill ph-check-circle"></i> Done' : 'In Progress';
        card.innerHTML = `
            <div class="goal-header">
                <div><h3 class="goal-title">${goal.title}</h3>${emailHtml}</div>
                <span class="goal-status text-xs">${statusIcon}</span>
            </div>
            <div class="goal-meta mt-2">
                <span><i class="ph ph-code"></i> ${goal.language}</span>
                <span>${goal.progress} / ${goal.target} mins</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        `;
        setTimeout(() => { const f = card.querySelector('.progress-fill'); if (f) f.style.width = pct + '%'; }, 100);
        return card;
    },

    renderMembersTable() {
        const tbody = document.getElementById('members-table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        this.appData.members.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="flex items-center gap-3"><img src="${m.avatar}" class="avatar" style="width:34px;height:34px"><span style="font-weight:500">${m.name}</span></div></td>
                <td><div class="flex items-center gap-2"><div style="width:8px;height:8px;border-radius:50%;background:${this.getLangColor(m.topLang)};display:inline-block"></div> ${m.topLang}</div></td>
                <td class="text-muted text-sm">${m.project}</td>
                <td style="font-weight:500">${m.time}</td>
                <td class="text-muted text-sm">${m.joinDate}</td>
                <td><button class="btn-icon" title="View Profile"><i class="ph ph-user"></i></button><button class="btn-icon" title="Compare Stats"><i class="ph ph-chart-bar"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    setFilter(btnEl) {
        document.querySelectorAll('.time-filter button').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
        this.showToast('Filter Applied', 'Data refreshed for selected time frame.', 'ph-calendar-check');
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {});
