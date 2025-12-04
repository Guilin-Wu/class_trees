/**
 * ClassTree - Single Script Version
 */

// --- Constants & Config ---

const TRANSLATIONS = {
    en: {
        appTitle: "ClassTree",
        manage: "Manage",
        searchPlaceholder: "Search student...",
        selected: "Selected",
        clear: "Clear",
        addStudent: "Add Student",
        batchImport: "Batch Import",
        dataControl: "Data Control",
        exportCSV: "Export CSV",
        resetAll: "Reset All",
        points: "pts",
        dailySummary: "Today's Summary",
        todaysGrowth: "Today's Growth",
        topStudents: "Top Students",
        treeStyle: "Tree Style",
        language: "Language",
        settings: "Settings",
        history: "History",
        removeStudent: "Remove Student",
        noStudents: "No students found.",
        addSome: "Add some students to get started",
        confirmDelete: "Remove this student?",
        confirmReset: "Delete ALL data?",
        importSuccess: "Import successful!",
        luckyDrawTitle: "Lucky Draw",
        luckyDrawBtn: "Pick Random",
        roster: "Roster",
        general: "General",
        group: "Group",
        action: "Action"
    },
    zh: {
        appTitle: "班级小树",
        manage: "管理",
        searchPlaceholder: "搜索学生...",
        selected: "已选择",
        clear: "取消",
        addStudent: "添加学生",
        batchImport: "批量导入",
        dataControl: "数据管理",
        exportCSV: "导出表格",
        resetAll: "重置所有",
        points: "分",
        dailySummary: "今日总结",
        todaysGrowth: "今日成长",
        topStudents: "今日之星",
        treeStyle: "树木风格",
        language: "语言",
        settings: "设置",
        history: "历史记录",
        removeStudent: "移除学生",
        noStudents: "暂无学生数据",
        addSome: "请添加学生以开始",
        confirmDelete: "确定要移除该学生吗？",
        confirmReset: "确定删除所有数据？",
        importSuccess: "导入成功！",
        luckyDrawTitle: "幸运抽奖",
        luckyDrawBtn: "随机抽取",
        roster: "名单管理",
        general: "通用设置",
        group: "分组",
        action: "操作"
    }
};

const TreeTypes = {
    OAK: 'Oak',
    PINE: 'Pine',
    SAKURA: 'Sakura',
    BAMBOO: 'Bamboo',
    APPLE: 'Apple'
};

const TreeStages = {
    SEED: 'Seed',
    SPROUT: 'Sprout',
    SAPLING: 'Sapling',
    TREE: 'Tree',
    MATURE: 'Mature',
    BLOOMING: 'Blooming',
    WITHERED: 'Withered'
};

const DEFAULT_THRESHOLDS = {
    [TreeStages.WITHERED]: -999,
    [TreeStages.SEED]: 0,
    [TreeStages.SPROUT]: 10,
    [TreeStages.SAPLING]: 30,
    [TreeStages.TREE]: 60,
    [TreeStages.MATURE]: 100,
    [TreeStages.BLOOMING]: 150,
};

// --- State Management ---

const state = {
    students: [],
    config: {
        thresholds: DEFAULT_THRESHOLDS,
        treeStyle: 'flat', // flat, pixel, realism, sketch, origami
        language: 'zh'
    },
    viewMode: 'grid', // grid, forest, seats
    selectedIds: new Set(),
    searchQuery: '',
    holiday: 'none'
};

// --- Utils ---

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getRandomTreeType() {
    const types = Object.values(TreeTypes);
    return types[Math.floor(Math.random() * types.length)];
}

function getStage(score) {
    if (score < 0) return TreeStages.WITHERED;
    if (score >= 150) return TreeStages.BLOOMING;
    if (score >= 100) return TreeStages.MATURE;
    if (score >= 60) return TreeStages.TREE;
    if (score >= 30) return TreeStages.SAPLING;
    if (score >= 10) return TreeStages.SPROUT;
    return TreeStages.SEED;
}

