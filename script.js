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
    // --- 经典系列 ---
    { id: 'star', name: '荣耀之星', price: 20, icon: 'star', color: '#fbbf24' },
    { id: 'lantern', name: '喜庆灯笼', price: 15, icon: 'lightbulb', color: '#ef4444' },
    { id: 'ribbon', name: '幸运彩带', price: 10, icon: 'ribbon', color: '#3b82f6' },
    { id: 'bird', name: '早起小鸟', price: 25, icon: 'bird', color: '#0ea5e9' },

    // --- 进阶系列 ---
    { id: 'cap', name: '博学博士帽', price: 50, icon: 'graduation-cap', color: '#1e293b' },
    { id: 'heart', name: '爱心气球', price: 30, icon: 'heart', color: '#ec4899' },
    { id: 'cat', name: '调皮小猫', price: 40, icon: 'cat', color: '#f97316' },
    { id: 'cloud', name: '彩虹云朵', price: 35, icon: 'cloud', color: '#8b5cf6' },

    // --- 新增：趣味与物理系列 ---
    { id: 'atom', name: '物理之核', price: 60, icon: 'atom', color: '#6366f1' }, // ⚛️ 物理老师专属
    { id: 'crown', name: '班级皇冠', price: 100, icon: 'crown', color: '#f59e0b' },
    { id: 'sword', name: '勇者之剑', price: 45, icon: 'sword', color: '#94a3b8' },
    { id: 'shield', name: '守护盾牌', price: 45, icon: 'shield', color: '#ef4444' },
    { id: 'potion', name: '能量药水', price: 25, icon: 'flask-conical', color: '#10b981' },
    { id: 'glasses', name: '酷酷墨镜', price: 30, icon: 'glasses', color: '#111827' },

    { id: 'formula_e', name: '能量方程', price: 80, icon: 'zap', color: '#8b5cf6', isText: 'E=mc²' },
    { id: 'formula_f', name: '牛顿第二定律', price: 70, icon: 'move', color: '#3b82f6', isText: 'F=ma' },
    { id: 'magnet', name: '磁感线', price: 50, icon: 'magnet', color: '#ef4444' },
    { id: 'pulley', name: '定滑轮', price: 40, icon: 'circle-dot', color: '#64748b' }

];

const ACHIEVEMENTS = {
    'trophy': { id: 'trophy', icon: 'trophy', name: '百里挑一', desc: '积分突破 100 分', color: '#f59e0b' },
    'fire': { id: 'fire', icon: 'flame', name: '热火朝天', desc: '连续 3 天有加分', color: '#ef4444' },
    'shield': { id: 'shield', icon: 'shield-check', name: '全勤卫士', desc: '累计活跃天数达 5 天', color: '#10b981' }
};

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

