import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Plus, Minus, Settings, Users, Upload, Download, 
  Trophy, Sprout, Search, X, FileSpreadsheet, 
  Trash2, UserPlus, Save, RefreshCw, Grid, Layers, Armchair, 
  Calendar, Dice5, Edit3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

// ==========================================
// SECTION 1: TYPES & CONSTANTS
// ==========================================

export enum TreeType {
  OAK = 'Oak',
  PINE = 'Pine',
  SAKURA = 'Sakura',
  BAMBOO = 'Bamboo',
  APPLE = 'Apple'
}

export enum TreeStage {
  SEED = 'Seed',
  SPROUT = 'Sprout',
  SAPLING = 'Sapling',
  TREE = 'Tree',
  MATURE = 'Mature',
  BLOOMING = 'Blooming',
  WITHERED = 'Withered'
}

export type TreeStyle = 'flat' | 'pixel' | 'realism' | 'sketch' | 'origami';
export type ViewMode = 'grid' | 'forest' | 'seats';
export type Language = 'zh' | 'en';
export type Holiday = 'none' | 'christmas' | 'new_year' | 'sakura';

export interface LogEntry {
  id: string;
  timestamp: number;
  scoreDelta: number;
  reason: string;
  category: 'behavior' | 'homework' | 'participation' | 'other';
}

export interface Student {
  id: string;
  name: string;
  group?: string;
  score: number;
  treeType: TreeType;
  history: LogEntry[];
  seatIndex?: number; 
}

export interface AppConfig {
  thresholds: {
    [key in TreeStage]?: number;
  };
  treeStyle: TreeStyle;
  language: Language;
}

export const DEFAULT_THRESHOLDS = {
  [TreeStage.WITHERED]: -999,
  [TreeStage.SEED]: 0,
  [TreeStage.SPROUT]: 10,
  [TreeStage.SAPLING]: 30,
  [TreeStage.TREE]: 60,
  [TreeStage.MATURE]: 100,
  [TreeStage.BLOOMING]: 150,
};

// ==========================================
// SECTION 2: COMPONENTS (TreeVisual)
// ==========================================

interface TreeVisualProps {
  type: TreeType;
  stage: TreeStage;
  style: TreeStyle;
  holiday?: Holiday;
  className?: string;
}

