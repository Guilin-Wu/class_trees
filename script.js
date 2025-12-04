// --- Constants & Config ---

const TRANSLATIONS = {
    en: {
        appTitle: "ClassTree",
        manage: "Manage",
        searchPlaceholder: "Search...",
        selected: "Selected",
        clear: "Clear",
        addStudent: "Add Student",
        batchImport: "Import",
        resetAll: "Reset App",
        points: "pts",
        dailySummary: "Daily Report",
        todaysGrowth: "Today's Growth",
        shopTitle: "Tree Shop",
        buy: "Buy",
        insufficient: "Need more points",
        owned: "Owned",
        qrTitle: "Student Card",
        copyText: "Copy Report",
        settings: "Settings",
        language: "Language",
        season: "Season/Holiday",
        batchDelete: "Batch Delete",
        confirmBatchDelete: "Delete selected students?",
        studentList: "Student List & Batch Manage",
        noStudents: "No students data.",
        auto: "Auto",
        christmas: "Christmas",
        new_year: "New Year",
        sakura: "Sakura"
    },
    zh: {
        appTitle: "班级小树",
        manage: "管理",
        searchPlaceholder: "搜索学生...",
        selected: "已选",
        clear: "取消",
        addStudent: "添加学生",
        batchImport: "批量导入",
        resetAll: "重置所有数据",
        points: "分",
        dailySummary: "今日日报",
        todaysGrowth: "今日成长",
        shopTitle: "积分商店",
        buy: "兑换",
        insufficient: "积分不足",
        owned: "已拥有",
        qrTitle: "学生身份卡",
        copyText: "复制日报文本",
        settings: "系统设置",
        language: "语言切换",
        season: "季节/节日",
        batchDelete: "批量删除",
        confirmBatchDelete: "确定要删除选中的学生吗？",
        studentList: "学生列表与批量管理",
        noStudents: "暂无学生数据",
        auto: "自动",
        christmas: "圣诞节",
        new_year: "新年",
        sakura: "樱花季"
    }
};

const TreeTypes = { OAK: 'Oak', PINE: 'Pine', SAKURA: 'Sakura', BAMBOO: 'Bamboo', APPLE: 'Apple' };

const TreeStages = {
    WITHERED: 'Withered', SEED: 'Seed', SPROUT: 'Sprout', SAPLING: 'Sapling', 
    TREE: 'Tree', MATURE: 'Mature', BLOOMING: 'Blooming'
};

const SHOP_ITEMS = [
    // 经典系列
    { id: 'star', name: '荣耀之星', price: 20, icon: 'star', color: '#fbbf24' },
    { id: 'lantern', name: '喜庆灯笼', price: 15, icon: 'lightbulb', color: '#ef4444' },
    { id: 'ribbon', name: '幸运彩带', price: 10, icon: 'ribbon', color: '#3b82f6' },
    { id: 'bird', name: '早起小鸟', price: 25, icon: 'bird', color: '#0ea5e9' },
    
    // 新增系列
    { id: 'cap', name: '博学博士帽', price: 50, icon: 'graduation-cap', color: '#1e293b' },
    { id: 'heart', name: '爱心气球', price: 30, icon: 'heart', color: '#ec4899' },
    { id: 'cat', name: '调皮小猫', price: 40, icon: 'cat', color: '#f97316' },
    { id: 'cloud', name: '彩虹云朵', price: 35, icon: 'cloud', color: '#8b5cf6' }
];

// --- State Management ---

const state = {
    students: [],
    config: {
        thresholds: {
            [TreeStages.WITHERED]: -999, [TreeStages.SEED]: 0, [TreeStages.SPROUT]: 10, 
            [TreeStages.SAPLING]: 30, [TreeStages.TREE]: 60, [TreeStages.MATURE]: 100, [TreeStages.BLOOMING]: 150
        },
        treeStyle: 'flat',
        language: 'zh',
        forcedSeason: 'auto' // auto, christmas, new_year, sakura
    },
    viewMode: 'grid',
    selectedIds: new Set(),
    searchQuery: '',
    holiday: 'none'
};