function generateTreeSVG(type, stage, style = 'flat', decorations = []) {
    const holiday = state.holiday;
    let foliage = '#22c55e';
    let trunk = '#78350f';
    let fruit = 'transparent';

    // --- 1. 颜色与节日逻辑 (修复樱花季) ---
    if (stage === TreeStages.WITHERED) {
        foliage = '#a8a29e'; trunk = '#57534e';
    } else {
        // 默认颜色
        switch (type) {
            case TreeTypes.SAKURA: foliage = '#fbcfe8'; trunk = '#5D4037'; break; // 樱花树本身就是粉的
            case TreeTypes.PINE: foliage = '#15803d'; trunk = '#3E2723'; break;
            case TreeTypes.BAMBOO: foliage = '#bef264'; trunk = '#65a30d'; break;
            default: foliage = '#22c55e'; trunk = '#78350f';
        }

        // 节日覆盖逻辑 (优先级更高)
        if (holiday === 'sakura') {
            // 🌸 樱花季：除了松树和竹子保持原样外，其他树都变成粉色氛围
            if (type !== TreeTypes.PINE && type !== TreeTypes.BAMBOO) {
                foliage = '#f9a8d4'; // 统一变成好看的粉色
            }
        } else if (holiday === 'christmas' && type === TreeTypes.PINE) {
            foliage = '#0f5132'; // 圣诞树深绿
        } else if (holiday === 'new_year') {
            foliage = '#dc2626'; // 新年红
        }

        if (stage === TreeStages.SEED) foliage = '#854d0e';
        if (type === TreeTypes.APPLE && stage === TreeStages.BLOOMING) fruit = '#ef4444';
    }

    // --- 2. 风格定义 ---
    let filters = '';
    let strokeStyle = '';
    let shapeRendering = 'auto';

    if (style === 'pixel') {
        shapeRendering = 'optimizeSpeed';
    } else if (style === 'realistic') {
        filters = `<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>`;
        strokeStyle = 'filter="url(#shadow)"';
    }

    // --- 3. 基础树形 ---
    let scale = 0.5;
    const scales = { [TreeStages.SEED]: 0.2, [TreeStages.SPROUT]: 0.4, [TreeStages.SAPLING]: 0.6, [TreeStages.TREE]: 0.8, [TreeStages.MATURE]: 1.0, [TreeStages.BLOOMING]: 1.1 };
    if (scales[stage]) scale = scales[stage];

    let shape = '';
    let decorCenterY = -100;

    // 辅助绘图
    const drawLeaf = (cx, cy, r, color) => {
        if (style === 'pixel') return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${color}" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" ${style === 'realistic' ? 'fill-opacity="0.9"' : ''} />`;
    };

    if (stage === TreeStages.SEED) {
        shape = `<ellipse cx="100" cy="180" rx="10" ry="6" fill="${trunk}" />`;
    } else if (stage === TreeStages.SPROUT) {
        decorCenterY = -20;
        shape = `<g transform="translate(100, 180)"><path d="M0,0 Q-10,-20 -20,-25 Q-5,-25 0,0" fill="${foliage}" /><path d="M0,0 Q10,-20 20,-25 Q5,-25 0,0" fill="${foliage}" /></g>`;
    } else {
        const isBamboo = type === TreeTypes.BAMBOO;
        const isPine = type === TreeTypes.PINE;

        if (isBamboo) {
            decorCenterY = -80;
            shape = `<g><rect x="90" y="50" width="8" height="140" fill="${trunk}" rx="${style === 'pixel' ? 0 : 2}" /><rect x="102" y="70" width="8" height="120" fill="${trunk}" rx="${style === 'pixel' ? 0 : 2}" /><ellipse cx="80" cy="60" rx="20" ry="8" fill="${foliage}" transform="rotate(-30 80 60)" /><ellipse cx="120" cy="80" rx="20" ry="8" fill="${foliage}" transform="rotate(30 120 80)" /></g>`;
        } else if (isPine) {
            decorCenterY = -80;
            shape = `<g ${strokeStyle}><path d="M100,190 Q80,150 90,100 Q80,50 100,40 Q120,50 110,100 Q120,150 100,190 Z" fill="${trunk}" /><g transform="translate(100, 40)"><path d="M0,-80 L-40,20 L40,20 Z" fill="${foliage}" /><path d="M0,-50 L-50,60 L50,60 Z" fill="${foliage}" /><path d="M0,-20 L-60,100 L60,100 Z" fill="${foliage}" /></g></g>`;
        } else {
            decorCenterY = -100;
            shape = `<g ${strokeStyle}><path d="M100,190 Q80,150 90,100 Q80,50 100,40 Q120,50 110,100 Q120,150 100,190 Z" fill="${trunk}" /><g transform="translate(100, 70)">${drawLeaf(-30, 10, 30, foliage)}${drawLeaf(30, 10, 30, foliage)}${drawLeaf(0, -30, 40, foliage)}${drawLeaf(-20, -10, 35, foliage)}${drawLeaf(20, -10, 35, foliage)}</g></g>`;
            if (fruit !== 'transparent') shape += `<circle cx="80" cy="70" r="4" fill="${fruit}" /><circle cx="120" cy="60" r="4" fill="${fruit}" />`;
        }
    }

    // --- 4. 节日氛围装饰 (树根处的落花) ---
    let groundEffect = '';
    if (holiday === 'sakura' && stage !== TreeStages.WITHERED && stage !== TreeStages.SEED) {
        groundEffect = `
            <g opacity="0.6">
                <circle cx="80" cy="195" r="3" fill="#fbcfe8" />
                <circle cx="120" cy="192" r="2" fill="#fbcfe8" />
                <circle cx="95" cy="198" r="2.5" fill="#fbcfe8" />
                <path d="M60,180 Q65,190 70,200" stroke="#fbcfe8" stroke-width="2" opacity="0.5" fill="none"/>
            </g>
        `;
    }

    // --- 5. 挂件绘制 (螺旋分散) ---
    let decorSVG = '';
    if (stage !== TreeStages.SEED && stage !== TreeStages.WITHERED && decorations && decorations.length > 0) {
        const goldenAngle = 137.508;
        const baseRadius = 26;

        decorations.forEach((itemId, idx) => {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return;

            const r = baseRadius * Math.sqrt(idx + 1) * 0.85;
            const theta = idx * goldenAngle * (Math.PI / 180);
            const ox = r * Math.cos(theta);
            const oy = r * Math.sin(theta) + decorCenterY;

            let finalOx = ox;
            let finalOy = oy;

            if (stage === TreeStages.SPROUT) {
                finalOx = ox * 0.4;
                finalOy = -20 + (r * Math.sin(theta) * 0.4);
            }

            const itemScale = (stage === TreeStages.SPROUT) ? 1.5 : 1.0;
            const transform = `translate(${100 + finalOx}, ${190 + finalOy}) scale(${itemScale})`;
            let path = '';


            // 绘制挂件图形
            if (itemId === 'star') path = `<path d="M0,-10 L2,-3 L9,-3 L3,1 L5,8 L0,4 L-5,8 L-3,1 L-9,-3 L-2,-3 Z" fill="${item.color}" stroke="white" stroke-width="1"/>`;
            else if (itemId === 'lantern') path = `<g><line x1="0" y1="-10" x2="0" y2="0" stroke="#fca5a5" /><rect x="-6" y="0" width="12" height="14" rx="2" fill="${item.color}" /><line x1="0" y1="14" x2="0" y2="20" stroke="${item.color}" /></g>`;
            else if (itemId === 'bird') path = `<circle cx="0" cy="0" r="4" fill="${item.color}" />`;
            else if (itemId === 'ribbon') path = `<path d="M-10,-5 Q0,5 10,-5" stroke="${item.color}" stroke-width="3" fill="none" />`;
            else if (itemId === 'cap') path = `<g transform="scale(0.8)"><path d="M-15,0 L0,-8 L15,0 L0,8 Z" fill="${item.color}" /><rect x="-10" y="0" width="20" height="8" rx="2" fill="${item.color}"/></g>`;
            else if (itemId === 'heart') path = `<path d="M0,5 L-5,0 A3,3 0 0,1 0,-5 A3,3 0 0,1 5,0 Z" fill="${item.color}" stroke="white" stroke-width="0.5"/>`;
            else if (itemId === 'cat') path = `<g><circle cx="0" cy="0" r="6" fill="${item.color}"/><polygon points="-5,-4 -8,-10 -2,-6" fill="${item.color}"/><polygon points="5,-4 8,-10 2,-6" fill="${item.color}"/></g>`;
            else if (itemId === 'cloud') path = `<path d="M-10,0 Q-10,-8 0,-8 Q5,-12 10,-8 Q15,-8 15,0 Z" fill="${item.color}" opacity="0.8"/>`;

            // --- 新增挂件的 SVG 路径 ---
            else if (itemId === 'atom') { // ⚛️ 物理原子
                path = `<g transform="scale(0.8)" stroke="${item.color}" stroke-width="1.5" fill="none">
                          <ellipse cx="0" cy="0" rx="10" ry="3" transform="rotate(0)"/>
                          <ellipse cx="0" cy="0" rx="10" ry="3" transform="rotate(60)"/>
                          <ellipse cx="0" cy="0" rx="10" ry="3" transform="rotate(120)"/>
                          <circle cx="0" cy="0" r="2" fill="${item.color}" stroke="none"/>
                        </g>`;
            }
            else if (itemId === 'crown') { // 👑 皇冠
                path = `<polygon points="-8,5 -8,-2 -4,2 0,-5 4,2 8,-2 8,5" fill="${item.color}" stroke="white" stroke-width="0.5"/>`;
            }
            else if (itemId === 'sword') { // ⚔️ 宝剑
                path = `<g transform="rotate(-45)"><rect x="-1" y="-8" width="2" height="12" fill="${item.color}" /><rect x="-3" y="1" width="6" height="1" fill="#475569" /><circle cx="0" cy="5" r="1.5" fill="#475569" /></g>`;
            }
            else if (itemId === 'shield') { // 🛡️ 盾牌
                path = `<path d="M-6,-6 L6,-6 L6,0 Q6,6 0,8 Q-6,6 -6,0 Z" fill="${item.color}" stroke="white" stroke-width="1"/>`;
            }
            else if (itemId === 'potion') { // 🧪 药水
                path = `<g><path d="M-3,-5 L3,-5 L5,5 L-5,5 Z" fill="${item.color}" opacity="0.8"/><rect x="-2" y="-8" width="4" height="3" fill="#94a3b8"/></g>`;
            }
            else if (itemId === 'glasses') { // 🕶️ 墨镜
                path = `<g><circle cx="-5" cy="0" r="4" fill="${item.color}"/><circle cx="5" cy="0" r="4" fill="${item.color}"/><line x1="-1" y1="0" x2="1" y2="0" stroke="${item.color}" stroke-width="1"/></g>`;
            }

            if (item.isText) {
                path = `<text x="0" y="5" text-anchor="middle" fill="${item.color}" font-size="10" font-weight="bold" font-family="serif" style="text-shadow: 0 1px 2px white;">${item.isText}</text>`;
            }

            else if (itemId === 'magnet') path = `<path d="M-6,-8 Q0,-15 6,-8 L6,0 Q6,3 3,3 L3,-8 Q0,-10 -3,-8 L-3,3 Q-3,3 -6,0 Z" fill="none" stroke="${item.color}" stroke-width="3"/><rect x="-6" y="0" width="3" height="4" fill="${item.color}"/><rect x="3" y="0" width="3" height="4" fill="${item.color}"/>`;
            else if (itemId === 'pulley') path = `<circle cx="0" cy="0" r="6" stroke="#475569" stroke-width="2" fill="none"/><circle cx="0" cy="0" r="2" fill="#475569"/><line x1="-6" y1="0" x2="-6" y2="20" stroke="#cbd5e1"/><line x1="6" y1="0" x2="6" y2="20" stroke="#cbd5e1"/>`;


            decorSVG += `<g transform="${transform}">${path}</g>`;
        });
    }

return `<svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-md" shape-rendering="${shapeRendering}">
                ${filters}
                <ellipse cx="100" cy="190" rx="60" ry="10" fill="rgba(0,0,0,0.15)" />
                ${groundEffect}
                <g class="tree-shaker" transform="translate(100, 190) scale(${scale}) translate(-100, -190)">
                    ${shape}
                    ${decorSVG}
                </g>
            </svg>`;
}

// --- App Logic ---

const app = {
    init: function () {
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

    // --- 👇👇👇 插入这段缺失的核心代码 👇👇👇 ---

    save: function() {
        localStorage.setItem('classTree_students', JSON.stringify(state.students));
        localStorage.setItem('classTree_config', JSON.stringify(state.config));
    },

    updateViewToggles: function(activeBtn) {
        document.querySelectorAll('#view-toggles button').forEach(btn => {
            if (btn === activeBtn) {
                btn.classList.add('bg-white', 'shadow', 'text-emerald-600');
                btn.classList.remove('text-gray-400');
            } else {
                btn.classList.remove('bg-white', 'shadow', 'text-emerald-600');
                btn.classList.add('text-gray-400');
            }
        });
    },

    renderHeader: function() {
        // 更新标题语言
        document.getElementById('app-title').textContent = t('appTitle');
        document.getElementById('search-input').placeholder = t('searchPlaceholder');
        document.getElementById('lbl-manage').textContent = t('manage');
        
        // 更新统计数据
        // const totalScore = state.students.reduce((acc, s) => acc + s.score, 0);
        // document.getElementById('stats-total').textContent = totalScore; 
        // (如果有统计显示的话)
    },

    // 核心渲染引擎 (已升级：支持分组视图)
    renderGrid: function() {
        const container = document.getElementById('main-container');
        // 重置容器样式
        container.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]';
        
        // 1. 过滤学生 (搜索功能)
        let filtered = state.students.filter(s => s.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
        
        // 如果没学生，显示空状态
        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center text-gray-400 py-20 flex flex-col items-center"><i data-lucide="sprout" class="w-12 h-12 mb-4 opacity-50"></i><p>${t('noStudents')}</p></div>`;
            lucide.createIcons();
            return;
        }

        // --- 模式 A: 分组视图 (Forest Mode / Group View) ---
        // 逻辑：先按组分类，再渲染一个个"版块"
        if (state.viewMode === 'forest') {
            const groups = {};
            // 分类
            filtered.forEach(s => {
                const g = s.group || '未分组 (Unassigned)';
                if (!groups[g]) groups[g] = [];
                groups[g].push(s);
            });

            // 生成 HTML (每个组一个 block)
            const html = Object.keys(groups).sort().map(groupName => {
                const students = groups[groupName];
                const cards = students.map(s => this.createStudentCard(s)).join('');
                
                return `
                    <div class="mb-10 animate-slide-up">
                        <div class="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
                            <div class="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 class="text-lg font-bold text-gray-700">${groupName}</h3>
                            <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-bold">${students.length}</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            ${cards}
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        } 
        
        // --- 模式 B: 标准网格 & 座位表 (Grid / Seats) ---
        else {
            // 座位模式排序
            if (state.viewMode === 'seats') {
                filtered.sort((a, b) => (a.seatIndex || 0) - (b.seatIndex || 0));
            }

            const html = filtered.map(student => this.createStudentCard(student)).join('');
            
            // 设置网格列数
            let gridClass = 'grid gap-6 ';
            if (state.viewMode === 'grid') gridClass += 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
            else if (state.viewMode === 'seats') gridClass += 'grid-cols-6 gap-4'; 

            container.innerHTML = `<div class="${gridClass}">${html}</div>`;
        }

        lucide.createIcons();
    },

    createStudentCard: function(student) {
        const stage = getStage(student.score);
        const isSelected = state.selectedIds.has(student.id);
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle, student.decorations);
        const badgeIcon = (student.badges && student.badges.length > 0) ? `<div class="absolute -top-2 -right-2 bg-amber-400 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-xs border-2 border-white" title="Has Badges">🏆</div>` : '';
        const borderClass = isSelected ? 'ring-4 ring-emerald-400 ring-offset-2 transform scale-95' : 'hover:scale-105 hover:shadow-xl';

        // 👇👇👇 注意下面的 ondblclick 和 toggleSelection 调用 👇👇👇
        return `
            <div onclick="app.toggleSelection('${student.id}', event)" 
                 ondblclick="app.openStudentDetail('${student.id}')"
                 class="student-card relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer select-none group ${borderClass}">
                ${badgeIcon}
                <div class="tree-container w-full aspect-[4/5] flex items-end justify-center mb-2 ${state.config.gravityMode ? 'gravity-mode' : ''}">
                    ${svg}
                </div>
                <div class="text-center relative z-10">
                    <h3 class="font-bold text-gray-800 truncate px-1">${student.name}</h3>
                    <div class="flex items-center justify-center gap-1 text-xs font-bold mt-1 text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-full mx-auto w-fit">
                        ${student.score} <span class="scale-75 opacity-70">${t('points')}</span>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); app.openStudentDetail('${student.id}')" 
                    class="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <i data-lucide="maximize-2" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    },

    toggleSelection: function(id, event) {
        // 如果按住 Ctrl/Cmd 键，进行多选；否则单选
        // 移动端体验优化：始终允许点击切换选中状态，不需要按键
        if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
        } else {
            // 如果想做成"点击即单选，长按多选"，逻辑会复杂。
            // 简单逻辑：点击就选中/取消选中。
            // 如果为了配合商店单选：
            state.selectedIds.add(id);
        }
        
        // 简单的单选逻辑（为了配合商店）：
        // 如果没有按 Ctrl，就清除其他的
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
             // 这里我们可以做一个优化：如果点击的是已经选中的，就取消；
             // 如果点击未选中的，且当前已经有选中的，就变成只选中这一个
             const wasSelected = state.selectedIds.has(id);
             state.selectedIds.clear();
             if (!wasSelected) state.selectedIds.add(id);
             else state.selectedIds.add(id); // 保持选中
        }

        this.renderGrid();
        this.updateBatchBar();
    },
    // --- 找回的批量操作逻辑 ---
    updateBatchBar: function() {
        const bar = document.getElementById('batch-bar');
        const count = document.getElementById('batch-count');
        if (state.selectedIds.size > 0) {
            bar.classList.remove('hidden', 'opacity-0');
            bar.classList.add('flex', 'opacity-100');
            count.textContent = state.selectedIds.size;
        } else {
            bar.classList.add('hidden', 'opacity-0');
            bar.classList.remove('flex', 'opacity-100');
        }
    },

    clearSelection: function() {
        state.selectedIds.clear();
        this.renderGrid();
        this.updateBatchBar();
    },

    batchScore: function(delta) {
        if (state.selectedIds.size === 0) return;
        const ids = [...state.selectedIds];
        this.applyScore(ids, delta, 'Batch Operation');
        this.clearSelection();
    },

    batchCustomScore: function() {
        const val = parseInt(document.getElementById('batch-custom-score').value);
        if (!isNaN(val) && val !== 0) {
            this.batchScore(val);
            document.getElementById('batch-custom-score').value = '';
        }
    },

    openStudentDetail: function(id) {
        const student = state.students.find(s => s.id === id);
        if (!student) return;
        
        const stage = getStage(student.score);
        
        // 1. 生成树木 SVG (包含挂件参数 decorations)
        const svg = generateTreeSVG(student.treeType, stage, state.config.treeStyle, student.decorations);
        
        // 生成切换树种的按钮
        const displayTreeType = Object.values(TreeTypes).map(type => 
            `<button onclick="app.changeTreeType('${id}', '${type}')" class="px-2 py-1 text-xs border rounded hover:bg-emerald-50 ${student.treeType === type ? 'bg-emerald-100 border-emerald-500' : ''}">${type}</button>`
        ).join('');

        // 2. 生成成长轨迹图表 SVG
        const chartSvg = this.generateGrowthChart(student);

        // 3. 生成成就勋章 HTML
        const badgesHtml = (student.badges || []).map(bid => {
            const b = ACHIEVEMENTS[bid];
            if (!b) return '';
            // 检查 lucide 图标是否存在，不存在则显示默认 emoji
            const iconContent = (window.lucide && window.lucide.icons && window.lucide.icons[b.icon]) 
                ? `<i data-lucide="${b.icon}" class="w-4 h-4"></i>` 
                : '🏅';
                
            return `<div class="tooltip cursor-help transition-transform hover:scale-110" title="${b.desc}">
                        <div class="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-sm" style="border-color:${b.color}; color:${b.color}">
                            ${iconContent}
                        </div>
                    </div>`;
        }).join('');

        // 生成历史记录 HTML
        const historyHtml = student.history.slice(0, 5).map(h => `
            <div class="flex justify-between text-sm py-2 border-b">
                <span>${h.reason}</span>
                <span class="${h.scoreDelta > 0 ? 'text-emerald-600' : 'text-red-500'} font-bold">${h.scoreDelta > 0 ? '+' : ''}${h.scoreDelta}</span>
            </div>
        `).join('');

        // 组装完整弹窗 HTML
        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-zoom-in">
                    
                    <div class="md:w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-100 relative">
                        <div class="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[200px]">
                           ${displayTreeType}
                        </div>
                        
                        <div class="w-64 h-80 drop-shadow-xl mt-8 transition-transform duration-500 ${state.config.gravityMode ? 'gravity-mode' : ''}">
                            ${svg}
                        </div>
                        
                        <h2 class="text-4xl font-black text-gray-800 mt-4">${student.name}</h2>
                        <div class="mt-2 text-2xl font-bold text-emerald-600">${student.score} ${t('points')}</div>
                        <div class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">${stage}</div>

                        <div class="flex gap-2 justify-center mt-4 min-h-[40px] flex-wrap px-4">
                            ${badgesHtml || '<span class="text-xs text-gray-400 opacity-50 py-2">暂无成就勋章</span>'}
                        </div>
                    </div>

                    <div class="md:w-1/2 bg-white flex flex-col">
                        <div class="p-4 border-b flex justify-between items-center">
                            <h3 class="font-bold text-gray-500 uppercase tracking-widest text-sm">Control Panel</h3>
                            <button onclick="app.closeModal()" class="p-2 hover:bg-gray-100 rounded-full"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        
                        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div class="grid grid-cols-4 gap-2 mb-6">
                                <button onclick="app.applyScore(['${id}'], 1, '表现不错')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700 transition-colors">+1</button>
                                <button onclick="app.applyScore(['${id}'], 5, '巨大进步')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700 transition-colors">+5</button>
                                <button onclick="app.applyScore(['${id}'], 10, '完美表现')" class="py-2 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 font-bold text-emerald-700 transition-colors">+10</button>
                                <button onclick="app.applyScore(['${id}'], -5, '待改进')" class="py-2 rounded-lg border hover:bg-red-50 hover:border-red-300 font-bold text-red-700 transition-colors">-5</button>
                            </div>
                            
                            <h4 class="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-4 h-4 text-emerald-600"></i> 成长轨迹
                            </h4>
                            <div class="mb-6">
                                ${chartSvg}
                            </div>
                            
                            <h4 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <i data-lucide="history" class="w-4 h-4 text-gray-500"></i> ${t('history')}
                            </h4>
                            <div class="space-y-1">
                                ${historyHtml || '<p class="text-gray-400 text-sm italic text-center py-4">暂无记录</p>'}
                            </div>
                        </div>
                        
                        <div class="p-4 border-t bg-gray-50 flex justify-between items-center">
                            <button onclick="app.deleteStudent('${id}')" class="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i> ${t('removeStudent')}
                            </button>
                             <button onclick="app.showQR('${student.id}')" class="text-gray-400 hover:text-gray-600 text-xs font-bold flex items-center gap-1 transition-colors">
                                <i data-lucide="qr-code" class="w-4 h-4"></i> 身份码
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    applyCustom: function (id) {
        const reason = document.getElementById('custom-reason').value || "Custom";
        const val = parseInt(document.getElementById('custom-val').value);
        if (!isNaN(val) && val !== 0) {
            this.applyScore([id], val, reason);
            this.openStudentDetail(id);
        }
    },

// --- 修复：身份码弹窗 (彻底关闭逻辑) ---
    showQR: function (id) {
        const student = state.students.find(s => s.id === id);
        // 生成二维码数据
        const qrData = `ClassTree Student Card\nName: ${student.name}\nScore: ${student.score}\nGroup: ${student.group}`;

        // 防御性编程：如果已经有一个弹窗，先把它关掉
        const existing = document.getElementById('qr-overlay');
        if (existing) existing.remove();

        const html = `
             <div id="qr-overlay" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md" 
                onclick="if(event.target === this) document.getElementById('qr-overlay').remove()">
                
                <div class="bg-white rounded-2xl p-8 text-center animate-zoom-in max-w-xs w-full">
                    <h3 class="text-xl font-bold mb-4">${student.name}</h3>
                    <div id="qrcode" class="flex justify-center mb-4"></div>
                    <p class="text-sm text-gray-500">扫码查看当前成长值</p>
                    
                    <button onclick="document.getElementById('qr-overlay').remove()" class="mt-6 text-gray-400 hover:text-gray-600 text-sm">关闭 (Close)</button>
                </div>
             </div>
        `;
        
        // 创建临时容器并追加到 body
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);

        // 生成二维码
        new QRCode(document.getElementById("qrcode"), {
            text: qrData,
            width: 180,
            height: 180,
            colorDark: "#059669",
            colorLight: "#ffffff",
        });
    },

    openShop: function() {
        if (state.selectedIds.size !== 1) {
            alert("请先选择一位学生进入商店");
            return;
        }
        const studentId = [...state.selectedIds][0];
        const student = state.students.find(s => s.id === studentId);
        
        const itemsHtml = SHOP_ITEMS.map(item => {
            // 计算当前拥有的数量
            const ownCount = student.decorations ? student.decorations.filter(id => id === item.id).length : 0;
            
            return `
                <div class="border rounded-xl p-4 flex flex-col items-center gap-2 bg-white hover:border-emerald-400 transition-all">
                    <div class="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style="background:${item.color}">
                        <i data-lucide="${item.icon}"></i>
                        ${ownCount > 0 ? `<span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">${ownCount}</span>` : ''}
                    </div>
                    <div class="font-bold text-gray-700 text-sm">${item.name}</div>
                    <div class="text-emerald-600 font-bold text-xs">${item.price} pts</div>
                    <button onclick="app.buyItem('${student.id}', '${item.id}', ${item.price})" 
                        class="w-full py-1.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                        兑换
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
                    <div class="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    buyItem: function (studentId, itemId, price) {
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
    openDailySummary: function () {
        const now = Date.now();
        const startOfDay = new Date().setHours(0, 0, 0, 0);

        let totalGain = 0;
        const activeList = [];

        state.students.forEach(s => {
            const dayDelta = s.history.filter(h => h.timestamp >= startOfDay).reduce((acc, h) => acc + h.scoreDelta, 0);
            if (dayDelta !== 0) {
                totalGain += dayDelta;
                activeList.push({ name: s.name, delta: dayDelta });
            }
        });

        activeList.sort((a, b) => b.delta - a.delta);

        // Generate Report Text
        const dateStr = new Date().toLocaleDateString();
        const reportText = `【班级小树成长日报 ${dateStr}】\n今日全班共成长: ${totalGain} 分\n🌟 表现突出: ${activeList.slice(0, 3).map(s => s.name).join(', ')}\n🌱 继续加油!`;

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



    // --- Modal Logic ---

    closeModal: function () {
        document.getElementById('modal-container').innerHTML = '';
    },

    // --- 2. 成就系统检测引擎 ---
    checkAchievements: function (student) {
        if (!student.badges) student.badges = [];
        const now = Date.now();
        const earned = [];

        // A. 🏆 积分破百
        if (student.score >= 100 && !student.badges.includes('trophy')) {
            student.badges.push('trophy');
            earned.push(ACHIEVEMENTS['trophy']);
        }

        // B. 🔥 连续 3 天加分 (热火朝天)
        if (!student.badges.includes('fire')) {
            // 获取所有加分记录的时间戳
            const dates = student.history
                .filter(h => h.scoreDelta > 0)
                .map(h => new Date(h.timestamp).setHours(0, 0, 0, 0));
            const uniqueDates = [...new Set(dates)].sort((a, b) => b - a); // 倒序排列

            // 检查最近3个日期是否连续
            if (uniqueDates.length >= 3) {
                const d1 = uniqueDates[0];
                const d2 = uniqueDates[1];
                const d3 = uniqueDates[2];
                const day = 86400000;
                if ((d1 - d2 === day) && (d2 - d3 === day)) {
                    student.badges.push('fire');
                    earned.push(ACHIEVEMENTS['fire']);
                }
            }
        }

        // C. 🛡️ 全勤卫士 (累计活跃5天)
        if (!student.badges.includes('shield')) {
            const uniqueDays = new Set(student.history.map(h => new Date(h.timestamp).setHours(0, 0, 0, 0))).size;
            if (uniqueDays >= 5) {
                student.badges.push('shield');
                earned.push(ACHIEVEMENTS['shield']);
            }
        }

        // 播报奖励
        if (earned.length > 0) {
            alert(`🎉 恭喜 ${student.name} 解锁成就：\n${earned.map(e => `${e.icon} ${e.name}`).join('\n')}`);
            this.save();
        }
    },

    // --- 3. 生成成长曲线图 (SVG) ---
    generateGrowthChart: function (student) {
        const history = student.history.sort((a, b) => a.timestamp - b.timestamp);
        // 如果数据太少，无法画图
        if (history.length < 2) return `<div class="h-32 flex items-center justify-center text-gray-400 text-xs">数据积累中...</div>`;

        // 重构积分时间轴
        let dataPoints = [];
        let currentScore = 0; // 初始分

        // 简易处理：按记录顺序模拟积分变化
        dataPoints.push({ idx: 0, score: 0 });
        history.forEach((h, i) => {
            currentScore += h.scoreDelta;
            dataPoints.push({ idx: i + 1, score: currentScore });
        });

        // 截取最近 10 次变化
        dataPoints = dataPoints.slice(-10);

        // 计算 SVG 坐标
        const width = 280, height = 100;
        const padding = 10;
        const maxScore = Math.max(...dataPoints.map(d => d.score), 10);
        const minScore = Math.min(0, ...dataPoints.map(d => d.score));
        const range = maxScore - minScore || 1;

        const getX = (i) => padding + (i / (dataPoints.length - 1)) * (width - 2 * padding);
        const getY = (s) => height - padding - ((s - minScore) / range) * (height - 2 * padding);

        let pathD = `M ${getX(0)} ${getY(dataPoints[0].score)}`;
        dataPoints.forEach((d, i) => { if (i > 0) pathD += ` L ${getX(i)} ${getY(d.score)}`; });

        return `
            <svg width="100%" height="120" viewBox="0 0 ${width} ${height}" class="bg-white rounded border border-gray-100 mt-2">
                <line x1="${padding}" y1="${getY(0)}" x2="${width - padding}" y2="${getY(0)}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>
                <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
                ${dataPoints.map((d, i) => `<circle cx="${getX(i)}" cy="${getY(d.score)}" r="3" fill="#059669" />`).join('')}
            </svg>
            <div class="text-[10px] text-center text-gray-400 mt-1">近 ${dataPoints.length} 次积分变动趋势</div>
        `;
    },

    // --- 4. 数据备份与恢复 ---
    exportData: function () {
        const data = JSON.stringify({ students: state.students, config: state.config });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ClassTree_Backup_${new Date().toLocaleDateString()}.json`;
        a.click();
    },

    importData: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.students && data.config) {
                        state.students = data.students;
                        state.config = data.config;
                        this.save();
                        this.openManagerModal();
                        alert("数据恢复成功！");
                    } else {
                        alert("文件格式不正确");
                    }
                } catch (err) { alert("读取文件失败"); }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    changeTreeType: function (id, type) {
        state.students = state.students.map(s => s.id === id ? { ...s, treeType: type } : s);
        this.save();
        this.openStudentDetail(id); // Reload modal
    },

    deleteStudent: function (id) {
        if (confirm(t('confirmDelete'))) {
            state.students = state.students.filter(s => s.id !== id);
            this.save();
            this.closeModal();
        }
    },

    openManagerModal: function () {
        // 初始化状态
        if (!state.managerTab) state.managerTab = 'list';
        if (state.activeGroup === undefined) state.activeGroup = 'all';

        // --- 数据准备 ---
        const allGroups = [...new Set(state.students.map(s => s.group || '未分组'))].sort();
        // 移除空值并去重
        const validGroups = allGroups.filter(g => g !== '未分组');

        // --- 视图 1: 列表模式 (已修复：找回设置面板) ---
        const renderListView = () => {
            const listHtml = state.students.map(s => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded border mb-2 hover:bg-white transition-colors">
                    <div class="flex items-center gap-2 flex-1">
                        <input type="checkbox" class="batch-delete-check w-4 h-4 text-emerald-600 rounded cursor-pointer" value="${s.id}">
                        <input type="text" value="${s.name}" onchange="app.updateStudent('${s.id}', 'name', this.value)"
                            class="font-medium text-gray-700 bg-transparent border-b border-transparent focus:border-emerald-500 focus:bg-white outline-none w-24 px-1 transition-all" placeholder="姓名">
                        <input type="text" value="${s.group || ''}" onchange="app.updateStudent('${s.id}', 'group', this.value)"
                            class="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1 w-20 focus:border-emerald-500 outline-none transition-all" placeholder="小组">
                    </div>
                    <button onclick="app.deleteStudent('${s.id}')" class="text-red-300 hover:text-red-500 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `).join('');


            

            return `
                <div class="space-y-4 animate-fade-in h-full overflow-y-auto custom-scrollbar pr-2">
                    
                    <section class="space-y-3 pb-4 border-b border-gray-200">
                        <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide border-l-4 border-emerald-500 pl-2">${t('settings')}</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">${t('language')}</label>
                                <select onchange="app.updateConfig('language', this.value)" class="w-full p-2 bg-white rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm">
                                    <option value="zh" ${state.config.language === 'zh' ? 'selected' : ''}>中文 (Chinese)</option>
                                    <option value="en" ${state.config.language === 'en' ? 'selected' : ''}>English</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">${t('season')}</label>
                                <select onchange="app.updateConfig('forcedSeason', this.value)" class="w-full p-2 bg-white rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm">
                                    <option value="auto" ${state.config.forcedSeason === 'auto' ? 'selected' : ''}>${t('auto')}</option>
                                    <option value="christmas" ${state.config.forcedSeason === 'christmas' ? 'selected' : ''}>${t('christmas')}</option>
                                    <option value="new_year" ${state.config.forcedSeason === 'new_year' ? 'selected' : ''}>${t('new_year')}</option>
                                    <option value="sakura" ${state.config.forcedSeason === 'sakura' ? 'selected' : ''}>${t('sakura')}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">画风 (Style)</label>
                                <select onchange="app.updateConfig('treeStyle', this.value)" class="w-full p-2 bg-white rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm">
                                    <option value="flat" ${state.config.treeStyle === 'flat' ? 'selected' : ''}>扁平 (Flat)</option>
                                    <option value="realistic" ${state.config.treeStyle === 'realistic' ? 'selected' : ''}>写实 (Realistic)</option>
                                    <option value="pixel" ${state.config.treeStyle === 'pixel' ? 'selected' : ''}>像素 (Pixel)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div class="flex gap-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 mt-2">
                        <input type="text" id="add-name" placeholder="新学生姓名" class="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-emerald-500 bg-white">
                        <input type="text" id="add-group" placeholder="小组 (可选)" class="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-emerald-500 bg-white">
                        <button onclick="app.addStudentSimple()" class="px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold text-sm shadow-sm whitespace-nowrap">+ 添加</button>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 mb-1">物理特性 (Physics)</label>
                        <label class="flex items-center gap-2 cursor-pointer bg-white p-2 border rounded-lg">
                            <input type="checkbox" onchange="app.updateConfig('gravityMode', this.checked); app.renderGrid();" ${state.config.gravityMode ? 'checked' : ''}>
                            <span class="text-sm">重力模式 (Gravity)</span>
                        </label>
                    </div>

                    <div class="col-span-full pt-2 mt-2 border-t border-dashed">
                        <label class="block text-xs font-bold text-gray-500 mb-2">数据安全 (Data Backup)</label>
                        <div class="flex gap-4">
                            <button onclick="app.exportData()" class="flex-1 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-xs font-bold flex items-center justify-center gap-2">
                                <i data-lucide="download"></i> 导出备份 (.json)
                            </button>
                            <button onclick="app.importData()" class="flex-1 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 text-xs font-bold flex items-center justify-center gap-2">
                                <i data-lucide="upload"></i> 恢复数据
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-between items-end mt-2">
                        <h3 class="font-bold text-gray-400 text-xs uppercase tracking-wider">学生列表 (共 ${state.students.length} 人)</h3>
                        <div class="flex gap-2">
                             <button onclick="app.resetAll()" class="text-xs text-gray-400 hover:text-red-500 underline">重置所有</button>
                             <button onclick="app.runBatchDelete()" class="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 font-bold">批量删除</button>
                        </div>
                    </div>
                    <div class="h-[300px] overflow-y-auto border rounded-xl p-2 bg-white custom-scrollbar shadow-inner">
                        ${state.students.length > 0 ? listHtml : `<p class="text-center text-gray-400 text-sm py-12">暂无数据，请添加学生</p>`}
                    </div>
                    
                    <details class="group pt-2">
                        <summary class="list-none text-xs text-blue-500 cursor-pointer flex items-center gap-1 font-medium select-none hover:text-blue-600">
                            <i data-lucide="upload" class="w-3 h-3"></i> 批量文本导入
                        </summary>
                        <div class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <textarea id="import-text" class="w-full h-20 p-2 border rounded text-xs bg-white focus:outline-none focus:border-blue-400" placeholder="格式：姓名, 小组 (每行一个)"></textarea>
                            <button onclick="app.batchImport()" class="mt-2 w-full py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600">开始导入</button>
                        </div>
                    </details>
                </div>
            `;
        };

        // --- 视图 2: 分组指挥中心 (新功能) ---
        const renderGroupView = () => {
            // 筛选当前视图的学生
            let currentStudents = state.students;
            if (state.activeGroup === 'unassigned') {
                currentStudents = state.students.filter(s => !s.group);
            } else if (state.activeGroup !== 'all') {
                currentStudents = state.students.filter(s => s.group === state.activeGroup);
            }

            // 生成左侧导航
            const navItem = (id, name, count, icon) => `
                <button onclick="app.setManagerGroup('${id}')" 
                    class="w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center mb-1 transition-colors
                    ${state.activeGroup === id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'}">
                    <span class="flex items-center gap-2"><i data-lucide="${icon}" class="w-4 h-4"></i> ${name}</span>
                    <span class="text-xs opacity-70 bg-white/20 px-1.5 rounded-full">${count}</span>
                </button>
            `;

            const unassignedCount = state.students.filter(s => !s.group).length;

            // 生成右侧学生卡片
            const cards = currentStudents.map(s => `
                <label class="cursor-pointer relative group/card">
                    <input type="checkbox" class="member-check peer absolute opacity-0" value="${s.id}">
                    <div class="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center hover:shadow-md transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:ring-1 peer-checked:ring-indigo-500 h-full">
                         <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-400">
                            <i data-lucide="user" class="w-4 h-4"></i>
                         </div>
                         <div class="font-bold text-gray-700 text-xs truncate w-full text-center">${s.name}</div>
                         <div class="text-[10px] text-gray-400 truncate w-full text-center">${s.group || '-'}</div>
                         <div class="absolute top-1 right-1 w-3 h-3 bg-indigo-500 rounded-full hidden peer-checked:block"></div>
                    </div>
                </label>
            `).join('');

            // 目标小组下拉菜单
            const targetOptions = validGroups.map(g => `<option value="${g}">${g}</option>`).join('');

            return `
                <div class="flex h-[500px] border rounded-xl overflow-hidden bg-white animate-fade-in shadow-inner">
                    <div class="w-1/3 min-w-[140px] bg-gray-50 border-r p-3 overflow-y-auto custom-scrollbar flex flex-col">
                        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2 pl-2">视图筛选</h4>
                        ${navItem('all', '全部学生', state.students.length, 'users')}
                        ${navItem('unassigned', '未分组', unassignedCount, 'help-circle')}
                        
                        <div class="h-px bg-gray-200 my-2"></div>
                        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2 pl-2">现有小组</h4>
                        ${validGroups.map(g => {
                const count = state.students.filter(s => s.group === g).length;
                return navItem(g, g, count, 'folder');
            }).join('')}
                    </div>

                    <div class="flex-1 flex flex-col bg-white">
                        <div class="p-3 border-b flex justify-between items-center bg-gray-50/50">
                            <h3 class="font-bold text-gray-700 flex items-center gap-2">
                                <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">当前查看</span> 
                                ${state.activeGroup === 'all' ? '全部学生' : (state.activeGroup === 'unassigned' ? '未分组' : state.activeGroup)}
                            </h3>
                            <span class="text-xs text-gray-400">选中下方卡片进行移动</span>
                        </div>

                        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                ${currentStudents.length > 0 ? cards : `<div class="col-span-full text-center text-gray-400 py-10 text-sm">此分组下没有学生</div>`}
                            </div>
                        </div>

                        <div class="p-3 border-t bg-gray-50 flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <div class="text-xs font-bold text-gray-500 whitespace-nowrap">移动选中到:</div>
                                <select id="target-group-select" onchange="document.getElementById('new-group-wrapper').style.display = this.value === 'new_value' ? 'flex' : 'none'" 
                                    class="flex-1 p-1.5 border rounded text-sm outline-none focus:border-indigo-500">
                                    <option value="" disabled selected>选择目标小组...</option>
                                    ${targetOptions}
                                    <option value="new_value" class="font-bold text-indigo-600">+ 新建小组 / Create New</option>
                                </select>
                                <button onclick="app.moveSelectedMembers()" class="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition-colors">执行</button>
                            </div>
                            
                            <div id="new-group-wrapper" class="hidden items-center gap-2 animate-slide-up">
                                <input type="text" id="new-group-input" placeholder="输入新组名 (例如: 量子力学组)" class="flex-1 p-1.5 border border-indigo-300 rounded text-sm bg-indigo-50 text-indigo-900 focus:bg-white outline-none">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        // --- 主框架 ---
        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-zoom-in flex flex-col max-h-[95vh]">
                    
                    <div class="bg-white border-b flex shrink-0">
                        <button onclick="app.setManagerTab('list')" class="flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${state.managerTab === 'list' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}">
                            <i data-lucide="list" class="w-4 h-4"></i> 列表模式 (List)
                        </button>
                        <button onclick="app.setManagerTab('groups')" class="flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${state.managerTab === 'groups' ? 'border-indigo-500 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}">
                            <i data-lucide="users" class="w-4 h-4"></i> 分组模式 (Groups)
                        </button>
                        <button onclick="app.closeModal()" class="px-6 border-l text-gray-400 hover:text-gray-600 hover:bg-gray-100"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>

                    <div class="p-6 overflow-hidden flex flex-col h-full bg-gray-50/50">
                        ${state.managerTab === 'list' ? renderListView() : renderGroupView()}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    // --- 新增：批量删除逻辑 ---
    runBatchDelete: function () {
        const checkboxes = document.querySelectorAll('.batch-delete-check:checked');
        if (checkboxes.length === 0) return;

        if (confirm(`${t('confirmBatchDelete')} (${checkboxes.length})`)) {
            const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
            state.students = state.students.filter(s => !idsToDelete.includes(s.id));
            this.save();
            this.openManagerModal(); // 刷新列表
        }
    },

    // --- 新增：单个学生数据快速更新 (用于列表直接编辑) ---
    updateStudent: function (id, key, value) {
        const student = state.students.find(s => s.id === id);
        if (student) {
            student[key] = value.trim(); // 更新名字或组别
            this.save();
            // 如果改的是组名，可能影响到"小组视图"，所以最好刷新一下
            // 但为了编辑体验不被打断，这里只保存，不强制重绘整个列表
            // 只有当用户关闭管理面板时，主界面的网格才会刷新
        }
    },

    // --- 新增：小组批量重命名 ---
    batchRenameGroup: function () {
        const oldGroup = document.getElementById('group-select').value;
        const newGroup = document.getElementById('new-group-name').value.trim();

        if (!oldGroup || !newGroup) {
            alert("请选择旧小组并输入新组名");
            return;
        }

        let count = 0;
        state.students.forEach(s => {
            if (s.group === oldGroup) {
                s.group = newGroup;
                count++;
            }
        });

        if (count > 0) {
            this.save();
            this.openManagerModal(); // 刷新面板以更新下拉菜单和列表
            alert(`成功将 ${count} 位同学从 "${oldGroup}" 移动到 "${newGroup}"`);
        } else {
            alert("未找到该小组成员");
        }
    },

    // --- 新增：分组管理核心逻辑 ---

    // 切换管理面板的标签页 (list | groups)
    setManagerTab: function (tab) {
        state.managerTab = tab;
        this.openManagerModal(); // 重新渲染
    },

    // 切换当前查看的小组
    setManagerGroup: function (groupName) {
        state.activeGroup = groupName;
        this.openManagerModal();
    },

    // 移动选中的学生到指定小组（支持新建）
    moveSelectedMembers: function () {
        // 1. 获取选中的学生ID
        const checkboxes = document.querySelectorAll('.member-check:checked');
        const ids = Array.from(checkboxes).map(cb => cb.value);

        if (ids.length === 0) {
            alert("请先勾选需要移动的学生");
            return;
        }

        // 2. 获取目标组名
        const selectEl = document.getElementById('target-group-select');
        let targetGroup = selectEl.value;

        // 如果选的是"new"，则获取输入框的值
        if (targetGroup === 'new_value') {
            const inputEl = document.getElementById('new-group-input');
            targetGroup = inputEl.value.trim();
            if (!targetGroup) {
                alert("请输入新小组的名称");
                return;
            }
        }

        // 3. 执行移动
        let count = 0;
        state.students.forEach(s => {
            if (ids.includes(s.id)) {
                s.group = targetGroup;
                count++;
            }
        });

        this.save();
        this.openManagerModal(); // 刷新界面
        alert(`已将 ${count} 名学生移动到 "${targetGroup}"`);
    },

    // --- 修复：配置更新后强制刷新所有UI ---
    updateConfig: function (key, value) {
        state.config[key] = value;
        if (key === 'language') {
            this.renderHeader(); // 立即刷新头部文字
        }
        state.holiday = getSeasonalHoliday(); // 重新计算节日
        this.save();
        this.openManagerModal(); // 重新打开模态框以刷新模态框内的语言
        this.renderGrid(); // 刷新主网格
    },

    addStudent: function () {
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

    // --- 修复：添加学生的正确逻辑 ---
    addStudentSimple: function () {
        const nameEl = document.getElementById('add-name');
        const groupEl = document.getElementById('add-group');

        // 校验输入
        if (!nameEl || !nameEl.value.trim()) {
            alert("请输入学生姓名");
            return;
        }

        const name = nameEl.value.trim();
        const group = groupEl.value.trim();

        state.students.push({
            id: generateId(),
            name: name,
            group: group,
            score: 0,
            treeType: getRandomTreeType(), // 随机分配树种
            decorations: [], // 初始化挂件数组
            history: [],
            seatIndex: state.students.length
        });

        // 清空输入框并保存
        nameEl.value = '';
        groupEl.value = '';
        this.save();

        // 刷新列表显示
        this.openManagerModal();
        // 同时刷新背景网格，防止关闭弹窗后看不到新学生
        this.renderGrid();
    },

    batchImport: function () {
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

    exportCSV: function () {
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

    resetAll: function () {
        if (confirm(t('confirmReset'))) {
            state.students = [];
            this.save();
            this.closeModal();
        }
    },

    openLeaderboard: function() {
        // 1. 计算小组数据
        const groupStats = {};
        state.students.forEach(s => {
            const g = s.group || '未分组';
            if (!groupStats[g]) groupStats[g] = { name: g, total: 0, count: 0 };
            groupStats[g].total += s.score;
            groupStats[g].count++;
        });
        const groups = Object.values(groupStats).sort((a,b) => (b.total/b.count) - (a.total/a.count));

        // 2. 生成小组榜 HTML
        const groupHtml = groups.map((g, i) => {
            const avg = g.count > 0 ? (g.total / g.count).toFixed(1) : 0;
            const width = Math.min(100, (avg / 20) * 100); 
            return `
                <div class="mb-4">
                    <div class="flex justify-between items-end mb-1">
                        <span class="font-bold text-gray-700 flex items-center gap-2">
                            <span class="text-xs bg-gray-200 px-1.5 rounded text-gray-500">#${i+1}</span> ${g.name}
                        </span>
                        <div class="text-right">
                            <span class="text-2xl font-black text-indigo-600 italic font-mono">${avg}</span>
                            <span class="text-[10px] text-gray-400">平均分 (总 ${g.total})</span>
                        </div>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div class="h-full bg-indigo-500 relative" style="width: ${width}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        // 3. 生成个人榜 HTML
        const sorted = [...state.students].sort((a,b) => b.score - a.score).slice(0, 5);
        const topStudentHtml = sorted.map((s,i) => `
             <div class="flex justify-between items-center py-3 border-b border-dashed border-gray-200 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
                <span class="flex items-center gap-2">
                    <span class="w-6 h-6 flex items-center justify-center rounded-full ${i===0?'bg-yellow-100 text-yellow-600':(i===1?'bg-gray-100 text-gray-600':'bg-orange-50 text-orange-600')} text-xs font-bold">#${i+1}</span>
                    <span class="font-bold text-gray-700">${s.name}</span>
                </span>
                <span class="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">${s.score}</span>
            </div>
        `).join('');

        // 4. 组装弹窗 (修复了 class 缺失的问题)
        const html = `
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.closeModal()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex justify-between items-center shrink-0">
                         <h2 class="text-2xl font-bold flex items-center gap-2"><i data-lucide="trophy" class="w-6 h-6"></i> 荣耀排行榜</h2>
                         <button onclick="app.closeModal()" class="text-white/80 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
                    </div>
                    <div class="p-0 grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
                        <div class="p-6 bg-gray-50 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-gray-200">
                            <h3 class="font-bold text-indigo-900 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <i data-lucide="swords" class="w-4 h-4"></i> 小组 PK (Group Battle)
                            </h3>
                            ${groups.length > 0 ? groupHtml : '<p class="text-gray-400 text-sm">暂无小组数据</p>'}
                        </div>
                        <div class="p-6 bg-white overflow-y-auto custom-scrollbar">
                            <h3 class="font-bold text-amber-600 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <i data-lucide="crown" class="w-4 h-4"></i> 个人英雄 (Top Students)
                            </h3>
                            <div class="space-y-1">
                                ${topStudentHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = html;
        lucide.createIcons();
    },

    // --- Lucky Draw ---
    openLuckyDraw: function () {
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

    runLuckyDraw: function () {
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

    openDailySummary: function () {
        const now = Date.now();
        const startOfDay = new Date().setHours(0, 0, 0, 0);

        let total = 0;
        const activeStudents = [];

        state.students.forEach(s => {
            const pts = s.history
                .filter(h => h.timestamp >= startOfDay)
                .reduce((acc, h) => acc + h.scoreDelta, 0);
            if (pts !== 0) {
                total += pts;
                activeStudents.push({ name: s.name, pts });
            }
        });

        activeStudents.sort((a, b) => b.pts - a.pts);

        const listHtml = activeStudents.slice(0, 3).map((s, i) => `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span class="font-bold text-gray-700">#${i + 1} ${s.name}</span>
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