const TreeVisual: React.FC<TreeVisualProps> = ({ type, stage, style, holiday = 'none', className }) => {
  
  const colors = useMemo(() => {
    const isWithered = stage === TreeStage.WITHERED;
    
    let foliage = '#22c55e';
    let trunk = '#78350f';
    let fruit = 'transparent';

    if (isWithered) {
      return { foliage: '#a8a29e', trunk: '#57534e', fruit: 'transparent' };
    }

    switch (type) {
      case TreeType.SAKURA:
        foliage = (stage === TreeStage.BLOOMING || holiday === 'sakura') ? '#fbcfe8' : '#86efac';
        trunk = '#5D4037';
        break;
      case TreeType.PINE:
        foliage = '#15803d';
        trunk = '#3E2723';
        break;
      case TreeType.BAMBOO:
        foliage = '#bef264';
        trunk = '#65a30d';
        break;
      case TreeType.APPLE:
        foliage = '#4ade80';
        fruit = stage === TreeStage.BLOOMING ? '#ef4444' : 'transparent';
        break;
      default: // OAK
        foliage = '#22c55e';
        trunk = '#78350f';
    }
    
    // Holiday overrides
    if (holiday === 'christmas' && type === TreeType.PINE) {
        foliage = '#0f5132';
    }

    if (stage === TreeStage.SEED) {
        foliage = '#854d0e';
    }

    return { foliage, trunk, fruit };
  }, [type, stage, holiday]);

  const scale = useMemo(() => {
    switch (stage) {
      case TreeStage.SEED: return 0.2;
      case TreeStage.SPROUT: return 0.4;
      case TreeStage.SAPLING: return 0.6;
      case TreeStage.TREE: return 0.8;
      case TreeStage.MATURE: return 1.0;
      case TreeStage.BLOOMING: return 1.1;
      case TreeStage.WITHERED: return 0.8;
      default: return 0.5;
    }
  }, [stage]);

  // --- Style Renderers ---

  const renderPixelTree = () => {
      if (stage === TreeStage.SEED) {
          return <rect x="90" y="170" width="20" height="20" fill={colors.trunk} />;
      }
      if (stage === TreeStage.SPROUT) {
          return (
              <g>
                  <rect x="95" y="170" width="10" height="20" fill={colors.trunk} />
                  <rect x="85" y="160" width="10" height="10" fill={colors.foliage} />
                  <rect x="105" y="160" width="10" height="10" fill={colors.foliage} />
                  <rect x="95" y="150" width="10" height="10" fill={colors.foliage} />
              </g>
          );
      }
      return (
          <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
              <rect x="90" y="100" width="20" height="90" fill={colors.trunk} />
              {type === TreeType.BAMBOO ? (
                  <g>
                    <rect x="92" y="50" width="16" height="140" fill={colors.trunk} />
                    <rect x="80" y="80" width="40" height="10" fill={colors.foliage} />
                    <rect x="80" y="120" width="40" height="10" fill={colors.foliage} />
                  </g>
              ) : (
                  <g>
                      <rect x="60" y="70" width="80" height="40" fill={colors.foliage} />
                      <rect x="70" y="40" width="60" height="30" fill={colors.foliage} />
                      <rect x="80" y="20" width="40" height="20" fill={colors.foliage} />
                      {(stage === TreeStage.BLOOMING || stage === TreeStage.MATURE) && colors.fruit !== 'transparent' && (
                          <g>
                              <rect x="70" y="80" width="10" height="10" fill={colors.fruit} />
                              <rect x="110" y="50" width="10" height="10" fill={colors.fruit} />
                          </g>
                      )}
                  </g>
              )}
          </g>
      );
  };

  const renderRealismTree = () => {
    return (
        <g>
            <defs>
                <radialGradient id={`grad-foliage-${type}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={colors.foliage} style={{ stopOpacity: 1, filter: 'brightness(1.2)' }} />
                    <stop offset="100%" stopColor={colors.foliage} style={{ stopOpacity: 1, filter: 'brightness(0.8)' }} />
                </radialGradient>
                <linearGradient id={`grad-trunk-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.trunk} style={{filter: 'brightness(0.8)'}} />
                    <stop offset="50%" stopColor={colors.trunk} style={{filter: 'brightness(1.1)'}} />
                    <stop offset="100%" stopColor={colors.trunk} style={{filter: 'brightness(0.7)'}} />
                </linearGradient>
            </defs>
            {renderFlatTree(true)} 
        </g>
    );
  };

  const renderOrigamiTree = () => {
      const trunkColor = colors.trunk;
      const foliageColor = colors.foliage;

      if (stage === TreeStage.SEED) {
          return <polygon points="90,180 110,180 100,165" fill={trunkColor} />;
      }

      return (
        <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
            <polygon points="90,190 110,190 105,100 95,100" fill={trunkColor} />
            <polygon points="90,190 100,190 100,100 95,100" fill="black" opacity="0.15" />
            {type === TreeType.PINE ? (
                <g>
                    <polygon points="50,130 150,130 100,60" fill={foliageColor} />
                    <polygon points="50,130 100,130 100,60" fill="black" opacity="0.1" />
                    <polygon points="60,90 140,90 100,30" fill={foliageColor} />
                    <polygon points="60,90 100,90 100,30" fill="black" opacity="0.1" />
                </g>
            ) : type === TreeType.BAMBOO ? (
                <g>
                    <polygon points="90,190 110,190 110,150 90,150" fill={trunkColor} />
                    <polygon points="90,190 100,190 100,150 90,150" fill="black" opacity="0.15" />
                    <polygon points="92,148 108,148 108,100 92,100" fill={trunkColor} />
                    <polygon points="92,148 100,148 100,100 92,100" fill="black" opacity="0.15" />
                    <polygon points="108,120 140,100 110,110" fill={foliageColor} />
                    <polygon points="92,140 60,120 90,130" fill={foliageColor} />
                </g>
            ) : (
                <g>
                     <polygon points="100,30 160,100 100,170 40,100" fill={foliageColor} />
                     <polygon points="40,100 100,170 100,30" fill="black" opacity="0.1" />
                </g>
            )}
             {(stage === TreeStage.BLOOMING || stage === TreeStage.MATURE) && colors.fruit !== 'transparent' && (
                 <g>
                     <polygon points="80,80 90,90 80,100 70,90" fill={colors.fruit} />
                     <polygon points="120,60 130,70 120,80 110,70" fill={colors.fruit} />
                 </g>
             )}
        </g>
      );
  };

  const renderSketchTree = () => {
    const strokeProps = {
        stroke: '#292524',
        strokeWidth: '2.5',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        fill: 'transparent'
    };
    const fillStyle = { fill: colors.foliage, opacity: 0.5 };
    const trunkFillStyle = { fill: colors.trunk, opacity: 0.5 };

    if (stage === TreeStage.SEED) {
        return <circle cx="100" cy="180" r="8" {...strokeProps} fill={colors.trunk} fillOpacity="0.5" />;
    }

    const isBamboo = type === TreeType.BAMBOO;
    const isPine = type === TreeType.PINE;

    return (
        <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
             {isBamboo ? (
                 <g>
                     <path d="M92,190 L95,50 L105,50 L108,190" {...strokeProps} {...trunkFillStyle} />
                     <path d="M93,150 L107,150" {...strokeProps} />
                     <path d="M94,110 L106,110" {...strokeProps} />
                 </g>
             ) : (
                 <path 
                     d="M90,190 Q95,150 95,100 Q90,50 100,40 Q110,50 105,100 Q105,150 110,190" 
                     {...strokeProps} 
                     {...trunkFillStyle}
                 />
             )}
             {isPine ? (
                 <path 
                    d="M100,20 L130,120 L70,120 Z M100,50 L140,150 L60,150 Z" 
                    {...strokeProps} 
                    {...fillStyle} 
                 />
             ) : isBamboo ? (
                 <g>
                    <path d="M105,130 Q130,120 140,100 Q120,110 105,120" {...strokeProps} {...fillStyle} />
                    <path d="M95,150 Q70,140 60,120 Q80,130 95,140" {...strokeProps} {...fillStyle} />
                 </g>
             ) : (
                 <path 
                    d="M100,160 Q150,150 150,100 Q150,40 100,30 Q50,40 50,100 Q50,150 100,160" 
                    {...strokeProps} 
                    {...fillStyle}
                 />
             )}
             {(stage === TreeStage.BLOOMING || stage === TreeStage.MATURE) && colors.fruit !== 'transparent' && (
                 <g>
                     <circle cx="80" cy="80" r="5" stroke={colors.fruit} strokeWidth="2" fill="none" />
                     <circle cx="120" cy="60" r="5" stroke={colors.fruit} strokeWidth="2" fill="none" />
                     <path d="M78,78 L82,82 M78,82 L82,78" stroke={colors.fruit} strokeWidth="2" />
                 </g>
             )}
        </g>
    );
  };

  const renderFlatTree = (useGradient = false) => {
    const fillTrunk = useGradient ? `url(#grad-trunk-${type})` : colors.trunk;
    const fillFoliage = useGradient ? `url(#grad-foliage-${type})` : colors.foliage;

    if (stage === TreeStage.SEED) {
        return <ellipse cx="100" cy="180" rx="10" ry="6" fill={fillTrunk} />;
    }
    
    if (stage === TreeStage.SPROUT) {
        return (
            <g transform="translate(100, 180)">
                 <path d="M0,0 Q-10,-20 -20,-25 Q-5,-25 0,0" fill={fillFoliage} />
                 <path d="M0,0 Q10,-20 20,-25 Q5,-25 0,0" fill={fillFoliage} />
            </g>
        );
    }

    const isBamboo = type === TreeType.BAMBOO;
    const isPine = type === TreeType.PINE;

    return (
        <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
             {isBamboo ? (
                 <g>
                     <rect x="90" y="50" width="8" height="140" fill={fillTrunk} rx="2" />
                     <rect x="102" y="70" width="8" height="120" fill={fillTrunk} rx="2" />
                 </g>
             ) : (
                <path 
                    d="M100,190 L100,190 Q80,150 90,100 L90,100 Q80,50 100,40 Q120,50 110,100 L110,100 Q120,150 100,190 Z" 
                    fill={fillTrunk} 
                />
             )}
             {isPine ? (
                 <g transform="translate(100, 40)">
                     <path d="M0,-80 L-40,20 L40,20 Z" fill={fillFoliage} />
                     <path d="M0,-50 L-50,60 L50,60 Z" fill={fillFoliage} />
                     <path d="M0,-20 L-60,100 L60,100 Z" fill={fillFoliage} />
                 </g>
             ) : isBamboo ? (
                 <g>
                    <ellipse cx="80" cy="60" rx="20" ry="8" fill={fillFoliage} transform="rotate(-30 80 60)" />
                    <ellipse cx="120" cy="80" rx="20" ry="8" fill={fillFoliage} transform="rotate(30 120 80)" />
                    <ellipse cx="90" cy="100" rx="20" ry="8" fill={fillFoliage} transform="rotate(-20 90 100)" />
                 </g>
             ) : (
                 <g transform="translate(100, 70)">
                     <circle cx="-30" cy="10" r="30" fill={fillFoliage} />
                     <circle cx="30" cy="10" r="30" fill={fillFoliage} />
                     <circle cx="0" cy="-30" r="40" fill={fillFoliage} />
                     <circle cx="-20" cy="-10" r="35" fill={fillFoliage} />
                     <circle cx="20" cy="-10" r="35" fill={fillFoliage} />
                 </g>
             )}
             {(stage === TreeStage.BLOOMING || stage === TreeStage.MATURE) && colors.fruit !== 'transparent' && (
                 <g transform="translate(100, 70)">
                     <circle cx="-20" cy="0" r="4" fill={colors.fruit} />
                     <circle cx="25" cy="-10" r="4" fill={colors.fruit} />
                     <circle cx="0" cy="-35" r="4" fill={colors.fruit} />
                 </g>
             )}
             {holiday === 'christmas' && isPine && (
                 <g transform="translate(100, 40)">
                     <path d="M0,-90 L5,-80 L-5,-80 Z" fill="#fbbf24" transform="scale(1.5)" />
                     <circle cx="-20" cy="10" r="3" fill="#ef4444" />
                     <circle cx="10" cy="40" r="3" fill="#3b82f6" />
                     <circle cx="-10" cy="70" r="3" fill="#fbbf24" />
                 </g>
             )}
             {holiday === 'new_year' && !isBamboo && (
                 <g transform="translate(100, 100)">
                     <rect x="-30" y="0" width="10" height="12" fill="#ef4444" rx="2" />
                     <rect x="20" y="10" width="10" height="12" fill="#ef4444" rx="2" />
                     <line x1="-25" y1="-10" x2="-25" y2="0" stroke="#fbbf24" strokeWidth="1" />
                     <line x1="25" y1="0" x2="25" y2="10" stroke="#fbbf24" strokeWidth="1" />
                 </g>
             )}
             {stage === TreeStage.WITHERED && (
                 <rect x="-100" y="-190" width="200" height="200" fill="rgba(100,100,100,0.3)" style={{mixBlendMode: 'saturation'}} />
             )}
        </g>
    );
  };

  const renderContent = () => {
      switch (style) {
          case 'pixel': return renderPixelTree();
          case 'realism': return renderRealismTree();
          case 'origami': return renderOrigamiTree();
          case 'sketch': return renderSketchTree();
          default: return renderFlatTree(false);
      }
  };

  return (
    <div className={`relative w-full aspect-[4/5] flex items-end justify-center overflow-visible ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg" shapeRendering={style === 'pixel' ? 'crispEdges' : 'auto'}>
        <ellipse cx="100" cy="190" rx="60" ry="10" fill="rgba(0,0,0,0.15)" />
        {renderContent()}
      </svg>
    </div>
  );
};

// ==========================================
// SECTION 3: APP COMPONENT
// ==========================================

const TRANSLATIONS = {
  en: {
    appTitle: "ClassTree",
    manage: "Manage",
    leaderboard: "Leaderboard",
    searchPlaceholder: "Search student...",
    groupAll: "All Groups",
    selected: "Selected",
    clear: "Clear",
    addStudent: "Add Student",
    batchImport: "Batch Import",
    dataControl: "Data Control",
    exportCSV: "Export CSV",
    resetAll: "Reset All",
    points: "pts",
    viewMode: "View Mode",
    grid: "Grid",
    forests: "Forests",
    seats: "Seats",
    dailySummary: "Today's Summary",
    todaysGrowth: "Today's Growth",
    topStudents: "Top Students",
    treeStyle: "Tree Style",
    language: "Language",
    settings: "Settings",
    close: "Close",
    save: "Save",
    apply: "Apply",
    history: "History",
    removeStudent: "Remove Student",
    reasonPlaceholder: "Reason (e.g., Good answer)",
    addPoints: "Add Points",
    noStudents: "No students found.",
    addSome: "Add some students to get started",
    confirmDelete: "Are you sure you want to remove this student?",
    confirmReset: "Delete ALL students? This cannot be undone.",
    importSuccess: "Import successful!",
    importPlaceholder: "Paste names (one per line). Format: Name, Group",
    styleFlat: "Flat",
    stylePixel: "Pixel",
    styleRealism: "Realism",
    styleSketch: "Sketch",
    styleOrigami: "Origami",
    luckyDraw: "Lucky Draw",
    luckyDrawTitle: "Classroom Lucky Draw",
    luckyDrawBtn: "Pick a Random Student",
    changeTreeType: "Change Tree Type",
    nextLevel: "Next Level",
    maxLevel: "Max Level Reached",
    roster: "Roster List",
    general: "General",
    totalStudents: "Total Students",
    group: "Group",
    action: "Action"
  },
  zh: {
    appTitle: "班级小树",
    manage: "管理",
    leaderboard: "排行榜",
    searchPlaceholder: "搜索学生...",
    groupAll: "全部",
    selected: "已选择",
    clear: "取消",
    addStudent: "添加学生",
    batchImport: "批量导入",
    dataControl: "数据管理",
    exportCSV: "导出表格",
    resetAll: "重置所有",
    points: "分",
    viewMode: "视图模式",
    grid: "网格",
    forests: "森林分组",
    seats: "座位表",
    dailySummary: "今日总结",
    todaysGrowth: "今日成长",
    topStudents: "今日之星",
    treeStyle: "树木风格",
    language: "语言",
    settings: "设置",
    close: "关闭",
    save: "保存",
    apply: "应用",
    history: "历史记录",
    removeStudent: "移除学生",
    reasonPlaceholder: "理由 (如：回答问题)",
    addPoints: "加分/扣分",
    noStudents: "暂无学生数据",
    addSome: "请添加学生以开始",
    confirmDelete: "确定要移除该学生吗？",
    confirmReset: "确定删除所有学生？此操作不可撤销。",
    importSuccess: "导入成功！",
    importPlaceholder: "粘贴名单 (每行一个)。格式: 姓名, 分组",
    styleFlat: "扁平",
    stylePixel: "像素",
    styleRealism: "写实",
    styleSketch: "手绘",
    styleOrigami: "折纸",
    luckyDraw: "幸运抽奖",
    luckyDrawTitle: "班级幸运星",
    luckyDrawBtn: "随机抽取一位同学",
    changeTreeType: "修改树种",
    nextLevel: "距离下一级",
    maxLevel: "已达最高级",
    roster: "名单管理",
    general: "通用设置",
    totalStudents: "学生总数",
    group: "分组",
    action: "操作"
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRandomTreeType = (): TreeType => {
  const types = Object.values(TreeType);
  return types[Math.floor(Math.random() * types.length)];
};

const getStageFromScore = (score: number, thresholds: AppConfig['thresholds']): TreeStage => {
  if (score < 0) return TreeStage.WITHERED;
  if (score >= (thresholds[TreeStage.BLOOMING] || 150)) return TreeStage.BLOOMING;
  if (score >= (thresholds[TreeStage.MATURE] || 100)) return TreeStage.MATURE;
  if (score >= (thresholds[TreeStage.TREE] || 60)) return TreeStage.TREE;
  if (score >= (thresholds[TreeStage.SAPLING] || 30)) return TreeStage.SAPLING;
  if (score >= (thresholds[TreeStage.SPROUT] || 10)) return TreeStage.SPROUT;
  return TreeStage.SEED;
};

const getProgressInfo = (score: number, thresholds: AppConfig['thresholds']) => {
  if (score < 0) return { nextStage: null, pointsNeeded: 0, progressPercent: 0, currentThreshold: 0, nextThreshold: 0 };
  
  const levels = [
    { stage: TreeStage.SEED, threshold: thresholds[TreeStage.SEED] || 0 },
    { stage: TreeStage.SPROUT, threshold: thresholds[TreeStage.SPROUT] || 10 },
    { stage: TreeStage.SAPLING, threshold: thresholds[TreeStage.SAPLING] || 30 },
    { stage: TreeStage.TREE, threshold: thresholds[TreeStage.TREE] || 60 },
    { stage: TreeStage.MATURE, threshold: thresholds[TreeStage.MATURE] || 100 },
    { stage: TreeStage.BLOOMING, threshold: thresholds[TreeStage.BLOOMING] || 150 },
  ];

  for (let i = 0; i < levels.length - 1; i++) {
    const current = levels[i];
    const next = levels[i+1];
    if (score >= current.threshold && score < next.threshold) {
      const totalRange = next.threshold - current.threshold;
      const progress = score - current.threshold;
      return {
        nextStage: next.stage,
        pointsNeeded: next.threshold - score,
        progressPercent: (progress / totalRange) * 100,
        currentThreshold: current.threshold,
        nextThreshold: next.threshold
      };
    }
  }
  return { nextStage: null, pointsNeeded: 0, progressPercent: 100, currentThreshold: 150, nextThreshold: 150 };
};

const getSeasonalHoliday = (): Holiday => {
  const now = new Date();
  const month = now.getMonth(); 
  const date = now.getDate();
  if (month === 11 && date >= 20) return 'christmas';
  if (month === 0 || (month === 1 && date <= 15)) return 'new_year';
  if ((month === 2 && date >= 20) || month === 3) return 'sakura';
  return 'none';
};

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alice', score: 120, treeType: TreeType.SAKURA, history: [], group: 'Group A', seatIndex: 0 },
  { id: '2', name: 'Bob', score: 45, treeType: TreeType.OAK, history: [], group: 'Group A', seatIndex: 1 },
  { id: '3', name: 'Charlie', score: -5, treeType: TreeType.PINE, history: [], group: 'Group B', seatIndex: 2 },
  { id: '4', name: 'David', score: 10, treeType: TreeType.BAMBOO, history: [], group: 'Group B', seatIndex: 6 },
  { id: '5', name: 'Eve', score: 75, treeType: TreeType.APPLE, history: [], group: 'Group C', seatIndex: 7 },
  { id: '6', name: 'Frank', score: 15, treeType: TreeType.OAK, history: [], group: 'Group C', seatIndex: 8 },
];

function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('classTree_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('classTree_config');
    return saved ? JSON.parse(saved) : { thresholds: DEFAULT_THRESHOLDS, treeStyle: 'flat', language: 'zh' };
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [focusedStudentId, setFocusedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [scoreAmount, setScoreAmount] = useState<number>(1);
  const [scoreReason, setScoreReason] = useState<string>('');
  const [currentHoliday, setCurrentHoliday] = useState<Holiday>('none');

  useEffect(() => {
    setCurrentHoliday(getSeasonalHoliday());
  }, []);

  useEffect(() => {
    localStorage.setItem('classTree_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('classTree_config', JSON.stringify(config));
  }, [config]);

  const t = TRANSLATIONS[config.language];

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = filterGroup === 'All' || s.group === filterGroup;
      return matchesSearch && matchesGroup;
    });
  }, [students, searchQuery, filterGroup]);

  const statsData = useMemo(() => {
    return [...students]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => ({ name: s.name, score: s.score }));
  }, [students]);

  const handleScoreChange = (ids: string[], delta: number, reason: string) => {
    const timestamp = Date.now();
    setStudents(prev => prev.map(s => {
      if (!ids.includes(s.id)) return s;
      const newLog: LogEntry = {
        id: generateId(),
        timestamp,
        scoreDelta: delta,
        reason: reason || (delta > 0 ? 'Good Behavior' : 'Correction'),
        category: delta > 0 ? 'behavior' : 'other'
      };
      return {
        ...s,
        score: s.score + delta,
        history: [newLog, ...s.history]
      };
    }));
    setFocusedStudentId(null);
    setSelectedStudentIds(new Set());
    setScoreReason('');
  };

  const handleChangeTreeType = (studentId: string, newType: TreeType) => {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, treeType: newType } : s));
  };

  const handleImportStudents = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const newStudents: Student[] = lines.map((line, idx) => {
      const parts = line.split(/[,\t;]+/);
      const name = parts[0].trim();
      const group = parts[1] ? parts[1].trim() : undefined;
      return {
        id: generateId(),
        name,
        group,
        score: 0,
        treeType: getRandomTreeType(),
        history: [],
        seatIndex: students.length + idx
      };
    });
    setStudents(prev => [...prev, ...newStudents]);
  };

  const handleDeleteStudent = (id: string, confirm: boolean = true) => {
      if(!confirm || window.confirm(t.confirmDelete)) {
          setStudents(prev => prev.filter(s => s.id !== id));
          if(focusedStudentId === id) setFocusedStudentId(null);
      }
  };

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Group,Score,TreeType\n"
        + students.map(e => `${e.id},${e.name},${e.group || ''},${e.score},${e.treeType}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "classroom_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const LuckyDrawModal = () => {
      const [spinning, setSpinning] = useState(false);
      const [winner, setWinner] = useState<Student | null>(null);
      const [displayWinner, setDisplayWinner] = useState<string>("???");
      const spin = () => {
          if (students.length === 0) return;
          setSpinning(true);
          setWinner(null);
          let counter = 0;
          const interval = setInterval(() => {
              const randomStudent = students[Math.floor(Math.random() * students.length)];
              setDisplayWinner(randomStudent.name);
              counter++;
              if (counter > 15) {
                  clearInterval(interval);
                  const finalWinner = students[Math.floor(Math.random() * students.length)];
                  setDisplayWinner(finalWinner.name);
                  setWinner(finalWinner);
                  setSpinning(false);
              }
          }, 100);
      };
      return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center relative">
                   <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Dice5 className="w-6 h-6" /> {t.luckyDrawTitle}
                        </h2>
                   </div>
                   <div className="p-8">
                       <div className="h-24 flex items-center justify-center mb-6">
                           {winner ? (
                               <div className="animate-in zoom-in duration-300">
                                   <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                                       {displayWinner}
                                   </div>
                                   <div className="text-sm text-gray-500">{winner.group}</div>
                               </div>
                           ) : (
                               <div className="text-4xl font-bold text-gray-300">{displayWinner}</div>
                           )}
                       </div>
                       <button onClick={spin} disabled={spinning || students.length === 0}
                         className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                           {spinning ? '...' : t.luckyDrawBtn}
                       </button>
                   </div>
                   <button onClick={() => setIsLuckyDrawOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                       <X className="w-6 h-6" />
                   </button>
              </div>
          </div>
      );
  };

  const StudentManager = () => {
    const [importText, setImportText] = useState('');
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentGroup, setNewStudentGroup] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'roster'>('general');
    const [rosterSearch, setRosterSearch] = useState('');
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
              <Users className="w-6 h-6" /> {t.manage}
            </h2>
            <button onClick={() => setIsManageModalOpen(false)} className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex border-b border-gray-200 bg-white px-6 pt-4">
             <button onClick={() => setActiveTab('general')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'general' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>{t.general}</button>
             <button onClick={() => setActiveTab('roster')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'roster' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>{t.roster}</button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {activeTab === 'general' ? (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" /> {t.settings}</h3>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.language}</label>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {['zh', 'en'].map(lang => (
                                        <button key={lang} onClick={() => setConfig(prev => ({ ...prev, language: lang as any }))}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${config.language === lang ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {lang === 'zh' ? '中文' : 'English'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.treeStyle}</label>
                                <select value={config.treeStyle} onChange={(e) => setConfig(prev => ({ ...prev, treeStyle: e.target.value as any }))}
                                    className="w-full bg-gray-100 border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500">
                                    <option value="flat">{t.styleFlat}</option>
                                    <option value="pixel">{t.stylePixel}</option>
                                    <option value="realism">{t.styleRealism}</option>
                                    <option value="sketch">{t.styleSketch}</option>
                                    <option value="origami">{t.styleOrigami}</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    <hr className="border-gray-100" />
                    <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-500" /> {t.addStudent}</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Name" className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} />
                        <input type="text" placeholder="Group" className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={newStudentGroup} onChange={e => setNewStudentGroup(e.target.value)} />
                        <button disabled={!newStudentName} onClick={() => {
                            setStudents(prev => [...prev, { id: generateId(), name: newStudentName, group: newStudentGroup, score: 0, treeType: getRandomTreeType(), history: [], seatIndex: students.length }]);
                            setNewStudentName(''); setNewStudentGroup('');
                        }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                    </section>
                    <hr className="border-gray-100" />
                    <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-blue-500" /> {t.batchImport}</h3>
                    <textarea className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm font-mono bg-gray-50" placeholder={t.importPlaceholder} value={importText} onChange={e => setImportText(e.target.value)} />
                    <div className="mt-2 flex justify-end">
                        <button disabled={!importText} onClick={() => { handleImportStudents(importText); setImportText(''); alert(t.importSuccess); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"><Upload className="w-4 h-4" /> {t.batchImport}</button>
                    </div>
                    </section>
                    <hr className="border-gray-100" />
                    <section className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-700">{t.dataControl}</h3>
                        <div className="flex gap-2">
                        <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"><Download className="w-4 h-4" /> {t.exportCSV}</button>
                        <button onClick={() => { if(window.confirm(t.confirmReset)) { setStudents([]); } }} className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /> {t.resetAll}</button>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-500">{t.totalStudents}: {students.length}</span>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={rosterSearch} onChange={(e) => setRosterSearch(e.target.value)} placeholder={t.searchPlaceholder}
                                className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">{t.group}</th>
                                    <th className="px-4 py-3 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.filter(s => s.name.toLowerCase().includes(rosterSearch.toLowerCase())).map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 group">
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{s.name.charAt(0)}</div>
                                                {s.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="text" defaultValue={s.group || ''} onBlur={(e) => {
                                                    const newGroup = e.target.value.trim();
                                                    if(newGroup !== s.group) { setStudents(prev => prev.map(p => p.id === s.id ? {...p, group: newGroup} : p)); }
                                                }} onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
                                                className="bg-transparent hover:bg-white border border-transparent hover:border-gray-200 focus:bg-white focus:border-emerald-400 rounded px-2 py-1 w-full max-w-[140px] transition-all outline-none" placeholder="No Group" />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button onClick={() => handleDeleteStudent(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title={t.removeStudent}><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DailySummaryModal = () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayStart = today.getTime();
      const summaryData = students.map(s => {
          const todayPoints = s.history.filter(h => h.timestamp >= todayStart).reduce((acc, curr) => acc + curr.scoreDelta, 0);
          return { ...s, todayPoints };
      }).sort((a,b) => b.todayPoints - a.todayPoints);
      const topGainers = summaryData.filter(s => s.todayPoints > 0).slice(0, 3);
      const totalPointsToday = summaryData.reduce((acc, curr) => acc + curr.todayPoints, 0);
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6" /> {t.dailySummary}</h2>
                        <p className="text-emerald-100 opacity-90 mt-1">{today.toLocaleDateString()}</p>
                    </div>
                    <Sprout className="absolute -bottom-8 -right-8 w-32 h-32 text-white/20" />
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t.todaysGrowth}</span>
                        <div className="text-5xl font-black text-emerald-600 mt-2">{totalPointsToday > 0 ? '+' : ''}{totalPointsToday}</div>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> {t.topStudents}</h3>
                    <div className="space-y-3">
                        {topGainers.length === 0 ? <p className="text-center text-gray-400 italic py-4">No points recorded today.</p> : topGainers.map((s, idx) => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-400' : 'bg-gray-300'}`}>{idx + 1}</div>
                                        <span className="font-medium text-gray-700">{s.name}</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">+{s.todayPoints}</span>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={() => setIsDailySummaryOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-colors">{t.close}</button>
                </div>
            </div>
        </div>
      );
  };

  const StudentDetailModal = () => {
    const student = students.find(s => s.id === focusedStudentId);
    if (!student) return null;
    const [isEditingType, setIsEditingType] = useState(false);
    const stage = getStageFromScore(student.score, config.thresholds);
    const progress = getProgressInfo(student.score, config.thresholds);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
            <div className={`md:w-1/2 p-8 flex flex-col items-center justify-center relative transition-colors duration-500 ${stage === TreeStage.WITHERED ? 'bg-gray-200' : 'bg-gradient-to-br from-emerald-50 to-sky-100'}`}>
                <div className="absolute top-4 left-4 flex gap-2">
                     <div className="bg-white/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600">{student.treeType} • {stage}</div>
                    <button onClick={() => setIsEditingType(!isEditingType)} className="bg-white/50 hover:bg-white p-1 rounded-full text-gray-500 hover:text-emerald-600 transition-colors" title={t.changeTreeType}><Edit3 className="w-3 h-3" /></button>
                </div>
                {isEditingType && (
                    <div className="absolute top-12 left-4 bg-white shadow-xl rounded-lg p-2 flex flex-col gap-1 z-10 animate-in fade-in zoom-in duration-200">
                        {Object.values(TreeType).map(type => (
                            <button key={type} onClick={() => { handleChangeTreeType(student.id, type); setIsEditingType(false); }} className={`text-left px-3 py-1.5 text-sm rounded hover:bg-emerald-50 ${student.treeType === type ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-gray-600'}`}>{type}</button>
                        ))}
                    </div>
                )}
                <TreeVisual type={student.treeType} stage={stage} style={config.treeStyle} holiday={currentHoliday} className="w-64 h-80" />
                <div className="mt-6 text-center w-full max-w-xs">
                    <h2 className="text-4xl font-black text-gray-800">{student.name}</h2>
                    <p className="text-gray-500 font-medium mt-1">{student.group || 'No Group'}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm text-xl font-bold text-emerald-600 mb-4"><Trophy className="w-5 h-5" />{student.score} {t.points}</div>
                    {progress.nextStage && (
                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide"><span>{stage}</span><span>{progress.nextStage} ({progress.pointsNeeded}pts)</span></div>
                            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${progress.progressPercent}%` }} /></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="md:w-1/2 flex flex-col bg-white">
                 <div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-gray-500 uppercase tracking-widest text-sm">Action Center</h3><button onClick={() => setFocusedStudentId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button></div>
                 <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.addPoints}</label>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                             {[1, 5, 10].map(amt => (<button key={amt} onClick={() => setScoreAmount(amt)} className={`py-2 rounded-lg font-bold border transition-all ${scoreAmount === amt ? 'bg-emerald-100 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}>+{amt}</button>))}
                             <button onClick={() => setScoreAmount(-5)} className={`py-2 rounded-lg font-bold border transition-all ${scoreAmount === -5 ? 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-500' : 'border-gray-200 hover:border-red-300'}`}>-5</button>
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={scoreReason} onChange={e => setScoreReason(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder={t.reasonPlaceholder} />
                            <button onClick={() => handleScoreChange([student.id], scoreAmount, scoreReason)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-1"><Save className="w-4 h-4" /> {t.apply}</button>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {t.history}</h4>
                        <div className="space-y-3">
                            {student.history.length === 0 && <p className="text-gray-400 text-sm italic">No history yet.</p>}
                            {student.history.slice(0, 10).map(log => (
                                <div key={log.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col"><span className="font-medium text-gray-700">{log.reason}</span><span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}</span></div>
                                    <span className={`font-bold ${log.scoreDelta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{log.scoreDelta > 0 ? '+' : ''}{log.scoreDelta}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 <div className="p-4 border-t bg-gray-50 flex justify-between">
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"><Trash2 className="w-4 h-4" /> {t.removeStudent}</button>
                 </div>
            </div>
        </div>
      </div>
    );
  };

  const Leaderboard = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
         <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> {t.leaderboard}</h2><button onClick={() => setIsStatsModalOpen(false)}><X className="w-5 h-5" /></button></div>
         <div className="p-6 overflow-y-auto">
            <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip cursor={{fill: '#f0fdf4'}} /><Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6">
                <h3 className="font-bold text-emerald-800 mb-4">{t.topStudents}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statsData.slice(0, 6).map((s, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-emerald-200'}`}>{idx + 1}</div>
                            <span className="font-medium text-gray-700 flex-1">{s.name}</span><span className="font-bold text-emerald-600">{s.score} {t.points}</span>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderStudentCard = (student: Student) => {
    const isSelected = selectedStudentIds.has(student.id);
    const stage = getStageFromScore(student.score, config.thresholds);
    return (
        <div key={student.id} onClick={() => {
                if (selectedStudentIds.size > 0) {
                    const next = new Set(selectedStudentIds);
                    if(next.has(student.id)) next.delete(student.id); else next.add(student.id);
                    setSelectedStudentIds(next);
                } else { setFocusedStudentId(student.id); }
            }} onContextMenu={(e) => {
                e.preventDefault();
                const next = new Set(selectedStudentIds);
                if(next.has(student.id)) next.delete(student.id); else next.add(student.id);
                setSelectedStudentIds(next);
            }} className={`group relative bg-white rounded-2xl p-4 cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-emerald-400 shadow-xl scale-95' : 'hover:shadow-xl hover:-translate-y-1 ring-1 ring-gray-100 hover:ring-emerald-200'} flex flex-col justify-between`}>
            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 bg-white group-hover:border-emerald-300'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
            <div className="mb-2 pt-2 flex justify-center"><TreeVisual type={student.treeType} stage={stage} style={config.treeStyle} holiday={currentHoliday} className={viewMode === 'seats' ? "w-16 h-20" : ""} /></div>
            <div className="text-center"><h3 className="font-bold text-gray-800 truncate px-2 text-sm">{student.name}</h3><div className="flex items-center justify-center gap-2 mt-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.score < 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{student.score} {t.points}</span></div></div>
        </div>
    );
  };

  const renderLayout = () => {
      if (filteredStudents.length === 0) {
          return (<div className="flex flex-col items-center justify-center py-24 text-gray-400"><Sprout className="w-16 h-16 mb-4 opacity-50" /><p className="text-xl font-medium">{t.noStudents}</p><button onClick={() => setIsManageModalOpen(true)} className="mt-4 text-emerald-600 hover:underline">{t.addSome}</button></div>);
      }
      if (viewMode === 'forest') {
          const groupsMap: Record<string, Student[]> = {};
          filteredStudents.forEach(s => { const g = s.group || 'Unassigned'; if (!groupsMap[g]) groupsMap[g] = []; groupsMap[g].push(s); });
          return (<div className="space-y-12">{Object.entries(groupsMap).map(([groupName, groupStudents]) => (<div key={groupName} className="bg-white/50 rounded-3xl p-6 border border-emerald-100/50"><h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2"><span className="w-2 h-8 bg-emerald-400 rounded-full"></span>{groupName}</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">{groupStudents.map(renderStudentCard)}</div></div>))}</div>);
      }
      if (viewMode === 'seats') {
        return (<div className="bg-white/40 border border-gray-200 rounded-xl p-8 overflow-x-auto"><div className="grid grid-cols-6 gap-4 min-w-[800px]">{filteredStudents.map(renderStudentCard)}</div><div className="mt-8 text-center text-gray-400 text-sm font-medium uppercase tracking-widest border-t border-gray-300 pt-2">Chalkboard / Screen</div></div>);
      }
      return (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">{filteredStudents.map(renderStudentCard)}</div>);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="bg-emerald-100 p-2 rounded-lg"><Sprout className="w-6 h-6 text-emerald-600" /></div><h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 hidden md:block">{t.appTitle}</h1></div>
          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="relative flex-1 group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-emerald-300 rounded-full py-2 pl-10 pr-4 text-sm transition-all outline-none" /></div>
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`} title={t.grid}><Grid className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('forest')} className={`p-2 rounded-md transition-all ${viewMode === 'forest' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`} title={t.forests}><Layers className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('seats')} className={`p-2 rounded-md transition-all ${viewMode === 'seats' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`} title={t.seats}><Armchair className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsLuckyDrawOpen(true)} className="p-2 text-purple-500 hover:bg-purple-100 rounded-lg transition-colors" title={t.luckyDraw}><Dice5 className="w-5 h-5" /></button>
            <button onClick={() => setIsDailySummaryOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title={t.dailySummary}><Calendar className="w-5 h-5" /></button>
            <button onClick={() => setIsStatsModalOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title={t.leaderboard}><Trophy className="w-5 h-5" /></button>
            <button onClick={() => setIsManageModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"><Settings className="w-4 h-4" /> <span className="hidden sm:inline">{t.manage}</span></button>
          </div>
        </div>
      </header>

      {selectedStudentIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-full shadow-2xl border border-gray-200 p-2 px-6 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <span className="font-bold text-gray-700 whitespace-nowrap">{selectedStudentIds.size} {t.selected}</span>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <button onClick={() => handleScoreChange(Array.from(selectedStudentIds), 1, 'Batch update')} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-full transition-colors font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> 1</button>
              <button onClick={() => handleScoreChange(Array.from(selectedStudentIds), 5, 'Batch update')} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-full transition-colors font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> 5</button>
               <button onClick={() => handleScoreChange(Array.from(selectedStudentIds), -1, 'Batch penalty')} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors font-bold flex items-center gap-1"><Minus className="w-4 h-4" /> 1</button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <button onClick={() => setSelectedStudentIds(new Set())} className="text-gray-400 hover:text-gray-600 text-sm font-medium">{t.clear}</button>
          </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderLayout()}</main>
      
      {isManageModalOpen && <StudentManager />}
      {focusedStudentId && <StudentDetailModal />}
      {isStatsModalOpen && <Leaderboard />}
      {isDailySummaryOpen && <DailySummaryModal />}
      {isLuckyDrawOpen && <LuckyDrawModal />}
    </div>
  );
}

// ==========================================
// SECTION 4: MOUNTING
// ==========================================

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);