// --- Utils ---

function generateId() { return Math.random().toString(36).substr(2, 9); }
function getRandomTreeType() { const types = Object.values(TreeTypes); return types[Math.floor(Math.random() * types.length)]; }
function t(key) { return TRANSLATIONS[state.config.language][key] || key; }

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
    if (state.config.forcedSeason && state.config.forcedSeason !== 'auto') return state.config.forcedSeason;
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();
    if (month === 11 && date >= 15) return 'christmas'; // Xmas
    if (month === 0 || (month === 1 && date <= 20)) return 'new_year'; // CNY
    if (month === 2 || month === 3) return 'sakura'; // Spring
    return 'none';
}

// --- SVG Rendering Logic (最终修复版：挂件内置于缩放组，确保永不错位) ---

function generateTreeSVG(type, stage, style, decorations = []) {
    const holiday = state.holiday;
    let foliage = '#22c55e';
    let trunk = '#78350f';
    let fruit = 'transparent';

    // 1. 颜色定义
    if (stage === TreeStages.WITHERED) {
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
            case TreeTypes.BAMBOO: foliage = '#bef264'; trunk = '#65a30d'; break;
            case TreeTypes.APPLE: foliage = '#4ade80'; fruit = stage === TreeStages.BLOOMING ? '#ef4444' : 'transparent'; break;
            default: foliage = '#22c55e'; trunk = '#78350f';
        }
        if (stage === TreeStages.SEED) foliage = '#854d0e';
        if (holiday === 'new_year' && stage !== TreeStages.WITHERED) foliage = '#dc2626'; 
    }

    // 2. 缩放比例
    let scale = 0.5;
    const scales = { 
        [TreeStages.SEED]: 0.2, [TreeStages.SPROUT]: 0.4, [TreeStages.SAPLING]: 0.6, 
        [TreeStages.TREE]: 0.8, [TreeStages.MATURE]: 1.0, [TreeStages.BLOOMING]: 1.1 
    };
    if (scales[stage]) scale = scales[stage];

    // 3. 树形绘制 & 挂载点设定
    // 我们统一基于"成年大树"的坐标系来思考 (Anchor在 100, 190)
    let shape = '';
    
    // leafCenterOffset: 叶子中心相对于树根(190)的距离。负数表示向上。
    // spread: 挂件随机散布的范围半径
    let leafCenterOffset = -100; 
    let spread = 40; 

    if (stage === TreeStages.SEED) {
        shape = `<ellipse cx="100" cy="180" rx="10" ry="6" fill="${trunk}" />`;
    } else if (stage === TreeStages.SPROUT) {
         // 小树苗比较矮，叶子离地面很近
         leafCenterOffset = -15; 
         spread = 15; // 挂件分布要紧凑一点
         shape = `<g transform="translate(100, 180)">
                    <path d="M0,0 Q-10,-20 -20,-25 Q-5,-25 0,0" fill="${foliage}" />
                    <path d="M0,0 Q10,-20 20,-25 Q5,-25 0,0" fill="${foliage}" />
                  </g>`;
    } else {
         const isBamboo = type === TreeTypes.BAMBOO;
         const isPine = type === TreeTypes.PINE;
         
         if (isBamboo) {
             leafCenterOffset = -70; spread = 20;
             shape = `<g><rect x="90" y="50" width="8" height="140" fill="${trunk}" rx="2" /><rect x="102" y="70" width="8" height="120" fill="${trunk}" rx="2" /><ellipse cx="80" cy="60" rx="20" ry="8" fill="${foliage}" transform="rotate(-30 80 60)" /><ellipse cx="120" cy="80" rx="20" ry="8" fill="${foliage}" transform="rotate(30 120 80)" /></g>`;
         } else if (isPine) {
             leafCenterOffset = -80; spread = 35;
             shape = `<g><path d="M100,190 Q80,150 90,100 Q80,50 100,40 Q120,50 110,100 Q120,150 100,190 Z" fill="${trunk}" /><g transform="translate(100, 40)"><path d="M0,-80 L-40,20 L40,20 Z" fill="${foliage}" /><path d="M0,-50 L-50,60 L50,60 Z" fill="${foliage}" /><path d="M0,-20 L-60,100 L60,100 Z" fill="${foliage}" /></g></g>`;
         } else {
             // 圆冠树 (Oak, Apple, Sakura)
             leafCenterOffset = -100; spread = 45;
             shape = `<g><path d="M100,190 Q80,150 90,100 Q80,50 100,40 Q120,50 110,100 Q120,150 100,190 Z" fill="${trunk}" /><g transform="translate(100, 70)"><circle cx="-30" cy="10" r="30" fill="${foliage}" /><circle cx="30" cy="10" r="30" fill="${foliage}" /><circle cx="0" cy="-30" r="40" fill="${foliage}" /><circle cx="-20" cy="-10" r="35" fill="${foliage}" /><circle cx="20" cy="-10" r="35" fill="${foliage}" /></g></g>`;
             if (fruit !== 'transparent') shape += `<circle cx="80" cy="70" r="4" fill="${fruit}" /><circle cx="120" cy="60" r="4" fill="${fruit}" />`;
         }
    }

    // 4. 生成挂件 (现在，我们把挂件当作树的一部分来生成)
    let decorSVG = '';
    if (stage !== TreeStages.SEED && stage !== TreeStages.WITHERED && decorations && decorations.length > 0) {
        decorations.forEach((itemId, idx) => {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return;

            // 简单的随机算法，保证位置固定
            const hash = (str) => str.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
            const r1 = Math.abs(hash(itemId + idx) % 100); 

            // 计算坐标：以 (100, 190) 为基准点，加上偏移量
            // ox: 水平偏移 (-spread/2 到 +spread/2)
            // oy: 垂直偏移 (leafCenterOffset 附近波动)
            const ox = (r1 % spread) - (spread / 2); 
            const oy = leafCenterOffset + ((r1 % (spread * 0.8)) - (spread * 0.4)); 

            // 对于小树苗(Sprout)，我们可以把挂件稍微画大一点(itemScale)，不然缩放后看不清
            // 但位置绝对是紧贴树叶的
            const itemScale = (stage === TreeStages.SPROUT) ? 1.5 : 1.0;

            // 这里的坐标 (100+ox, 190+oy) 是相对于"原尺寸树"的坐标
            const transform = `translate(${100+ox}, ${190+oy}) scale(${itemScale})`;

            if (itemId === 'star') {
                decorSVG += `<path transform="${transform}" d="M0,-10 L2,-3 L9,-3 L3,1 L5,8 L0,4 L-5,8 L-3,1 L-9,-3 L-2,-3 Z" fill="${item.color}" stroke="white" stroke-width="1"/>`;
            } else if (itemId === 'lantern') {
                decorSVG += `<g transform="${transform}"><line x1="0" y1="-10" x2="0" y2="0" stroke="#fca5a5" /><rect x="-6" y="0" width="12" height="14" rx="2" fill="${item.color}" /><line x1="0" y1="14" x2="0" y2="20" stroke="${item.color}" /></g>`;
            } else if (itemId === 'ribbon') {
                decorSVG += `<path transform="${transform}" d="M-10,-5 Q0,5 10,-5" stroke="${item.color}" stroke-width="3" fill="none" />`;
            } else if (itemId === 'bird') {
                 decorSVG += `<circle cx="0" cy="0" r="4" fill="${item.color}" transform="${transform}" />`;
            } 
            // 新增挂件
            else if (itemId === 'cap') { 
                 decorSVG += `<g transform="${transform} scale(0.8)"><path d="M-15,0 L0,-8 L15,0 L0,8 Z" fill="${item.color}" /><path d="M15,0 L15,3" stroke="#f59e0b" stroke-width="2"/><rect x="-10" y="0" width="20" height="8" rx="2" fill="${item.color}"/></g>`;
            } else if (itemId === 'heart') { 
                 decorSVG += `<path transform="${transform} scale(0.8)" d="M0,5 L-5,0 A3,3 0 0,1 0,-5 A3,3 0 0,1 5,0 Z" fill="${item.color}" stroke="white" stroke-width="0.5"/>`;
            } else if (itemId === 'cat') { 
                 decorSVG += `<g transform="${transform}"><circle cx="0" cy="0" r="6" fill="${item.color}"/><polygon points="-5,-4 -8,-10 -2,-6" fill="${item.color}"/><polygon points="5,-4 8,-10 2,-6" fill="${item.color}"/><circle cx="-2" cy="-1" r="1" fill="white"/><circle cx="2" cy="-1" r="1" fill="white"/></g>`;
            } else if (itemId === 'cloud') {
                 decorSVG += `<path transform="${transform} scale(0.7)" d="M-10,0 Q-10,-8 0,-8 Q5,-12 10,-8 Q15,-8 15,0 Z" fill="${item.color}" opacity="0.8"/>`;
            }
        });
    }

    // 关键修正点：decorSVG 必须在 <g> 内部！
    return `<svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-md">
                <ellipse cx="100" cy="190" rx="60" ry="10" fill="rgba(0,0,0,0.15)" />
                <g transform="translate(100, 190) scale(${scale}) translate(-100, -190)">
                    ${shape}
                    ${decorSVG}
                </g>
            </svg>`;
}

