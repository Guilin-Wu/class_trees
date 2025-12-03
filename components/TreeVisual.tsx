import React, { useMemo } from 'react';
import { TreeType, TreeStage, TreeStyle, Holiday } from '../types';

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
      // Simplified Pixel Art Logic: Use rects instead of smooth paths
      
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
      
      // Generic Pixel Tree
      return (
          <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
              {/* Trunk */}
              <rect x="90" y="100" width="20" height="90" fill={colors.trunk} />
              
              {/* Foliage Blocks */}
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
                      {/* Fruits */}
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
    // Add gradients
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
      // Geometric, folded paper look
      // Split shapes into two tones to simulate a fold
      const renderFoldedPoly = (points: string, color: string, shadeColor: string) => {
          // This is a simplification. Real origami would split the shape.
          // We will render the shape, then overlay a semi-transparent black half to "fold" it.
          return (
              <g>
                <polygon points={points} fill={color} />
                <polygon points={points} fill="black" opacity="0.1" clipPath="url(#left-half-clip)" />
              </g>
          );
      };

      const trunkColor = colors.trunk;
      const foliageColor = colors.foliage;

      if (stage === TreeStage.SEED) {
          return <polygon points="90,180 110,180 100,165" fill={trunkColor} />;
      }

      return (
        <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
            {/* Trunk */}
            <polygon points="90,190 110,190 105,100 95,100" fill={trunkColor} />
            <polygon points="90,190 100,190 100,100 95,100" fill="black" opacity="0.15" />

            {/* Foliage */}
            {type === TreeType.PINE ? (
                <g>
                    <polygon points="50,130 150,130 100,60" fill={foliageColor} />
                    <polygon points="50,130 100,130 100,60" fill="black" opacity="0.1" />
                    
                    <polygon points="60,90 140,90 100,30" fill={foliageColor} />
                    <polygon points="60,90 100,90 100,30" fill="black" opacity="0.1" />
                </g>
            ) : type === TreeType.BAMBOO ? (
                <g>
                    {/* Bamboo segments */}
                    <polygon points="90,190 110,190 110,150 90,150" fill={trunkColor} />
                    <polygon points="90,190 100,190 100,150 90,150" fill="black" opacity="0.15" />
                    
                    <polygon points="92,148 108,148 108,100 92,100" fill={trunkColor} />
                    <polygon points="92,148 100,148 100,100 92,100" fill="black" opacity="0.15" />
                    
                    {/* Leaves */}
                    <polygon points="108,120 140,100 110,110" fill={foliageColor} />
                    <polygon points="92,140 60,120 90,130" fill={foliageColor} />
                </g>
            ) : (
                <g>
                    {/* Standard crown: Diamond/Triangle combo */}
                     <polygon points="100,30 160,100 100,170 40,100" fill={foliageColor} />
                     <polygon points="40,100 100,170 100,30" fill="black" opacity="0.1" />
                </g>
            )}

             {/* Fruits */}
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
    // Hand-drawn style: thick strokes, no fills or white fills, wobbly lines
    const strokeProps = {
        stroke: '#292524',
        strokeWidth: '2.5',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        fill: 'transparent'
    };
    
    // Fill with slight color opacity for sketch
    const fillStyle = { fill: colors.foliage, opacity: 0.5 };
    const trunkFillStyle = { fill: colors.trunk, opacity: 0.5 };

    if (stage === TreeStage.SEED) {
        return <circle cx="100" cy="180" r="8" {...strokeProps} fill={colors.trunk} fillOpacity="0.5" />;
    }

    const isBamboo = type === TreeType.BAMBOO;
    const isPine = type === TreeType.PINE;

    return (
        <g transform={`translate(100, 190) scale(${scale}) translate(-100, -190)`}>
             {/* Trunk */}
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

             {/* Foliage */}
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

             {/* Fruits/Flowers - Sketchy circles */}
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
             {/* Trunk */}
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

             {/* Foliage */}
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

             {/* Fruits/Flowers */}
             {(stage === TreeStage.BLOOMING || stage === TreeStage.MATURE) && colors.fruit !== 'transparent' && (
                 <g transform="translate(100, 70)">
                     <circle cx="-20" cy="0" r="4" fill={colors.fruit} />
                     <circle cx="25" cy="-10" r="4" fill={colors.fruit} />
                     <circle cx="0" cy="-35" r="4" fill={colors.fruit} />
                 </g>
             )}

             {/* Holiday Decorations */}
             {holiday === 'christmas' && isPine && (
                 <g transform="translate(100, 40)">
                     {/* Star */}
                     <path d="M0,-90 L5,-80 L-5,-80 Z" fill="#fbbf24" transform="scale(1.5)" />
                     {/* Ornaments */}
                     <circle cx="-20" cy="10" r="3" fill="#ef4444" />
                     <circle cx="10" cy="40" r="3" fill="#3b82f6" />
                     <circle cx="-10" cy="70" r="3" fill="#fbbf24" />
                 </g>
             )}

             {holiday === 'new_year' && !isBamboo && (
                 <g transform="translate(100, 100)">
                     {/* Lantern */}
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

export default TreeVisual;