function getSeasonalHoliday() {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();
    if (month === 11 && date >= 20) return 'christmas';
    if (month === 0 || (month === 1 && date <= 15)) return 'new_year';
    if ((month === 2 && date >= 20) || month === 3) return 'sakura';
    return 'none';
}

function t(key) {
    return TRANSLATIONS[state.config.language][key] || key;
}

// --- SVG Rendering Logic (Ported from React) ---

function generateTreeSVG(type, stage, style) {
    const holiday = state.holiday;
    let foliage = '#22c55e';
    let trunk = '#78350f';
    let fruit = 'transparent';

    // 1. Determine Colors
    const isWithered = stage === TreeStages.WITHERED;
    if (isWithered) {
        foliage = '#a8a29e'; trunk = '#57534e';
    } else {
        switch (type) {
            case TreeTypes.SAKURA:
                foliage = (stage === TreeStages.BLOOMING || holiday === 'sakura') ? '#fbcfe8' : '#86efac';
                trunk = '#5D4037';
                break;
            case TreeTypes.PINE:
                foliage = (holiday === 'christmas') ? '#0f5132' : '#15803d';
                trunk = '#3E2723';
                break;
            case TreeTypes.BAMBOO:
                foliage = '#bef264'; trunk = '#65a30d';
                break;
            case TreeTypes.APPLE:
                foliage = '#4ade80';
                fruit = stage === TreeStages.BLOOMING ? '#ef4444' : 'transparent';
                break;
            default: // OAK
                foliage = '#22c55e'; trunk = '#78350f';
        }
        if (stage === TreeStages.SEED) foliage = '#854d0e';
    }

    // 2. Determine Scale
    let scale = 0.5;
    if (stage === TreeStages.SEED) scale = 0.2;
    else if (stage === TreeStages.SPROUT) scale = 0.4;
    else if (stage === TreeStages.SAPLING) scale = 0.6;
    else if (stage === TreeStages.TREE) scale = 0.8;
    else if (stage === TreeStages.MATURE) scale = 1.0;
    else if (stage === TreeStages.BLOOMING) scale = 1.1;

    // 3. Render Logic based on Style
    let content = '';

    if (style === 'pixel') {
        // Simple blocks
        if (stage === TreeStages.SEED) {
            content = `<rect x="90" y="170" width="20" height="20" fill="${trunk}" />`;
        } else if (stage === TreeStages.SPROUT) {
            content = `<rect x="95" y="170" width="10" height="20" fill="${trunk}" />
                       <rect x="85" y="160" width="10" height="10" fill="${foliage}" />
                       <rect x="105" y="160" width="10" height="10" fill="${foliage}" />
                       <rect x="95" y="150" width="10" height="10" fill="${foliage}" />`;
        } else {
            // Full tree pixel
            const isBamboo = type === TreeTypes.BAMBOO;
            let foliageShapes = isBamboo 
                ? `<rect x="92" y="50" width="16" height="140" fill="${trunk}" />
                   <rect x="80" y="80" width="40" height="10" fill="${foliage}" />
                   <rect x="80" y="120" width="40" height="10" fill="${foliage}" />`
                : `<rect x="90" y="100" width="20" height="90" fill="${trunk}" />
                   <rect x="60" y="70" width="80" height="40" fill="${foliage}" />
                   <rect x="70" y="40" width="60" height="30" fill="${foliage}" />
                   <rect x="80" y="20" width="40" height="20" fill="${foliage}" />`;
            
            if (fruit !== 'transparent' && (stage === TreeStages.BLOOMING || stage === TreeStages.MATURE)) {
                foliageShapes += `<rect x="70" y="80" width="10" height="10" fill="${fruit}" />
                                  <rect x="110" y="50" width="10" height="10" fill="${fruit}" />`;
            }

            content = `<g transform="translate(100, 190) scale(${scale}) translate(-100, -190)">
                        ${foliageShapes}
                       </g>`;
        }
    } else if (style === 'sketch') {
        // Stroke only
        const stroke = '#292524';
        const sw = 3;
        if (stage === TreeStages.SEED) {
             content = `<circle cx="100" cy="180" r="8" stroke="${stroke}" stroke-width="${sw}" fill="none" />`;
        } else {
             const isBamboo = type === TreeTypes.BAMBOO;
             const isPine = type === TreeTypes.PINE;
             
             let trunkPath = isBamboo 
                ? `<path d="M92,190 L95,50 L105,50 L108,190" stroke="${stroke}" stroke-width="${sw}" fill="none" />
                   <path d="M93,150 L107,150" stroke="${stroke}" stroke-width="${sw}" />`
                : `<path d="M90,190 Q95,150 95,100 Q90,50 100,40 Q110,50 105,100 Q105,150 110,190" stroke="${stroke}" stroke-width="${sw}" fill="none" />`;
            
             let foliagePath = '';
             if (isPine) {
                 foliagePath = `<path d="M100,20 L130,120 L70,120 Z M100,50 L140,150 L60,150 Z" stroke="${stroke}" stroke-width="${sw}" fill="${foliage}" fill-opacity="0.3" />`;
             } else if (isBamboo) {
                 foliagePath = `<path d="M105,130 Q130,120 140,100 Q120,110 105,120" stroke="${stroke}" stroke-width="${sw}" fill="${foliage}" fill-opacity="0.3" />`;
             } else {
                 foliagePath = `<path d="M100,160 Q150,150 150,100 Q150,40 100,30 Q50,40 50,100 Q50,150 100,160" stroke="${stroke}" stroke-width="${sw}" fill="${foliage}" fill-opacity="0.3" />`;
             }
             
             content = `<g transform="translate(100, 190) scale(${scale}) translate(-100, -190)">${trunkPath}${foliagePath}</g>`;
        }
    } else {
        // Flat (Default) / Realism / Origami (simplified to Flat for brevity in vanilla JS version but utilizing colors)
        // Note: Realism would essentially be Flat with gradients, Origami with polygons. 
        // We will stick to the robust 'Flat' implementation for the core view to ensure reliability in Vanilla.
        
        if (stage === TreeStages.SEED) {
            content = `<ellipse cx="100" cy="180" rx="10" ry="6" fill="${trunk}" />`;
        } else if (stage === TreeStages.SPROUT) {
            content = `<g transform="translate(100, 180)">
                        <path d="M0,0 Q-10,-20 -20,-25 Q-5,-25 0,0" fill="${foliage}" />
                        <path d="M0,0 Q10,-20 20,-25 Q5,-25 0,0" fill="${foliage}" />
                       </g>`;
        } else {
            const isBamboo = type === TreeTypes.BAMBOO;
            const isPine = type === TreeTypes.PINE;
            
            let shape = '';
            if (isBamboo) {
                 shape = `<g>
                     <rect x="90" y="50" width="8" height="140" fill="${trunk}" rx="2" />
                     <rect x="102" y="70" width="8" height="120" fill="${trunk}" rx="2" />
                     <ellipse cx="80" cy="60" rx="20" ry="8" fill="${foliage}" transform="rotate(-30 80 60)" />
                     <ellipse cx="120" cy="80" rx="20" ry="8" fill="${foliage}" transform="rotate(30 120 80)" />
                 </g>`;
            } else if (isPine) {
                 shape = `<g>
                    <path d="M100,190 L100,190 Q80,150 90,100 L90,100 Q80,50 100,40 Q120,50 110,100 L110,100 Q120,150 100,190 Z" fill="${trunk}" />
                    <g transform="translate(100, 40)">
                         <path d="M0,-80 L-40,20 L40,20 Z" fill="${foliage}" />
                         <path d="M0,-50 L-50,60 L50,60 Z" fill="${foliage}" />
                         <path d="M0,-20 L-60,100 L60,100 Z" fill="${foliage}" />
                     </g>
                 </g>`;
                 // Christmas decorations
                 if (holiday === 'christmas') {
                     shape += `<g transform="translate(100, 40)">
                         <path d="M0,-90 L5,-80 L-5,-80 Z" fill="#fbbf24" transform="scale(1.5)" />
                         <circle cx="-20" cy="10" r="3" fill="#ef4444" />
                         <circle cx="10" cy="40" r="3" fill="#3b82f6" />
                     </g>`;
                 }
            } else {
                 // Standard Round Tree (Oak, Apple, Sakura)
                 shape = `<g>
                    <path d="M100,190 L100,190 Q80,150 90,100 L90,100 Q80,50 100,40 Q120,50 110,100 L110,100 Q120,150 100,190 Z" fill="${trunk}" />
                    <g transform="translate(100, 70)">
                         <circle cx="-30" cy="10" r="30" fill="${foliage}" />
                         <circle cx="30" cy="10" r="30" fill="${foliage}" />
                         <circle cx="0" cy="-30" r="40" fill="${foliage}" />
                         <circle cx="-20" cy="-10" r="35" fill="${foliage}" />
                         <circle cx="20" cy="-10" r="35" fill="${foliage}" />
                    </g>
                 </g>`;
                 
                 // Fruits
                 if (fruit !== 'transparent' && (stage === TreeStages.BLOOMING || stage === TreeStages.MATURE)) {
                     shape += `<g transform="translate(100, 70)">
                         <circle cx="-20" cy="0" r="4" fill="${fruit}" />
                         <circle cx="25" cy="-10" r="4" fill="${fruit}" />
                         <circle cx="0" cy="-35" r="4" fill="${fruit}" />
                     </g>`;
                 }
            }
            content = `<g transform="translate(100, 190) scale(${scale}) translate(-100, -190)">${shape}</g>`;
        }
    }

    return `<svg viewBox="0 0 200 200" class="w-full h-full" shape-rendering="${style==='pixel'?'crispEdges':'auto'}">
                <ellipse cx="100" cy="190" rx="60" ry="10" fill="rgba(0,0,0,0.15)" />
                ${content}
            </svg>`;
}