// --- App Logic ---

const app = {
    init: function() {
        const savedStudents = localStorage.getItem('classTree_students');
        if (savedStudents) state.students = JSON.parse(savedStudents);
        
        // Data Migration for V2 (add decorations array if missing)
        state.students.forEach(s => { if (!s.decorations) s.decorations = []; });

        const savedConfig = localStorage.getItem('classTree_config');
        if (savedConfig) state.config = JSON.parse(savedConfig);

        state.holiday = getSeasonalHoliday();
        this.renderHeader();
        this.renderGrid();
        
        // Listeners
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            this.renderGrid();
        });

        document.querySelectorAll('#view-toggles button').forEach(btn => {
            btn.addEventListener('click', () => {
                state.viewMode = btn.dataset.mode;
                this.updateViewToggles(btn);
                this.renderGrid();
            });
        });

        document.getElementById('btn-manage').addEventListener('click', () => this.openManagerModal());
        document.getElementById('btn-stats').addEventListener('click', () => this.openLeaderboard());
        document.getElementById('btn-lucky').addEventListener('click', () => this.openLuckyDraw());
        document.getElementById('btn-daily').addEventListener('click', () => this.openDailySummary());
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
        
        lucide.createIcons();
    },

    save: function() {
        localStorage.setItem('classTree_students', JSON.stringify(state.students));
        localStorage.setItem('classTree_config', JSON.stringify(state.config));
        this.renderGrid();
    },

    updateViewToggles: function(activeBtn) {
        document.querySelectorAll('#view-toggles button').forEach(b => {
            b.classList.remove('bg-white', 'shadow', 'text-emerald-600');
            b.classList.add('text-gray-400');
        });
        activeBtn.classList.add('bg-white', 'shadow', 'text-emerald-600');
        activeBtn.classList.remove('text-gray-400');
    },

    renderHeader: function() {
        document.getElementById('app-title').textContent = t('appTitle');
        document.getElementById('search-input').placeholder = t('searchPlaceholder');
        document.getElementById('lbl-manage').textContent = t('manage');
        document.getElementById('lbl-selected').textContent = t('selected');
        document.getElementById('lbl-clear').textContent = t('clear');
    },

    renderGrid: function() {
        const container = document.getElementById('main-container');
        container.innerHTML = '';
        const filtered = state.students.filter(s => s.name.toLowerCase().includes(state.searchQuery.toLowerCase()));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center py-24 text-gray-400"><p>未找到学生</p></div>`;
            return;
        }

        if (state.viewMode === 'forest') {
            // Group Forest View - Separate into 4 quadrants/zones if groups match
            const groups = {};
            filtered.forEach(s => {
                const g = s.group || 'Default';
                if (!groups[g]) groups[g] = [];
                groups[g].push(s);
            });

            let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-8">';
            Object.entries(groups).forEach(([name, students], idx) => {
                const bgColors = ['bg-emerald-50', 'bg-teal-50', 'bg-green-50', 'bg-lime-50'];
                const bg = bgColors[idx % 4];
                html += `
                    <div class="${bg} rounded-3xl p-6 border border-emerald-100 shadow-inner min-h-[300px]">
                        <h3 class="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                             <i data-lucide="trees" class="w-5 h-5"></i> ${name} Forest
                        </h3>
                        <div class="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            ${students.map(s => this.createStudentCard(s)).join('')}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

        } else if (state.viewMode === 'seats') {
            // Seat Map View
            container.innerHTML = `
                <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm overflow-x-auto">
                     <div class="text-center mb-8 border-b pb-2"><span class="bg-gray-800 text-white px-8 py-1 rounded text-sm">讲台 (Podium)</span></div>
                     <div class="grid grid-cols-6 gap-6 min-w-[800px] justify-items-center">
                         ${filtered.map(s => this.createSeatCard(s)).join('')}
                     </div>
                </div>`;
        } else {
            // Grid
            container.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                ${filtered.map(s => this.createStudentCard(s)).join('')}
            </div>`;
        }

        lucide.createIcons();
        this.updateBatchBar();
    },

    createSeatCard: function(student) {
        const stage = getStage(student.score);
        return `
            <div onclick="app.openStudentDetail('${student.id}')" 
                 class="w-24 h-24 bg-orange-50 border-2 border-orange-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors relative shadow-sm hover:shadow-md">
                <span class="text-xs text-orange-300 font-bold absolute top-1 left-1">Seat</span>
                <div class="w-8 h-8 mb-1">${generateTreeSVG(student.treeType, stage, 'flat', student.decorations)}</div>
                <div class="font-bold text-gray-700 text-sm truncate w-full text-center px-1">${student.name}</div>
                <div class="text-[10px] text-emerald-600 font-bold">${student.score}</div>
            </div>
        `;
    },


    toggleSelection: function(id) {
        if (state.selectedIds.has(id)) state.selectedIds.delete(id);
        else state.selectedIds.add(id);
        this.renderGrid();
    },

    clearSelection: function() { state.selectedIds.clear(); this.renderGrid(); },
    
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

    batchCustomScore: function() {
        const val = parseInt(document.getElementById('batch-custom-score').value);
        if (!isNaN(val) && val !== 0) this.batchScore(val);
    },

    applyScore: function(ids, delta, reason) {
        const now = Date.now();
        state.students = state.students.map(s => {
            if (ids.includes(s.id)) {
                return {
                    ...s,
                    score: s.score + delta,
                    history: [{ id: generateId(), timestamp: now, scoreDelta: delta, reason }, ...s.history]
                };
            }
            return s;
        });
        this.save();
    },

    // --- Detail Modal with Custom Input & QR ---
    openStudentDetail: function(id) {
        const student = state.students.find(s => s.id === id);
        if (!student) return;
        const stage = getStage(student.score);
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle, student.decorations);
        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                    <div class="md:w-1/2 p-8 bg-gradient-to-br from-emerald-50 to-sky-100 relative flex flex-col items-center">
                        <div class="w-full h-64">${svg}</div>
                        <h2 class="text-4xl font-black text-gray-800 mt-4">${student.name}</h2>
                        <div class="mt-2 text-2xl font-bold text-emerald-600">${student.score} pts</div>
                        
                        <button onclick="app.showQR('${student.id}')" class="mt-4 flex items-center gap-1 text-xs bg-white/80 px-3 py-1 rounded-full text-gray-600 hover:bg-white shadow-sm">
                            <i data-lucide="qr-code" class="w-4 h-4"></i> 学生身份码
                        </button>
                    </div>

                    <div class="md:w-1/2 bg-white flex flex-col p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-gray-500 uppercase">Control</h3>
                            <button onclick="app.closeModal()"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-2 mb-4">
                            <button onclick="app.applyScore(['${id}'], 1, '表现好')" class="p-2 border rounded hover:bg-emerald-50 text-emerald-700 font-bold">+1</button>
                            <button onclick="app.applyScore(['${id}'], 5, '大进步')" class="p-2 border rounded hover:bg-emerald-50 text-emerald-700 font-bold">+5</button>
                            <button onclick="app.applyScore(['${id}'], -1, '待改进')" class="p-2 border rounded hover:bg-red-50 text-red-700 font-bold">-1</button>
                            <button onclick="app.deleteStudent('${id}')" class="p-2 border rounded hover:bg-gray-100 text-gray-500"><i data-lucide="trash-2" class="w-4 h-4 mx-auto"></i></button>
                        </div>
                        
                        <div class="flex gap-2 mb-6">
                            <input type="text" id="custom-reason" placeholder="理由" class="flex-1 p-2 border rounded text-sm">
                            <input type="number" id="custom-val" placeholder="+/-" class="w-20 p-2 border rounded text-sm">
                            <button onclick="app.applyCustom('${id}')" class="px-4 bg-slate-800 text-white rounded hover:bg-slate-700">OK</button>
                        </div>

                        <h4 class="font-bold text-gray-800 mb-2 text-sm">History</h4>
                        <div class="overflow-y-auto flex-1 text-sm space-y-2">
                            ${student.history.slice(0, 8).map(h => `
                                <div class="flex justify-between border-b pb-1">
                                    <span class="text-gray-600">${h.reason || 'Bonus'}</span>
                                    <span class="${h.scoreDelta>0?'text-emerald-600':'text-red-500'} font-bold">${h.scoreDelta>0?'+':''}${h.scoreDelta}</span>
                                </div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    applyCustom: function(id) {
        const reason = document.getElementById('custom-reason').value || "Custom";
        const val = parseInt(document.getElementById('custom-val').value);
        if (!isNaN(val) && val !== 0) {
            this.applyScore([id], val, reason);
            this.openStudentDetail(id);
        }
    },

    // --- QR Code Modal ---
    showQR: function(id) {
        const student = state.students.find(s => s.id === id);
        // Generates a QR containing student data as JSON (or a URL if you host this)
        const qrData = `ClassTree Student Card\nName: ${student.name}\nScore: ${student.score}\nGroup: ${student.group}`;
        
        const html = `
             <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md" onclick="if(event.target === this) document.getElementById('qr-modal').remove()">
                <div id="qr-modal" class="bg-white rounded-2xl p-8 text-center animate-zoom-in max-w-xs w-full">
                    <h3 class="text-xl font-bold mb-4">${student.name}</h3>
                    <div id="qrcode" class="flex justify-center mb-4"></div>
                    <p class="text-sm text-gray-500">扫码查看当前成长值</p>
                    <button onclick="document.getElementById('qr-modal').remove()" class="mt-6 text-gray-400 hover:text-gray-600">Close</button>
                </div>
             </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        
        // Use QRCode.js library
        new QRCode(document.getElementById("qrcode"), {
            text: qrData,
            width: 180,
            height: 180,
            colorDark : "#059669",
            colorLight : "#ffffff",
        });
    },

    // --- Shop System ---
    openShop: function() {
        if (state.selectedIds.size !== 1) {
            alert("请先选择一位学生进入商店 (Select one student first)");
            return;
        }
        const studentId = [...state.selectedIds][0];
        const student = state.students.find(s => s.id === studentId);
        
        const itemsHtml = SHOP_ITEMS.map(item => {
            const hasItem = student.decorations && student.decorations.includes(item.id);
            return `
                <div class="border rounded-xl p-4 flex flex-col items-center gap-2 ${hasItem ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-emerald-400'}">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style="background:${item.color}">
                        <i data-lucide="${item.icon}"></i>
                    </div>
                    <div class="font-bold text-gray-700">${item.name}</div>
                    <div class="text-emerald-600 font-bold text-sm">${item.price} pts</div>
                    <button onclick="app.buyItem('${student.id}', '${item.id}', ${item.price})" 
                        class="w-full py-1 rounded text-xs font-bold ${hasItem ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}"
                        ${hasItem ? 'disabled' : ''}>
                        ${hasItem ? t('owned') : t('buy')}
                    </button>
                </div>
            `;
        }).join('');

        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                    <div class="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-bold text-amber-800 flex items-center gap-2"><i data-lucide="store" class="w-5 h-5"></i> ${t('shopTitle')}</h2>
                            <p class="text-xs text-amber-600 mt-1">为 ${student.name} 兑换装饰 (当前: ${student.score} 分)</p>
                        </div>
                        <button onclick="app.closeModal()"><i data-lucide="x" class="w-5 h-5 text-amber-800"></i></button>
                    </div>
                    <div class="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    buyItem: function(studentId, itemId, price) {
        const student = state.students.find(s => s.id === studentId);
        if (student.score < price) {
            alert(t('insufficient'));
            return;
        }
        if (!confirm(`花费 ${price} 分兑换? (Spend ${price}?)`)) return;

        // Transaction
        student.score -= price;
        if (!student.decorations) student.decorations = [];
        student.decorations.push(itemId);
        student.history.unshift({ id: generateId(), timestamp: Date.now(), scoreDelta: -price, reason: `Shop: ${itemId}` });
        
        this.save();
        this.openShop(); // refresh UI
    },

    // --- Daily Summary (Enhanced) ---
    openDailySummary: function() {
        const now = Date.now();
        const startOfDay = new Date().setHours(0,0,0,0);
        
        let totalGain = 0;
        const activeList = [];

        state.students.forEach(s => {
            const dayDelta = s.history.filter(h => h.timestamp >= startOfDay).reduce((acc, h) => acc + h.scoreDelta, 0);
            if (dayDelta !== 0) {
                totalGain += dayDelta;
                activeList.push({ name: s.name, delta: dayDelta });
            }
        });
        
        activeList.sort((a,b) => b.delta - a.delta);

        // Generate Report Text
        const dateStr = new Date().toLocaleDateString();
        const reportText = `【班级小树成长日报 ${dateStr}】\n今日全班共成长: ${totalGain} 分\n🌟 表现突出: ${activeList.slice(0,3).map(s=>s.name).join(', ')}\n🌱 继续加油!`;

        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                    <div class="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                        <h2 class="text-2xl font-bold flex items-center gap-2"><i data-lucide="file-text" class="w-6 h-6"></i> ${t('dailySummary')}</h2>
                    </div>
                    <div class="p-6">
                        <textarea class="w-full bg-gray-50 border rounded p-3 text-sm h-32 mb-4" readonly>${reportText}</textarea>
                        <button onclick="navigator.clipboard.writeText(\`${reportText}\`); alert('已复制')" class="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2">
                            <i data-lucide="copy" class="w-4 h-4"></i> ${t('copyText')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
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
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle, student.decorations);
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

    // --- 新增：带有批量管理的管理面板 ---
    openManagerModal: function() {
        const studentListHtml = state.students.map(s => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded border mb-2">
                <div class="flex items-center gap-3">
                    <input type="checkbox" class="batch-delete-check w-4 h-4 text-emerald-600 rounded" value="${s.id}">
                    <span class="font-medium text-gray-700">${s.name}</span>
                    <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded border">${s.group || '-'}</span>
                </div>
                <button onclick="app.deleteStudent('${s.id}')" class="text-red-400 hover:text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');

        const html = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
                    
                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50 shrink-0">
                        <h2 class="text-xl font-bold text-emerald-800 flex items-center gap-2">
                            <i data-lucide="settings-2" class="w-5 h-5"></i> ${t('manage')}
                        </h2>
                        <button onclick="app.closeModal()" class="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    
                    <div class="p-6 overflow-y-auto space-y-8">
                        
                        <section class="space-y-3">
                            <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide border-l-4 border-emerald-500 pl-2">${t('settings')}</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1">${t('language')}</label>
                                    <select onchange="app.updateConfig('language', this.value)" class="w-full p-2 bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-emerald-300 transition-all text-sm">
                                        <option value="zh" ${state.config.language === 'zh' ? 'selected' : ''}>中文 (Chinese)</option>
                                        <option value="en" ${state.config.language === 'en' ? 'selected' : ''}>English</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1">${t('season')}</label>
                                    <select onchange="app.updateConfig('forcedSeason', this.value)" class="w-full p-2 bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-emerald-300 transition-all text-sm">
                                        <option value="auto" ${state.config.forcedSeason === 'auto' ? 'selected' : ''}>${t('auto')}</option>
                                        <option value="christmas" ${state.config.forcedSeason === 'christmas' ? 'selected' : ''}>${t('christmas')}</option>
                                        <option value="new_year" ${state.config.forcedSeason === 'new_year' ? 'selected' : ''}>${t('new_year')}</option>
                                        <option value="sakura" ${state.config.forcedSeason === 'sakura' ? 'selected' : ''}>${t('sakura')}</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section class="space-y-3">
                            <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide border-l-4 border-blue-500 pl-2">${t('addStudent')}</h3>
                            <div class="flex gap-2">
                                <input type="text" id="add-name" placeholder="Name" class="flex-1 p-2 border rounded-lg text-sm">
                                <input type="text" id="add-group" placeholder="Group" class="flex-1 p-2 border rounded-lg text-sm">
                                <button onclick="app.addStudentSimple()" class="px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold text-sm">OK</button>
                            </div>
                            <div class="pt-2">
                                <textarea id="import-text" class="w-full h-16 p-2 border rounded-lg text-xs bg-gray-50" placeholder="Batch Import: Name, Group (One per line)"></textarea>
                                <button onclick="app.batchImport()" class="mt-2 w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 text-sm font-medium">${t('batchImport')}</button>
                            </div>
                        </section>

                        <section class="space-y-3">
                            <div class="flex justify-between items-end">
                                <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide border-l-4 border-purple-500 pl-2">${t('studentList')}</h3>
                                <button onclick="app.runBatchDelete()" class="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 font-bold">${t('batchDelete')}</button>
                            </div>
                            <div class="max-h-60 overflow-y-auto border rounded-xl p-2 bg-white custom-scrollbar">
                                ${state.students.length > 0 ? studentListHtml : `<p class="text-center text-gray-400 text-sm py-4">${t('noStudents')}</p>`}
                            </div>
                        </section>
                        
                         <section class="pt-4 border-t">
                             <button onclick="app.resetAll()" class="w-full text-red-500 hover:text-red-700 text-xs font-medium">${t('resetAll')}</button>
                        </section>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    // --- 新增：批量删除逻辑 ---
    runBatchDelete: function() {
        const checkboxes = document.querySelectorAll('.batch-delete-check:checked');
        if (checkboxes.length === 0) return;
        
        if (confirm(`${t('confirmBatchDelete')} (${checkboxes.length})`)) {
            const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
            state.students = state.students.filter(s => !idsToDelete.includes(s.id));
            this.save();
            this.openManagerModal(); // 刷新列表
        }
    },

    // --- 修复：配置更新后强制刷新所有UI ---
    updateConfig: function(key, value) {
        state.config[key] = value;
        if (key === 'language') {
            this.renderHeader(); // 立即刷新头部文字
        }
        state.holiday = getSeasonalHoliday(); // 重新计算节日
        this.save();
        this.openManagerModal(); // 重新打开模态框以刷新模态框内的语言
        this.renderGrid(); // 刷新主网格
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