// --- App Logic ---

const app = {
    init: function() {
        // Load Data
        const savedStudents = localStorage.getItem('classTree_students');
        if (savedStudents) state.students = JSON.parse(savedStudents);
        
        const savedConfig = localStorage.getItem('classTree_config');
        if (savedConfig) state.config = JSON.parse(savedConfig);

        state.holiday = getSeasonalHoliday();

        // Render UI
        this.renderHeader();
        this.renderGrid();
        
        // Listeners
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            this.renderGrid();
        });

        // View Toggles
        document.querySelectorAll('#view-toggles button').forEach(btn => {
            btn.addEventListener('click', () => {
                state.viewMode = btn.dataset.mode;
                document.querySelectorAll('#view-toggles button').forEach(b => {
                    b.classList.remove('bg-white', 'shadow', 'text-emerald-600');
                    b.classList.add('text-gray-400');
                });
                btn.classList.add('bg-white', 'shadow', 'text-emerald-600');
                btn.classList.remove('text-gray-400');
                this.renderGrid();
            });
        });

        // Modals
        document.getElementById('btn-manage').addEventListener('click', () => this.openManagerModal());
        document.getElementById('btn-stats').addEventListener('click', () => this.openLeaderboard());
        document.getElementById('btn-lucky').addEventListener('click', () => this.openLuckyDraw());
        document.getElementById('btn-daily').addEventListener('click', () => this.openDailySummary());
        
        // Initial Icons
        lucide.createIcons();
    },

    save: function() {
        localStorage.setItem('classTree_students', JSON.stringify(state.students));
        localStorage.setItem('classTree_config', JSON.stringify(state.config));
        this.renderGrid(); // Re-render grid to show updates
        this.renderHeader(); // Update translations if language changed
    },

    renderHeader: function() {
        // Translations for static header elements
        document.getElementById('app-title').textContent = t('appTitle');
        document.getElementById('search-input').placeholder = t('searchPlaceholder');
        document.getElementById('lbl-manage').textContent = t('manage');
        document.getElementById('lbl-selected').textContent = t('selected');
        document.getElementById('lbl-clear').textContent = t('clear');
    },

    renderGrid: function() {
        const container = document.getElementById('main-container');
        container.innerHTML = '';
        
        // Filter
        const filtered = state.students.filter(s => 
            s.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-24 text-gray-400">
                    <i data-lucide="sprout" class="w-16 h-16 mb-4 opacity-50"></i>
                    <p class="text-xl font-medium">${t('noStudents')}</p>
                    <button onclick="app.openManagerModal()" class="mt-4 text-emerald-600 hover:underline">${t('addSome')}</button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        let html = '';

        if (state.viewMode === 'forest') {
            // Group by Group
            const groups = {};
            filtered.forEach(s => {
                const g = s.group || 'Unassigned';
                if (!groups[g]) groups[g] = [];
                groups[g].push(s);
            });

            html += `<div class="space-y-12">`;
            for (const [groupName, groupStudents] of Object.entries(groups)) {
                html += `
                    <div class="bg-white/50 rounded-3xl p-6 border border-emerald-100/50">
                        <h3 class="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                            <span class="w-2 h-8 bg-emerald-400 rounded-full"></span> ${groupName}
                        </h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            ${groupStudents.map(s => this.createStudentCard(s)).join('')}
                        </div>
                    </div>
                `;
            }
            html += `</div>`;
        } else if (state.viewMode === 'seats') {
            // Seats Grid
            html = `
                <div class="bg-white/40 border border-gray-200 rounded-xl p-8 overflow-x-auto">
                     <div class="grid grid-cols-6 gap-4 min-w-[800px]">
                         ${filtered.map(s => this.createStudentCard(s, true)).join('')}
                     </div>
                     <div class="mt-8 text-center text-gray-400 text-sm font-medium uppercase tracking-widest border-t border-gray-300 pt-2">
                         Front of Class
                     </div>
                </div>
            `;
        } else {
            // Default Grid
            html = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                ${filtered.map(s => this.createStudentCard(s)).join('')}
            </div>`;
        }

        container.innerHTML = html;
        lucide.createIcons();
        this.updateBatchBar();
    },

    createStudentCard: function(student, compact = false) {
        const stage = getStage(student.score);
        const isSelected = state.selectedIds.has(student.id);
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle);
        
        return `
            <div 
                onclick="app.toggleSelection('${student.id}')"
                oncontextmenu="event.preventDefault(); app.toggleSelection('${student.id}')"
                ondblclick="app.openStudentDetail('${student.id}')"
                class="student-card group relative bg-white rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between
                ${isSelected ? 'selected ring-4 ring-emerald-400 shadow-xl' : 'hover:shadow-xl hover:-translate-y-1 ring-1 ring-gray-100 hover:ring-emerald-200'}">
                
                <div class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors 
                    ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 bg-white group-hover:border-emerald-300'}">
                    ${isSelected ? '<div class="w-2 h-2 bg-white rounded-full"></div>' : ''}
                </div>

                <div class="mb-2 pt-2 flex justify-center tree-container ${compact ? 'w-16 h-20 mx-auto' : ''}">
                    ${svg}
                </div>

                <div class="text-center">
                    <h3 class="font-bold text-gray-800 truncate px-2 text-sm">${student.name}</h3>
                    <div class="flex items-center justify-center gap-2 mt-1">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${student.score < 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}">
                            ${student.score} ${t('points')}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    toggleSelection: function(id) {
        if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
        } else {
            state.selectedIds.add(id);
        }
        
        // If selection exists, just re-render UI classes (simpler to full re-render for this demo)
        this.renderGrid();
    },

    clearSelection: function() {
        state.selectedIds.clear();
        this.renderGrid();
    },

    updateBatchBar: function() {
        const bar = document.getElementById('batch-bar');
        const count = document.getElementById('batch-count');
        
        if (state.selectedIds.size > 0) {
            bar.classList.remove('hidden', 'opacity-0');
            count.textContent = state.selectedIds.size;
        } else {
            bar.classList.add('opacity-0');
            setTimeout(() => bar.classList.add('hidden'), 300);
        }
    },

    batchScore: function(delta) {
        if (state.selectedIds.size === 0) return;
        this.applyScore([...state.selectedIds], delta, "Batch Action");
        this.clearSelection();
    },

    applyScore: function(ids, delta, reason) {
        const now = Date.now();
        state.students = state.students.map(s => {
            if (ids.includes(s.id)) {
                return {
                    ...s,
                    score: s.score + delta,
                    history: [{
                        id: generateId(),
                        timestamp: now,
                        scoreDelta: delta,
                        reason: reason
                    }, ...s.history]
                };
            }
            return s;
        });
        this.save();
    },

    // --- Modal Logic ---
    
    closeModal: function() {
        document.getElementById('modal-container').innerHTML = '';
    },

    openStudentDetail: function(id) {
        const student = state.students.find(s => s.id === id);
        if (!student) return;
        
        const stage = getStage(student.score);
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle);
        const displayTreeType = Object.values(TreeTypes).map(type => 
            `<button onclick="app.changeTreeType('${id}', '${type}')" class="px-2 py-1 text-xs border rounded hover:bg-emerald-50 ${student.treeType === type ? 'bg-emerald-100 border-emerald-500' : ''}">${type}</button>`
        ).join('');

        const historyHtml = student.history.slice(0, 5).map(h => `
            <div class="flex justify-between text-sm py-2 border-b">
                <span>${h.reason}</span>
                <span class="${h.scoreDelta > 0 ? 'text-emerald-600' : 'text-red-500'} font-bold">${h.scoreDelta > 0 ? '+' : ''}${h.scoreDelta}</span>
            </div>
        `).join('');

        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-zoom-in">
                    
                    <!-- Left: Visual -->
                    <div class="md:w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-100 relative">
                        <div class="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[200px]">
                           ${displayTreeType}
                        </div>
                        <div class="w-64 h-80 drop-shadow-xl mt-8">
                            ${svg}
                        </div>
                        <h2 class="text-4xl font-black text-gray-800 mt-4">${student.name}</h2>
                        <div class="mt-2 text-2xl font-bold text-emerald-600">${student.score} ${t('points')}</div>
                        <div class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">${stage}</div>
                    </div>

                    <!-- Right: Controls -->
                    <div class="md:w-1/2 bg-white flex flex-col">
                        <div class="p-4 border-b flex justify-between items-center">
                            <h3 class="font-bold text-gray-500 uppercase tracking-widest text-sm">Control Panel</h3>
                            <button onclick="app.closeModal()" class="p-2 hover:bg-gray-100 rounded-full"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="p-6 overflow-y-auto flex-1">
                            <div class="grid grid-cols-4 gap-2 mb-4">
                                <button onclick="app.applyScore(['${id}'], 1, 'Point')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700">+1</button>
                                <button onclick="app.applyScore(['${id}'], 5, 'Big Win')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700">+5</button>
                                <button onclick="app.applyScore(['${id}'], 10, 'Excellent')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700">+10</button>
                                <button onclick="app.applyScore(['${id}'], -5, 'Correction')" class="py-2 rounded-lg border hover:bg-red-50 hover:border-red-300 font-bold text-red-700">-5</button>
                            </div>
                            
                            <h4 class="font-bold text-gray-800 mb-2 mt-6 flex items-center gap-2"><i data-lucide="history" class="w-4 h-4"></i> ${t('history')}</h4>
                            <div>${historyHtml || '<p class="text-gray-400 text-sm italic">No history</p>'}</div>
                        </div>
                        <div class="p-4 border-t bg-gray-50 flex justify-between">
                            <button onclick="app.deleteStudent('${id}')" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"><i data-lucide="trash-2" class="w-4 h-4"></i> ${t('removeStudent')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    changeTreeType: function(id, type) {
        state.students = state.students.map(s => s.id === id ? {...s, treeType: type} : s);
        this.save();
        this.openStudentDetail(id); // Reload modal
    },

    deleteStudent: function(id) {
        if (confirm(t('confirmDelete'))) {
            state.students = state.students.filter(s => s.id !== id);
            this.save();
            this.closeModal();
        }
    },

    // --- Manager Modal ---
    openManagerModal: function() {
        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
                        <h2 class="text-2xl font-bold text-emerald-800 flex items-center gap-2"><i data-lucide="users" class="w-6 h-6"></i> ${t('manage')}</h2>
                        <button onclick="app.closeModal()" class="p-2 hover:bg-emerald-100 rounded-full text-emerald-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    
                    <div class="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                        
                        <!-- Settings -->
                        <section class="space-y-3">
                            <h3 class="font-semibold text-gray-700">${t('settings')}</h3>
                            <div class="flex gap-4">
                                <select onchange="app.updateConfig('language', this.value)" class="flex-1 p-2 bg-gray-100 rounded-lg">
                                    <option value="zh" ${state.config.language === 'zh' ? 'selected' : ''}>中文</option>
                                    <option value="en" ${state.config.language === 'en' ? 'selected' : ''}>English</option>
                                </select>
                                <select onchange="app.updateConfig('treeStyle', this.value)" class="flex-1 p-2 bg-gray-100 rounded-lg">
                                    <option value="flat" ${state.config.treeStyle === 'flat' ? 'selected' : ''}>Flat</option>
                                    <option value="pixel" ${state.config.treeStyle === 'pixel' ? 'selected' : ''}>Pixel</option>
                                    <option value="sketch" ${state.config.treeStyle === 'sketch' ? 'selected' : ''}>Sketch</option>
                                </select>
                            </div>
                        </section>

                        <hr>

                        <!-- Add Student -->
                        <section class="space-y-3">
                            <h3 class="font-semibold text-gray-700">${t('addStudent')}</h3>
                            <div class="flex gap-2">
                                <input type="text" id="new-name" placeholder="Name" class="flex-1 p-2 border rounded-lg">
                                <input type="text" id="new-group" placeholder="Group" class="flex-1 p-2 border rounded-lg">
                                <button onclick="app.addStudent()" class="px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><i data-lucide="plus" class="w-5 h-5"></i></button>
                            </div>
                        </section>

                        <hr>

                        <!-- Import -->
                        <section class="space-y-3">
                            <h3 class="font-semibold text-gray-700">${t('batchImport')}</h3>
                            <textarea id="import-text" class="w-full h-24 p-2 border rounded-lg text-sm bg-gray-50" placeholder="Name, Group (One per line)"></textarea>
                            <button onclick="app.batchImport()" class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">${t('batchImport')}</button>
                        </section>
                        
                         <hr>

                        <!-- Data Control -->
                        <section class="flex justify-between">
                             <button onclick="app.exportCSV()" class="text-blue-600 hover:underline text-sm">${t('exportCSV')}</button>
                             <button onclick="app.resetAll()" class="text-red-600 hover:underline text-sm">${t('resetAll')}</button>
                        </section>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    updateConfig: function(key, value) {
        state.config[key] = value;
        this.save();
        this.openManagerModal(); // Re-render modal to reflect lang changes immediately
    },

    addStudent: function() {
        const nameEl = document.getElementById('new-name');
        const groupEl = document.getElementById('new-group');
        const name = nameEl.value.trim();
        const group = groupEl.value.trim();
        if (!name) return;

        state.students.push({
            id: generateId(),
            name,
            group,
            score: 0,
            treeType: getRandomTreeType(),
            history: [],
            seatIndex: state.students.length
        });
        
        nameEl.value = '';
        groupEl.value = '';
        this.save();
    },

    batchImport: function() {
        const text = document.getElementById('import-text').value;
        if (!text) return;
        const lines = text.split('\n');
        lines.forEach(line => {
            const parts = line.split(/[,\t]+/);
            if (parts[0].trim()) {
                 state.students.push({
                    id: generateId(),
                    name: parts[0].trim(),
                    group: parts[1] ? parts[1].trim() : '',
                    score: 0,
                    treeType: getRandomTreeType(),
                    history: [],
                    seatIndex: state.students.length
                });
            }
        });
        this.save();
        this.closeModal();
        alert(t('importSuccess'));
    },

    exportCSV: function() {
        let csv = "ID,Name,Group,Score,TreeType\n";
        state.students.forEach(s => {
            csv += `${s.id},${s.name},${s.group},${s.score},${s.treeType}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classroom_data.csv';
        a.click();
    },

    resetAll: function() {
        if (confirm(t('confirmReset'))) {
            state.students = [];
            this.save();
            this.closeModal();
        }
    },

    // --- Leaderboard Modal ---
    openLeaderboard: function() {
        const sorted = [...state.students].sort((a,b) => b.score - a.score).slice(0, 5);
        
        // Simple HTML Bar Chart
        const maxScore = sorted[0] ? sorted[0].score : 1;
        const chartHtml = sorted.map((s, i) => {
            const pct = Math.max(5, (s.score / maxScore) * 100);
            return `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-bold text-gray-700">#${i+1} ${s.name}</span>
                        <span class="font-bold text-emerald-600">${s.score}</span>
                    </div>
                    <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                    <div class="p-6 border-b flex justify-between items-center bg-yellow-50">
                        <h2 class="text-2xl font-bold text-yellow-700 flex items-center gap-2"><i data-lucide="trophy" class="w-6 h-6"></i> ${t('topStudents')}</h2>
                        <button onclick="app.closeModal()" class="p-1"><i data-lucide="x" class="w-5 h-5 text-gray-400"></i></button>
                    </div>
                    <div class="p-6">
                        ${state.students.length === 0 ? '<p class="text-center text-gray-400">No data</p>' : chartHtml}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    // --- Lucky Draw ---
    openLuckyDraw: function() {
        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center relative animate-zoom-in">
                   <div class="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
                        <h2 class="text-2xl font-bold flex items-center justify-center gap-2">
                            <i data-lucide="dice-5" class="w-6 h-6"></i> ${t('luckyDrawTitle')}
                        </h2>
                   </div>
                   <div class="p-8">
                       <div id="lucky-display" class="h-24 flex flex-col items-center justify-center mb-6 text-4xl font-bold text-gray-300">
                           ???
                       </div>
                       <button onclick="app.runLuckyDraw()" id="btn-spin"
                         class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all">
                           ${t('luckyDrawBtn')}
                       </button>
                   </div>
                   <button onclick="app.closeModal()" class="absolute top-4 right-4 text-white/80 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    runLuckyDraw: function() {
        if (state.students.length === 0) return;
        const display = document.getElementById('lucky-display');
        const btn = document.getElementById('btn-spin');
        btn.disabled = true;
        btn.classList.add('opacity-50');
        
        let counter = 0;
        const interval = setInterval(() => {
            const randomStudent = state.students[Math.floor(Math.random() * state.students.length)];
            display.textContent = randomStudent.name;
            display.className = "h-24 flex flex-col items-center justify-center mb-6 text-4xl font-bold text-purple-400";
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                const winner = state.students[Math.floor(Math.random() * state.students.length)];
                display.innerHTML = `<div class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 scale-125 transition-transform">${winner.name}</div><div class="text-sm text-gray-400 mt-2">${winner.group || ''}</div>`;
                btn.disabled = false;
                btn.classList.remove('opacity-50');
            }
        }, 100);
    },

    openDailySummary: function() {
        const now = Date.now();
        const startOfDay = new Date().setHours(0,0,0,0);
        
        let total = 0;
        const activeStudents = [];
        
        state.students.forEach(s => {
            const pts = s.history
                .filter(h => h.timestamp >= startOfDay)
                .reduce((acc, h) => acc + h.scoreDelta, 0);
            if (pts !== 0) {
                total += pts;
                activeStudents.push({name: s.name, pts});
            }
        });

        activeStudents.sort((a,b) => b.pts - a.pts);

        const listHtml = activeStudents.slice(0, 3).map((s, i) => `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span class="font-bold text-gray-700">#${i+1} ${s.name}</span>
                <span class="font-bold text-emerald-600">+${s.pts}</span>
            </div>
        `).join('');

        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                        <h2 class="text-2xl font-bold flex items-center gap-2"><i data-lucide="calendar" class="w-6 h-6"></i> ${t('dailySummary')}</h2>
                        <p class="text-emerald-100 opacity-90 mt-1">${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <span class="text-gray-500 text-sm font-medium uppercase tracking-wider">${t('todaysGrowth')}</span>
                            <div class="text-5xl font-black text-emerald-600 mt-2">${total > 0 ? '+' : ''}${total}</div>
                        </div>
                        <div class="space-y-3">
                            ${listHtml || '<p class="text-center text-gray-400">No activity today</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    }
};

// Start App
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});