import React from 'react';

/* =========================================================================
   TALQEEH — POKÉMON BATTLE CHARACTER SPRITES & ANIMATIONS
   - PixelBattlefield: Retro 16-bit Al-Azhar battlefield arena backdrop
   - PixelPlatform: 2.5D stepped pixel pedestals for Boss & Player
   - PlayerSprite: Thalib Al-Azhar (Back-view with Azhari Tarboush & Kakula)
   - BossSprite:
       * Balaghah: Kitab Al-Bayan (Winged Tome of Metaphors)
       * Nahwu: Ra'du Al-Alfiyah (Thunder Grammarian Golem)
       * Ushul: Mizan Al-Qadhi (Celestial Sphinx Balance)
       * Custom: Enchanted Grand Diktat
   - BattleProjectiles & FloatingDamage Text
   ========================================================================= */

/* ── 0. RETRO PIXEL BATTLEFIELD (MEDAN TEMPUR AL-AZHAR) ── */
export function PixelBattlefield({ bossType = 'balaghah-majaz' }) {
  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';

  // Ground accent colors based on boss subject
  const groundPrimary = isNahwu ? '#0d1522' : isUshul ? '#1c140d' : '#0a1612';
  const groundSecondary = isNahwu ? '#152136' : isUshul ? '#281c12' : '#0f221c';
  const gridLine = isNahwu ? '#38bdf8' : isUshul ? '#fbbf24' : '#34d399';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <svg
        viewBox="0 0 640 320"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {/* 1. SKY DITHERED GRADIENT BANDS (16-bit Arcade Night) */}
        <rect x="0" y="0" width="640" height="32" fill="#040711" />
        <rect x="0" y="32" width="640" height="28" fill="#080d1e" />
        <rect x="0" y="60" width="640" height="28" fill="#0d162d" />
        <rect x="0" y="88" width="640" height="26" fill="#14203e" />
        <rect x="0" y="114" width="640" height="24" fill="#1b2a4f" />
        <rect x="0" y="138" width="640" height="16" fill="#233660" />

        {/* 2. PIXEL CRESCENT MOON (HILAL) */}
        <g transform="translate(480, 22)">
          <rect x="4" y="2" width="18" height="22" fill="#fef08a" opacity="0.15" />
          <rect x="6" y="0" width="12" height="4" fill="#fef08a" />
          <rect x="4" y="4" width="8" height="4" fill="#fef08a" />
          <rect x="2" y="8" width="6" height="8" fill="#fef08a" />
          <rect x="4" y="16" width="8" height="4" fill="#fef08a" />
          <rect x="6" y="20" width="12" height="4" fill="#fef08a" />
          <rect x="6" y="4" width="6" height="4" fill="#ffffff" />
          <rect x="4" y="8" width="4" height="8" fill="#ffffff" />
          <rect x="6" y="16" width="6" height="4" fill="#ffffff" />
        </g>

        {/* 3. PIXEL STARS (Blinking retro dots) */}
        <rect x="38" y="18" width="3" height="3" fill="#ffffff" opacity="0.9" className="animate-pulse" />
        <rect x="86" y="42" width="2" height="2" fill="#fef08a" opacity="0.8" />
        <rect x="140" y="14" width="2" height="2" fill="#ffffff" opacity="0.7" />
        <rect x="198" y="36" width="3" height="3" fill="#38bdf8" opacity="0.9" className="animate-pulse" />
        <rect x="270" y="22" width="2" height="2" fill="#ffffff" opacity="0.85" />
        <rect x="340" y="48" width="2" height="2" fill="#fef08a" opacity="0.75" />
        <rect x="410" y="18" width="3" height="3" fill="#ffffff" opacity="0.9" className="animate-pulse" />
        <rect x="550" y="40" width="2" height="2" fill="#38bdf8" opacity="0.8" />
        <rect x="610" y="26" width="3" height="3" fill="#ffffff" opacity="0.9" />

        {/* 4. DISTANT AL-AZHAR SKYLINE SILHOUETTE */}
        {/* Minaret 1 (Far left) */}
        <rect x="48" y="64" width="14" height="90" fill="#0c1626" />
        <rect x="44" y="64" width="22" height="4" fill="#0c1626" />
        <rect x="51" y="46" width="8" height="18" fill="#0c1626" />
        <rect x="48" y="46" width="14" height="3" fill="#0c1626" />
        <rect x="53" y="32" width="4" height="14" fill="#0c1626" />

        {/* Dome 1 (Far left) */}
        <path
          d="M100 154 H160 V126 H154 V118 H146 V112 H138 V108 H122 V112 H114 V118 H106 V126 H100 Z"
          fill="#0c1626"
        />
        <rect x="128" y="98" width="4" height="10" fill="#0c1626" />

        {/* Grand Al-Azhar Minaret (Center-left) */}
        <rect x="220" y="52" width="20" height="102" fill="#101d33" />
        <rect x="214" y="78" width="32" height="6" fill="#142542" />
        <rect x="216" y="50" width="28" height="5" fill="#142542" />
        <rect x="223" y="32" width="14" height="18" fill="#101d33" />
        <rect x="220" y="30" width="20" height="4" fill="#142542" />
        <rect x="227" y="16" width="6" height="14" fill="#142542" />
        <rect x="228" y="10" width="4" height="6" fill="#fbbf24" />

        {/* Windows with warm pixel amber light in Al-Azhar minaret */}
        <rect x="227" y="90" width="6" height="10" fill="#fbbf24" opacity="0.85" />
        <rect x="228" y="60" width="4" height="8" fill="#fbbf24" opacity="0.85" />

        {/* Grand Azhari Main Dome (Center) */}
        <path
          d="M264 154 H356 V134 H350 V124 H342 V116 H330 V110 H290 V116 H278 V124 H270 V134 H264 Z"
          fill="#101d33"
        />
        <rect x="307" y="98" width="6" height="12" fill="#142542" />
        <rect x="308" y="92" width="4" height="6" fill="#fbbf24" />

        {/* Minaret 3 (Mamluk double-finial minaret, right) */}
        <rect x="396" y="56" width="18" height="98" fill="#101d33" />
        <rect x="392" y="84" width="26" height="5" fill="#142542" />
        <rect x="392" y="54" width="26" height="5" fill="#142542" />
        <rect x="398" y="36" width="14" height="18" fill="#101d33" />
        <rect x="396" y="22" width="5" height="14" fill="#142542" />
        <rect x="407" y="22" width="5" height="14" fill="#142542" />
        <rect x="402" y="64" width="6" height="10" fill="#fbbf24" opacity="0.85" />

        {/* Distant Fortress Ramparts & Battlements (Right) */}
        <rect x="450" y="130" width="190" height="24" fill="#0c1626" />
        {[454, 474, 494, 514, 534, 554, 574, 594, 614].map(bx => (
          <rect key={bx} x={bx} y={122} width="10" height="8" fill="#0c1626" />
        ))}

        {/* 5. HORIZON DIVIDER WITH ISLAMIC PIXEL STAR FRIEZE */}
        <rect x="0" y="154" width="640" height="4" fill="#070b09" />
        <rect x="0" y="156" width="640" height="2" fill={gridLine} opacity="0.6" />

        {/* 6. BATTLEFIELD GROUND: SAHAT AL-AZHAR (PERSPECTIVE TILES) */}
        <rect x="0" y="158" width="640" height="8" fill={groundPrimary} />
        <rect x="0" y="166" width="640" height="12" fill={groundSecondary} />
        <rect x="0" y="178" width="640" height="16" fill={groundPrimary} />
        <rect x="0" y="194" width="640" height="22" fill={groundSecondary} />
        <rect x="0" y="216" width="640" height="28" fill={groundPrimary} />
        <rect x="0" y="244" width="640" height="36" fill={groundSecondary} />
        <rect x="0" y="280" width="640" height="40" fill={groundPrimary} />

        {/* Perspective Grid Lines (Authentic Pokémon Battle Ground Perspective) */}
        <line x1="280" y1="158" x2="40" y2="320" stroke={gridLine} strokeWidth="1.2" opacity="0.2" />
        <line x1="300" y1="158" x2="160" y2="320" stroke={gridLine} strokeWidth="1.2" opacity="0.25" />
        <line x1="320" y1="158" x2="320" y2="320" stroke={gridLine} strokeWidth="1.2" opacity="0.3" />
        <line x1="340" y1="158" x2="480" y2="320" stroke={gridLine} strokeWidth="1.2" opacity="0.25" />
        <line x1="360" y1="158" x2="600" y2="320" stroke={gridLine} strokeWidth="1.2" opacity="0.2" />
      </svg>
    </div>
  );
}

/* ── 0.1 RETRO 2.5D PIXEL BATTLE PEDESTALS (PIJAKAN MEDAN TEMPUR) ── */
export function PixelPlatform({ type = 'boss', bossType = 'balaghah-majaz', className = '' }) {
  const isBoss = type === 'boss';

  if (isBoss) {
    const isNahwu = bossType === 'nahwu-fail';
    const isUshul = bossType === 'ushul-amr';

    const rimColor = isNahwu ? '#334155' : isUshul ? '#78350f' : '#064e3b';
    const rimDark = isNahwu ? '#1e293b' : isUshul ? '#451a03' : '#022c22';
    const faceColor = isNahwu ? '#1e293b' : isUshul ? '#451a03' : '#064e3b';
    const runeGlow = isNahwu ? '#38bdf8' : isUshul ? '#fbbf24' : '#34d399';
    const borderGold = isNahwu ? '#facc15' : isUshul ? '#f59e0b' : '#10b981';

    return (
      <div className={`relative select-none pointer-events-none flex flex-col items-center ${className}`}>
        <svg
          viewBox="0 0 160 56"
          className="w-36 sm:w-44 h-12 sm:h-14 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          shapeRendering="crispEdges"
        >
          {/* Drop shadow */}
          <ellipse cx="80" cy="46" rx="74" ry="9" fill="#030504" opacity="0.8" />
          {/* Extrusion 3D Rim (Stepped vertical edge) */}
          <path
            d="M10 24 H150 V34 H146 V38 H138 V42 H124 V45 H106 V47 H54 V45 H36 V42 H22 V38 H14 V34 H10 Z"
            fill={rimDark}
          />
          <path
            d="M14 26 H146 V32 H142 V36 H134 V40 H120 V43 H104 V45 H56 V43 H40 V40 H26 V36 H18 V32 H14 Z"
            fill={rimColor}
          />
          {/* Top Face (Isometric Ellipse with stepped staircase pixels) */}
          <path
            d="M40 8 H120 V11 H134 V14 H144 V17 H150 V21 H144 V24 H134 V27 H120 V30 H40 V27 H26 V24 H16 V21 H10 V17 H16 V14 H26 V11 H40 Z"
            fill={faceColor}
          />
          {/* Inner Ring */}
          <path
            d="M46 12 H114 V14 H126 V17 H134 V21 H126 V24 H114 V26 H46 V24 H34 V21 H26 V17 H34 V14 H46 Z"
            fill="#021a14"
            stroke={borderGold}
            strokeWidth="1.5"
          />
          {/* Arcane Pixel Rune Center */}
          <rect x="77" y="16" width="6" height="6" fill={runeGlow} />
          <rect x="67" y="18" width="4" height="3" fill={runeGlow} opacity="0.8" />
          <rect x="89" y="18" width="4" height="3" fill={runeGlow} opacity="0.8" />
          <rect x="78" y="11" width="4" height="3" fill={runeGlow} opacity="0.8" />
          <rect x="78" y="24" width="4" height="3" fill={runeGlow} opacity="0.8" />
        </svg>
      </div>
    );
  }

  // Player Platform (Wider Foreground Pedestal)
  return (
    <div className={`relative select-none pointer-events-none flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 190 64"
        className="w-44 sm:w-56 h-14 sm:h-18 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
        shapeRendering="crispEdges"
      >
        {/* Drop Shadow */}
        <ellipse cx="95" cy="54" rx="90" ry="10" fill="#020403" opacity="0.9" />
        {/* Extrusion 3D Rim (Stepped front face) */}
        <path
          d="M12 28 H178 V38 H172 V44 H160 V49 H142 V53 H120 V56 H70 V53 H48 V49 H30 V44 H18 V38 H12 Z"
          fill="#0f172a"
        />
        <path
          d="M16 30 H174 V36 H168 V42 H156 V47 H138 V51 H116 V54 H74 V51 H52 V47 H34 V42 H22 V36 H16 Z"
          fill="#064e3b"
        />
        {/* Top Face */}
        <path
          d="M46 10 H144 V14 H160 V18 H172 V22 H178 V26 H172 V30 H160 V34 H144 V38 H46 V34 H30 V30 H18 V26 H12 V22 H18 V18 H30 V14 H46 Z"
          fill="#022c22"
        />
        {/* Gold Pixel Border */}
        <path
          d="M52 14 H138 V17 H152 V21 H162 V25 H152 V29 H138 V33 H52 V29 H38 V25 H28 V21 H38 V17 H52 Z"
          fill="#065f46"
          stroke="#fbbf24"
          strokeWidth="1.5"
        />
        {/* Center Azhari Star Mosaic */}
        <rect x="91" y="20" width="8" height="8" fill="#d97706" />
        <rect x="93" y="16" width="4" height="4" fill="#fef08a" />
        <rect x="93" y="28" width="4" height="4" fill="#fef08a" />
        <rect x="85" y="22" width="4" height="4" fill="#fef08a" />
        <rect x="101" y="22" width="4" height="4" fill="#fef08a" />
      </svg>
    </div>
  );
}

/* ── 1. PLAYER SPRITE: THALIB AL-AZHAR (BACK VIEW) ── */
export function PlayerSprite({ state = 'idle', className = '' }) {
  const isAttack = state === 'attack';
  const isHit = state === 'hit';
  const isVictory = state === 'victory';
  const isDefeat = state === 'defeat';

  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      {/* Ground Shadow */}
      <div
        className={`w-28 h-5 bg-black/60 rounded-full blur-[3px] mx-auto transition-all duration-300 ${
          isAttack ? 'scale-125 translate-x-3' : isHit ? 'scale-90 -translate-x-2' : 'animate-shadowPulse'
        }`}
      />

      {/* Main Character SVG */}
      <div
        className={`relative transition-all duration-300 ${
          isAttack
            ? 'translate-x-6 -translate-y-2 scale-105'
            : isHit
            ? '-translate-x-4 translate-y-1 rotate-[-6deg] brightness-150'
            : isDefeat
            ? 'translate-y-6 opacity-60 grayscale'
            : 'animate-playerIdle'
        }`}
      >
        <svg
          viewBox="0 0 160 180"
          className="w-32 h-36 sm:w-40 sm:h-44 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="tarboushRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="imamaWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="robeJubah" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="bookGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glowGold">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Aura behind Player when attacking */}
          {isAttack && (
            <circle cx="80" cy="90" r="65" fill="#f59e0b" opacity="0.25" filter="url(#glowGold)" />
          )}

          {/* 1. JUBAH / ROBE BODY (BACK VIEW) */}
          <g>
            {/* Lower Robe Hem */}
            <path
              d="M38 165 C42 130, 48 95, 52 82 L108 82 C112 95, 118 130, 122 165 C100 170, 60 170, 38 165 Z"
              fill="url(#robeJubah)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Robe Folds / Creases */}
            <path d="M60 100 Q65 135 62 165" stroke="#334155" strokeWidth="1.5" opacity="0.6" />
            <path d="M80 88 Q80 130 80 166" stroke="#334155" strokeWidth="2" opacity="0.7" />
            <path d="M100 100 Q95 135 98 165" stroke="#334155" strokeWidth="1.5" opacity="0.6" />
          </g>

          {/* 2. SHOULDERS & ARMS */}
          <g>
            {/* Shoulders */}
            <path
              d="M32 75 C36 62, 54 55, 80 55 C106 55, 124 62, 128 75 C130 85, 125 105, 122 118 L108 84 L52 84 L38 118 C35 105, 30 85, 32 75 Z"
              fill="#1e293b"
            />
            {/* Gold Collar Trim (Azhari Kakula Embroidery) */}
            <path
              d="M62 60 Q80 66 98 60 Q80 72 62 60 Z"
              fill="#d97706"
              stroke="#fbbf24"
              strokeWidth="0.8"
            />
            <line x1="80" y1="66" x2="80" y2="84" stroke="#fbbf24" strokeWidth="1.5" />
          </g>

          {/* 3. HEAD & AZHARI TARBOUSH (PECI MERAH + IMAMA PUTIH) */}
          <g>
            {/* Neck (back) */}
            <rect x="71" y="46" width="18" height="15" fill="#fbcfe8" rx="4" />

            {/* Imama Putih (White Turban Band) */}
            <ellipse cx="80" cy="46" rx="23" ry="11" fill="url(#imamaWhite)" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Turban Folds */}
            <path d="M60 46 Q80 50 100 46" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
            <path d="M63 43 Q80 47 97 43" stroke="#94a3b8" strokeWidth="1" fill="none" />

            {/* Tarboush Merah (Red Cylinder Hat) */}
            <path
              d="M64 42 C64 30, 66 18, 80 18 C94 18, 96 30, 96 42 Z"
              fill="url(#tarboushRed)"
              stroke="#581c87"
              strokeWidth="0.8"
            />
            {/* Tarboush Top Oval */}
            <ellipse cx="80" cy="20" rx="14" ry="4" fill="#dc2626" />

            {/* Kuncir Tarboush (Black Tassel dangling down the back) */}
            <circle cx="80" cy="20" r="2.5" fill="#0f172a" />
            <path
              d="M80 20 Q88 28 86 38"
              stroke="#0f172a"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              className={isAttack ? 'animate-tasselFlick' : ''}
            />
            {/* Tassel End Fringe */}
            <polygon points="84,38 88,38 89,45 83,45" fill="#0f172a" />
          </g>

          {/* 4. HANDS & MYSTICAL TOME (KITAB MUQARRAR) */}
          <g className={isAttack ? 'animate-bookLevitate' : ''}>
            {/* Right Arm & Hand raising the book */}
            <path d="M120 78 Q136 85 138 98 Q135 106 126 102" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
            <circle cx="132" cy="100" r="5" fill="#fbcfe8" />

            {/* Glowing Book (Spells of Muqarrar) */}
            <g transform="translate(112, 68) rotate(-15)">
              {/* Back Cover */}
              <rect x="0" y="0" width="34" height="42" rx="3" fill="#854d0e" stroke="#ca8a04" strokeWidth="1.5" />
              {/* Glowing Pages */}
              <rect x="3" y="3" width="28" height="36" rx="2" fill="#fef3c7" />
              {/* Spine & Bookmark Ribbon */}
              <line x1="17" y1="3" x2="17" y2="39" stroke="#92400e" strokeWidth="1.5" />
              <path d="M17 39 Q20 48 24 50 L20 46 L17 48" fill="#dc2626" />
              {/* Arcane Arabic Script Glyphs on pages */}
              <path d="M7 10 Q12 12 14 10" stroke="#78350f" strokeWidth="1.5" fill="none" />
              <path d="M7 16 Q12 18 14 16" stroke="#78350f" strokeWidth="1.5" fill="none" />
              <path d="M20 10 Q25 12 27 10" stroke="#78350f" strokeWidth="1.5" fill="none" />
              <path d="M20 16 Q25 18 27 16" stroke="#78350f" strokeWidth="1.5" fill="none" />

              {/* Floating Golden Runes rising from the book */}
              <circle cx="10" cy="-6" r="2" fill="#fbbf24" opacity="0.8" className="animate-ping" />
              <circle cx="24" cy="-10" r="1.5" fill="#34d399" opacity="0.9" className="animate-pulse" />
            </g>
          </g>

          {/* Sweat drop if hit */}
          {isHit && (
            <path
              d="M48 30 C45 25, 43 25, 43 28 C43 31, 47 34, 48 30 Z"
              fill="#38bdf8"
              className="animate-bounce"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

/* ── 2. BOSS SPRITE: THEMATIC GUARDIANS (STAGE 1-4) ── */
export function BossSprite({
  bossType = 'balaghah-majaz',
  stageId = 4,
  state = 'idle',
  className = ''
}) {
  const isAttack = state === 'attack';
  const isHit = state === 'hit';

  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      {/* Ground Shadow */}
      <div
        className={`w-24 sm:w-28 h-4 sm:h-5 bg-black/60 rounded-full blur-[3px] mx-auto transition-all duration-300 ${
          isAttack ? 'scale-125 -translate-x-3' : isHit ? 'scale-90 translate-x-2' : 'animate-shadowPulse'
        }`}
      />

      {/* Creature Container */}
      <div
        className={`relative transition-all duration-300 ${
          isAttack
            ? '-translate-x-6 translate-y-2 scale-110'
            : isHit
            ? 'translate-x-4 -translate-y-1 rotate-[6deg] brightness-150 animate-bossHurt'
            : 'animate-bossFloat'
        }`}
      >
        {stageId === 1 ? (
          <KhadimSprite isAttack={isAttack} isHit={isHit} bossType={bossType} />
        ) : stageId === 2 ? (
          <MusaidSprite isAttack={isAttack} isHit={isHit} bossType={bossType} />
        ) : stageId === 3 ? (
          <MuhaqqiqSprite isAttack={isAttack} isHit={isHit} bossType={bossType} />
        ) : bossType === 'nahwu-fail' ? (
          <NahwuGolem isAttack={isAttack} isHit={isHit} />
        ) : bossType === 'ushul-amr' ? (
          <UshulSphinx isAttack={isAttack} isHit={isHit} />
        ) : (
          <BalaghahWingedTome isAttack={isAttack} isHit={isHit} />
        )}
      </div>
    </div>
  );
}

/* ── GUARDIAN STAGE 1: KHADIM AL-BAB (PENJAGA GERBANG AL-AZHAR) ── */
export function KhadimSprite({ isAttack = false, isHit = false, bossType = 'balaghah-majaz' }) {
  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';
  const robeColor = isNahwu ? '#1e293b' : isUshul ? '#2e1c0c' : '#063f2e';
  const robeTrim = isNahwu ? '#38bdf8' : isUshul ? '#f59e0b' : '#34d399';
  const auraColor = isNahwu ? '#38bdf8' : isUshul ? '#fbbf24' : '#10b981';

  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="khadimLanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura Burst */}
      <circle cx="90" cy="90" r="52" fill={auraColor} opacity={isAttack ? 0.35 : 0.12} />

      {/* Gate Sentry Stone Emblem Behind */}
      <rect x="22" y="24" width="22" height="65" rx="3" fill="#141c17" stroke={robeTrim} strokeWidth="1.2" />
      <polygon points="22,89 33,98 44,89" fill="#141c17" stroke={robeTrim} strokeWidth="1.2" />
      <text x="28" y="52" fill={robeTrim} fontSize="11" fontWeight="bold">بَاب</text>
      <text x="29" y="70" fill={robeTrim} fontSize="11" fontWeight="bold">١</text>

      {/* Guardian Robe Body */}
      <path
        d="M62 75 L52 145 H128 L118 75 Z"
        fill={robeColor}
        stroke="#0d1410"
        strokeWidth="2"
      />
      {/* Front Placket / Kaftan Hem */}
      <line x1="90" y1="75" x2="90" y2="145" stroke={robeTrim} strokeWidth="3" />
      <line x1="68" y1="140" x2="112" y2="140" stroke={robeTrim} strokeWidth="2" />

      {/* Left Hand holding Ancient Heavy Iron Key */}
      <g transform="translate(48, 105) rotate(-20)">
        <circle cx="0" cy="0" r="7" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
        <circle cx="0" cy="0" r="3" fill="#94a3b8" />
        <line x1="0" y1="7" x2="0" y2="28" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="20" x2="5" y2="20" stroke="#cbd5e1" strokeWidth="2.5" />
        <line x1="0" y1="26" x2="6" y2="26" stroke="#cbd5e1" strokeWidth="2.5" />
      </g>

      {/* Right Arm & Brass Lantern Staff */}
      <g transform="translate(132, 45)">
        <line x1="0" y1="0" x2="0" y2="105" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        <rect x="-4" y="10" width="8" height="6" rx="2" fill="#ca8a04" />
        <path d="M0 16 C-12 16, -18 24, -18 34" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
        <g transform="translate(-18, 34)">
          <circle cx="0" cy="14" r="26" fill="url(#khadimLanternGlow)" />
          <polygon points="-8,4 0,-4 8,4" fill="#a16207" stroke="#facc15" strokeWidth="1" />
          <rect x="-7" y="4" width="14" height="16" rx="2" fill="#fef08a" opacity="0.9" stroke="#ca8a04" strokeWidth="1.5" />
          <ellipse cx="0" cy="12" rx="3" ry="5" fill="#f97316" className="animate-pulse" />
          <polygon points="-8,20 0,26 8,20" fill="#a16207" stroke="#facc15" strokeWidth="1" />
        </g>
      </g>

      {/* Head, Azhari Turban (Imama) & Tarboosh */}
      <g transform="translate(90, 52)">
        <circle cx="0" cy="0" r="14" fill="#d4a373" />
        <circle cx="-5" cy="-2" r="2" fill="#1c1917" />
        <circle cx="5" cy="-2" r="2" fill="#1c1917" />
        <path d="M-10 2 Q0 16 10 2 Z" fill="#292524" />
        <ellipse cx="0" cy="-8" rx="17" ry="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        <path d="M-16 -7 Q0 0 16 -7" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
        <rect x="-8" y="-22" width="16" height="12" rx="2" fill="#b91c1c" />
        <line x1="0" y1="-22" x2="8" y2="-16" stroke="#1c1917" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/* ── GUARDIAN STAGE 2: MUSA'ID AL-MUDARRIS (ASISTEN PENGUJI MATAN) ── */
export function MusaidSprite({ isAttack = false, isHit = false, bossType = 'balaghah-majaz' }) {
  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';
  const themeColor = isNahwu ? '#0284c7' : isUshul ? '#d97706' : '#059669';
  const auraGlow = isNahwu ? '#38bdf8' : isUshul ? '#fbbf24' : '#34d399';

  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="musaidAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={auraGlow} stopOpacity="0.45" />
          <stop offset="70%" stopColor={auraGlow} stopOpacity="0.1" />
          <stop offset="100%" stopColor={auraGlow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="90" cy="85" r="56" fill="url(#musaidAura)" className={isAttack ? 'animate-ping' : ''} />

      {/* Floating Matan Scroll Left */}
      <g transform="translate(24, 60) rotate(-12)" className="animate-bookLevitate">
        <path d="M0 0 Q16 6 32 0 L32 44 Q16 50 0 44 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
        <line x1="5" y1="12" x2="27" y2="12" stroke="#92400e" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="5" y1="20" x2="27" y2="20" stroke="#92400e" strokeWidth="1.2" strokeDasharray="4 2" />
        <line x1="5" y1="28" x2="27" y2="28" stroke="#92400e" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="5" y1="36" x2="20" y2="36" stroke="#92400e" strokeWidth="1.2" />
      </g>

      {/* Floating Matan Scroll Right */}
      <g transform="translate(126, 75) rotate(14)" className="animate-bookLevitate">
        <path d="M0 0 Q15 6 30 0 L30 40 Q15 46 0 40 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
        <line x1="4" y1="10" x2="26" y2="10" stroke="#92400e" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="4" y1="18" x2="26" y2="18" stroke="#92400e" strokeWidth="1.2" strokeDasharray="4 2" />
        <line x1="4" y1="26" x2="26" y2="26" stroke="#92400e" strokeWidth="1.2" />
      </g>

      {/* Scholar Robe Body (Sapphire / Royal) */}
      <path
        d="M64 78 L54 148 H126 L116 78 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="2"
      />
      <path d="M64 78 L90 115 L116 78 L90 88 Z" fill={themeColor} opacity="0.85" />
      <line x1="90" y1="115" x2="90" y2="148" stroke="#facc15" strokeWidth="2.5" />

      {/* Right Hand holding Golden Feather Quill */}
      <g transform="translate(130, 48) rotate(35)">
        <line x1="0" y1="0" x2="0" y2="38" stroke="#eab308" strokeWidth="2" />
        <path d="M0 6 C-12 12, -14 24, 0 32 C14 24, 12 12, 0 6 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        <circle cx="0" cy="38" r="2.5" fill={auraGlow} className="animate-ping" />
      </g>

      {/* Head, Azhari Turban & Spectacles */}
      <g transform="translate(90, 50)">
        <circle cx="0" cy="0" r="14" fill="#deb887" />
        <circle cx="-5" cy="-2" r="4" stroke="#f59e0b" strokeWidth="1.4" fill="rgba(255,255,255,0.2)" />
        <circle cx="5" cy="-2" r="4" stroke="#f59e0b" strokeWidth="1.4" fill="rgba(255,255,255,0.2)" />
        <line x1="-1" y1="-2" x2="1" y2="-2" stroke="#f59e0b" strokeWidth="1.2" />
        <path d="M-8 4 Q0 12 8 4" stroke="#78350f" strokeWidth="1.2" fill="none" />
        <ellipse cx="0" cy="-8" rx="17" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="-8" y="-22" width="16" height="12" rx="2" fill="#991b1b" />
        <line x1="0" y1="-22" x2="-7" y2="-15" stroke="#0f172a" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/* ── GUARDIAN STAGE 3: AL-MUHAQQIQ AL-MUTAQADDIM (PAKAR SANAD & DALIL) ── */
export function MuhaqqiqSprite({ isAttack = false, isHit = false, bossType = 'balaghah-majaz' }) {
  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';
  const sealColor = isNahwu ? '#38bdf8' : isUshul ? '#f59e0b' : '#10b981';

  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orbiting Khatim Seal (Rotating Islamic 8-Point Star) */}
      <g className="animate-spin-slow" transform="translate(90, 80)">
        <circle cx="0" cy="0" r="48" stroke={sealColor} strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.6" />
        <rect x="-30" y="-30" width="60" height="60" stroke={sealColor} strokeWidth="1.2" fill="none" opacity="0.5" />
        <rect x="-30" y="-30" width="60" height="60" stroke={sealColor} strokeWidth="1.2" fill="none" opacity="0.5" transform="rotate(45)" />
      </g>

      {/* Grand Scholar Robe */}
      <path
        d="M62 76 L50 148 H130 L118 76 Z"
        fill="#3b0764"
        stroke="#1e1b4b"
        strokeWidth="2"
      />
      <path d="M62 76 L90 120 L118 76 Z" fill="#581c87" />
      <line x1="90" y1="76" x2="90" y2="148" stroke="#fbbf24" strokeWidth="3" />

      {/* Open Leather Tome of Rijal in Both Hands */}
      <g transform="translate(62, 100)">
        <polygon points="0,6 28,12 28,38 0,32" fill="#78350f" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="56,6 28,12 28,38 56,32" fill="#78350f" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="2,8 27,13 27,36 2,31" fill="#fef3c7" />
        <polygon points="54,8 29,13 29,36 54,31" fill="#fef3c7" />
        <circle cx="28" cy="4" r="3" fill="#fbbf24" className="animate-ping" />
        <text x="7" y="24" fill="#92400e" fontSize="7" fontWeight="bold">سند</text>
        <text x="36" y="24" fill="#92400e" fontSize="7" fontWeight="bold">تحقيق</text>
      </g>

      {/* Venerable Elder Head with Grand Azhari Imama */}
      <g transform="translate(90, 48)">
        <circle cx="0" cy="0" r="15" fill="#e2c499" />
        <circle cx="-5" cy="-2" r="1.8" fill="#1e1b4b" />
        <circle cx="5" cy="-2" r="1.8" fill="#1e1b4b" />
        <path d="M-12 2 Q0 24 12 2 Q6 28 0 30 Q-6 28 -12 2 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx="0" cy="-8" rx="19" ry="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
        <path d="M-18 -7 Q0 2 18 -7" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />
        <rect x="-9" y="-23" width="18" height="13" rx="2" fill="#7f1d1d" />
        <circle cx="0" cy="-23" r="2.5" fill="#fbbf24" />
      </g>
    </svg>
  );
}

/* ── BOSS 1: BALAGHAH — KITAB AL-BAYAN (WINGED TOME) ── */
function BalaghahWingedTome({ isAttack, isHit }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_10px_25px_rgba(16,185,129,0.3)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="emeraldTome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="wingGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <radialGradient id="arcaneEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
      </defs>

      {/* Aura Burst */}
      <circle cx="90" cy="90" r="60" fill="#10b981" opacity={isAttack ? 0.35 : 0.15} />

      {/* LEFT WING (FEATHERED GOLDEN WING) */}
      <g className={isAttack ? 'animate-wingFlap' : 'animate-wingHoverLeft'}>
        <path
          d="M60 85 C35 70, 10 55, 5 35 C15 50, 30 65, 45 75 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
        <path
          d="M62 92 C38 85, 15 75, 12 55 C22 68, 38 78, 50 85 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
        <path
          d="M65 100 C45 98, 28 92, 25 78 C35 88, 48 94, 58 97 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
      </g>

      {/* RIGHT WING (FEATHERED GOLDEN WING) */}
      <g className={isAttack ? 'animate-wingFlap' : 'animate-wingHoverRight'}>
        <path
          d="M120 85 C145 70, 170 55, 175 35 C165 50, 150 65, 135 75 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
        <path
          d="M118 92 C142 85, 165 75, 168 55 C158 68, 142 78, 130 85 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
        <path
          d="M115 100 C135 98, 152 92, 155 78 C145 88, 132 94, 122 97 Z"
          fill="url(#wingGold)"
          stroke="#a16207"
          strokeWidth="1"
        />
      </g>

      {/* MAIN GRIMOIRE BODY */}
      <g>
        {/* Shadow/Back Cover */}
        <rect x="52" y="48" width="76" height="94" rx="8" fill="#022c22" stroke="#059669" strokeWidth="2" />
        {/* Front Cover Plate */}
        <rect x="55" y="52" width="70" height="86" rx="6" fill="url(#emeraldTome)" stroke="#34d399" strokeWidth="1.5" />
        {/* Gold Filigree Borders */}
        <rect x="60" y="57" width="60" height="76" rx="4" stroke="#facc15" strokeWidth="1.2" strokeDasharray="6 2" fill="none" />

        {/* Central Eye of Rhetoric (Majaz Eye) */}
        <circle cx="90" cy="85" r="18" fill="url(#arcaneEye)" stroke="#facc15" strokeWidth="2" />
        {/* Slit Eye Pupil */}
        <ellipse cx="90" cy="85" rx="3.5" ry="12" fill="#022c22" />
        <circle cx="88" cy="82" r="2.5" fill="#ffffff" />

        {/* Floating Arabic Letter Runes on the Book Cover */}
        <text x="70" y="118" fill="#fef08a" fontSize="13" fontWeight="bold" fontFamily="serif">ب</text>
        <text x="88" y="122" fill="#fef08a" fontSize="13" fontWeight="bold" fontFamily="serif">ي</text>
        <text x="104" y="118" fill="#fef08a" fontSize="13" fontWeight="bold" fontFamily="serif">ن</text>

        {/* Crown of Arcane Flames atop the Book */}
        <polygon points="76,48 82,34 88,44 94,30 100,44 106,34 112,48" fill="#fbbf24" opacity="0.9" />
      </g>

      {/* Orbiting Runestones */}
      <circle cx="48" cy="42" r="4" fill="#34d399" className="animate-ping" opacity="0.7" />
      <circle cx="132" cy="138" r="3.5" fill="#f59e0b" className="animate-pulse" />
    </svg>
  );
}

/* ── BOSS 2: NAHWU — RA'DU AL-ALFIYAH (THUNDER GOLEM) ── */
function NahwuGolem({ isAttack, isHit }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_10px_25px_rgba(234,179,8,0.35)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="stoneBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="lightningGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      {/* Electric Sparks Background */}
      <circle cx="90" cy="85" r="55" fill="#f59e0b" opacity={isAttack ? 0.3 : 0.12} />

      {/* Floating Stone Shoulders */}
      <rect x="25" y="65" width="28" height="28" rx="6" fill="url(#stoneBody)" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="127" y="65" width="28" height="28" rx="6" fill="url(#stoneBody)" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Electric Arcs between hands */}
      <path d="M40 75 Q65 60 90 70 Q115 60 140 75" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 2" fill="none" className="animate-pulse" />

      {/* Main Stone Head / Torso */}
      <path
        d="M58 55 C58 40, 70 30, 90 30 C110 30, 122 40, 122 55 L126 110 C126 125, 110 135, 90 135 C70 135, 54 125, 54 110 Z"
        fill="url(#stoneBody)"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* Golden Giant Dhommah Crown (Rafa' of Fa'il) */}
      <g transform="translate(76, 8) scale(1.4)">
        <path
          d="M8 8 C11 5, 15 5, 17 8 C19 11, 18 15, 14 17 L10 21"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          className="animate-bounce"
        />
        <circle cx="12" cy="11" r="3" fill="#fef08a" />
      </g>

      {/* Glowing Cyan Eyes of I'rab */}
      <rect x="68" y="60" width="14" height="6" rx="3" fill="#38bdf8" className="animate-pulse" />
      <rect x="98" y="60" width="14" height="6" rx="3" fill="#38bdf8" className="animate-pulse" />

      {/* Ancient Inscribed Runes on Chest (مَرْفُوعٌ بِالضَّمَّة) */}
      <rect x="70" y="82" width="40" height="28" rx="4" fill="#0f172a" stroke="#eab308" strokeWidth="1.2" />
      <text x="75" y="96" fill="#facc15" fontSize="9" fontWeight="bold" fontFamily="monospace">إِعْرَاب</text>
      <text x="74" y="106" fill="#38bdf8" fontSize="8" fontFamily="monospace">الْفَاعِل</text>

      {/* Electric Quill Staff in Hand */}
      <g transform="translate(138, 45) rotate(25)">
        <rect x="0" y="0" width="4" height="65" fill="#ca8a04" />
        <path d="M-4 0 L2 -14 L8 0 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
        <circle cx="2" cy="65" r="4" fill="#f59e0b" />
      </g>
    </svg>
  );
}

/* ── BOSS 3: USHUL FIQH — MIZAN AL-QADHI (CELESTIAL SPHINX BALANCE) ── */
function UshulSphinx({ isAttack, isHit }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldSphinx" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Solar Halo */}
      <circle cx="90" cy="70" r="48" fill="#fbbf24" opacity="0.2" />
      <circle cx="90" cy="70" r="42" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" fill="none" className="animate-spin-slow" />

      {/* Celestial Balance Beam (Mizan) */}
      <g className={isAttack ? 'animate-balanceTilt' : ''}>
        {/* Main Central Pivot Pillar */}
        <rect x="87" y="38" width="6" height="75" rx="3" fill="#b45309" stroke="#fde047" strokeWidth="1" />
        <circle cx="90" cy="38" r="6" fill="#fbbf24" />

        {/* Horizontal Balance Crossbeam */}
        <line x1="30" y1="48" x2="150" y2="48" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />

        {/* Left Pan (Al-Amr / Wajib) */}
        <line x1="38" y1="48" x2="28" y2="82" stroke="#eab308" strokeWidth="1.2" />
        <line x1="48" y1="48" x2="58" y2="82" stroke="#eab308" strokeWidth="1.2" />
        <path d="M26 82 Q43 96 60 82 Z" fill="#ca8a04" stroke="#fde047" strokeWidth="1.2" />
        <text x="35" y="81" fill="#fef08a" fontSize="8" fontWeight="bold">أَمْر</text>

        {/* Right Pan (An-Nahy / Tahrim) */}
        <line x1="132" y1="48" x2="122" y2="82" stroke="#eab308" strokeWidth="1.2" />
        <line x1="142" y1="48" x2="152" y2="82" stroke="#eab308" strokeWidth="1.2" />
        <path d="M120 82 Q137 96 154 82 Z" fill="#ca8a04" stroke="#fde047" strokeWidth="1.2" />
        <text x="129" y="81" fill="#fef08a" fontSize="8" fontWeight="bold">نَهْي</text>
      </g>

      {/* Sphinx Pedestal of Books (Diktat Syariah) */}
      <rect x="52" y="115" width="76" height="14" rx="3" fill="#78350f" stroke="#ca8a04" strokeWidth="1.5" />
      <rect x="44" y="129" width="92" height="16" rx="4" fill="#451a03" stroke="#ca8a04" strokeWidth="1.5" />
      <text x="64" y="141" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace">أُصُولُ الْفِقْه</text>
    </svg>
  );
}

/* ── 3. BATTLE PROJECTILES & CINEMATIC COMBAT VFX ── */
export function BattleProjectile({ type = null, effect = null, bossType = 'balaghah-majaz' }) {
  if (!type && !effect) return null;

  // If effect is provided, separate flight phase from impact phase; otherwise show impact alongside projectile
  const showPlayerComet = type === 'crit';
  const showBossImpact = effect === 'crit' || (!effect && type === 'crit');

  const showBossSurge = type === 'hurt';
  const showPlayerImpact = effect === 'hurt' || (!effect && type === 'hurt');

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* ── 1. PLAYER'S "HUJJAH QATH'IYYAH" (CRITICAL STRIKE) ── */}
      {/* 1A. Flying Sacred Energy Comet (Bottom-Left to Top-Right) */}
      {showPlayerComet && (
        <div className="absolute bottom-[28%] left-[24%] animate-playerProjectile flex items-center gap-3">
          {/* Blazing Comet Head with Sacred Runes */}
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 blur-sm shadow-[0_0_35px_#10b981] flex items-center justify-center font-extrabold text-black text-sm tracking-wider font-serif border-2 border-white animate-spin-slow">
              حُجَّة
            </div>
            {/* Expanding Aura Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75" />
          </div>

          {/* Glowing Particle Wake Trail */}
          <div className="w-40 h-4 bg-gradient-to-r from-amber-300/90 via-emerald-400/60 to-transparent blur-[2px] rounded-full" />
          <div className="w-24 h-1.5 bg-white blur-[0.5px] rounded-full -ml-36" />
        </div>
      )}

      {/* 1B. Impact Cross-Slash & Blast over Boss (Top-Right) */}
      {showBossImpact && (
        <div className="absolute top-[12%] right-[8%] sm:right-[14%] w-44 h-44 flex items-center justify-center pointer-events-none">
          {/* Golden Energy Slash 1 (Diagonal 45deg) */}
          <div className="absolute w-52 h-3.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_25px_#fbbf24] animate-slashX1" />
          {/* Cyan Energy Slash 2 (Diagonal -45deg) */}
          <div className="absolute w-52 h-3.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_25px_#34d399] animate-slashX2" />
          
          {/* Expanding Shockwave Ring */}
          <div className="absolute w-36 h-36 rounded-full border-4 border-amber-300/90 animate-impactRing" />
          
          {/* Bursting Impact Stars */}
          <div className="absolute animate-sparkBurst text-amber-300 font-bold text-3xl drop-shadow-[0_0_15px_#fbbf24]">
            ✨ ✦
          </div>
          <div className="absolute animate-sparkBurst text-emerald-300 font-bold text-xl drop-shadow-[0_0_12px_#34d399] delay-75 -translate-x-4 -translate-y-4">
            ⚔️
          </div>
        </div>
      )}

      {/* ── 2. BOSS COUNTERATTACK: "SYUBHAT MUSYKILAH" ── */}
      {/* 2A. Boss Charging Surge */}
      {showBossSurge && (
        <div className="absolute top-[26%] right-[22%] animate-bossProjectile flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-l from-purple-700 via-rose-600 to-black blur-[2px] shadow-[0_0_30px_#a855f7] flex items-center justify-center font-bold text-white text-xs font-serif animate-spin">
            شُبْهَة
          </div>
          <div className="w-36 h-3.5 bg-gradient-to-l from-purple-600/90 via-rose-500/50 to-transparent blur-[1px] rounded-full" />
        </div>
      )}

      {/* 2B. Direct Strike / Blast on Player (Bottom-Left) */}
      {showPlayerImpact && (
        <>
          {bossType === 'nahwu-fail' ? (
            /* NAHWU GOLEM: THUNDERBOLT STRIKE DOWN ON PLAYER */
            <div className="absolute inset-0">
              <div className="absolute bottom-[8%] left-[16%] sm:left-[22%] w-36 h-72 flex flex-col items-center justify-end pointer-events-none animate-lightningStrike">
                <svg viewBox="0 0 80 200" className="w-full h-full drop-shadow-[0_0_30px_#38bdf8]" fill="none">
                  <polyline
                    points="40,0 25,70 55,75 20,150 45,155 10,200"
                    stroke="#38bdf8"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                  <polyline
                    points="40,0 25,70 55,75 20,150 45,155 10,200"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="w-28 h-7 rounded-full border-2 border-cyan-400 bg-cyan-400/35 blur-[2px] animate-ping" />
              </div>
            </div>
          ) : bossType === 'ushul-amr' ? (
            /* USHUL SPHINX: CELESTIAL JUDGMENT PILLAR CRASH */
            <div className="absolute inset-0">
              <div className="absolute bottom-[8%] left-[14%] sm:left-[20%] w-40 h-80 flex flex-col items-center justify-end pointer-events-none animate-pillarCrash">
                <div className="w-24 h-full bg-gradient-to-b from-amber-300/90 via-amber-500/70 to-rose-600/80 blur-[3px] shadow-[0_0_40px_#f59e0b]" />
                <div className="absolute top-4 text-xs font-mono font-bold text-amber-200 uppercase tracking-widest bg-black/70 px-2.5 py-0.5 rounded border border-amber-400 shadow-lg">
                  مِيزَانُ الشَّرْع
                </div>
                <div className="w-36 h-8 rounded-full border-4 border-amber-400 bg-amber-400/35 animate-impactRing" />
              </div>
            </div>
          ) : (
            /* BALAGHAH TOME: INK VORTEX & RAZOR PARCHMENT BLADES */
            <div className="absolute inset-0">
              <div className="absolute bottom-[18%] left-[14%] sm:left-[20%] w-40 h-40 flex items-center justify-center pointer-events-none">
                <div className="absolute w-44 h-3.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_25px_#f43f5e] animate-slashX1" />
                <div className="absolute w-44 h-3.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_25px_#a855f7] animate-slashX2" />
                <div className="absolute w-32 h-32 rounded-full border-4 border-rose-500/85 animate-impactRing" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── 4. FLOATING COMBAT DAMAGE / HEAL TEXT ── */
export function FloatingDamage({ text = null, type = 'damage' }) {
  if (!text) return null;
  const isHeal = type === 'heal';

  return (
    <div
      className={`absolute z-40 font-mono font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-md shadow-2xl animate-floatDamage ${
        isHeal
          ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-400/50'
          : 'text-rose-400 bg-rose-950/80 border border-rose-500/50'
      }`}
    >
      {text}
    </div>
  );
}

/* ── 5. MINECRAFT 3D VOXEL BATTLEFIELD BACKDROP ── */
export function MinecraftBattlefield({ bossType = 'balaghah-majaz' }) {
  const bgMap = {
    'ushul-amr': '/assets/mc-bg-ushul.jpg',
    'nahwu-fail': '/assets/mc-bg-nahwu.jpg',
    'balaghah-majaz': '/assets/mc-bg-balaghah.jpg'
  };

  const currentBg = bgMap[bossType] || '/assets/mc-bg-ushul.jpg';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Background 3D Minecraft Scene Image */}
      <img
        src={currentBg}
        alt="Minecraft Al-Azhar Battlefield"
        className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
      />

      {/* Atmospheric Vignette & Night Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

      {/* Warm Torchlight Pulse Effect at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-500/15 via-amber-500/5 to-transparent animate-pulse pointer-events-none" />

      {/* Subtle Voxel Star Glimmer */}
      <div className="absolute top-6 left-12 text-amber-200 text-xs animate-ping opacity-60">✦</div>
      <div className="absolute top-10 right-28 text-white text-[10px] animate-pulse opacity-75">✧</div>
      <div className="absolute top-16 left-1/3 text-emerald-200 text-[10px] animate-pulse opacity-50">✦</div>
    </div>
  );
}

/* ── 6. MINECRAFT 3D VOXEL THALIB AZHAR SPRITE ── */
export function MinecraftPlayerSprite({ state = 'idle' }) {
  const isAttack = state === 'attack';
  const isHit = state === 'hit';

  return (
    <div
      className={`relative select-none flex flex-col items-center transition-all duration-300 ${
        isAttack
          ? 'translate-x-6 -translate-y-3 scale-105'
          : isHit
          ? '-translate-x-4 translate-y-1 rotate-[-6deg] animate-playerHurt'
          : 'animate-playerIdle'
      }`}
    >
      {/* Dynamic 3D Ground Contact Shadow (Perspective oval matching courtyard tiles) */}
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-8 bg-black/85 rounded-[100%] blur-[5px] transform scale-y-40 pointer-events-none" />
      {/* Warm Ambient Lantern Light Reflection on Floor */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-5 bg-amber-500/25 rounded-full blur-[4px] pointer-events-none animate-pulse" />

      {/* 3D Rendered Minecraft Voxel Thalib Model: Menghadap depan ekspresi kena serang saat hit, menghadap arena saat idle/attack */}
      <div className="relative z-10">
        <img
          src={isHit ? '/assets/thalib-hurt-voxel.png' : '/assets/thalib-voxel-facing-right.png'}
          alt="Thalib Azhar Voxel 3D"
          className={`w-28 sm:w-36 md:w-44 max-h-40 sm:max-h-52 md:max-h-60 h-auto object-contain transition-all duration-200 ${
            isHit
              ? 'filter brightness-[1.3] contrast-[1.1] drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]'
              : isAttack
              ? 'filter brightness-110 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]'
              : 'filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.85)] brightness-100 contrast-105'
          }`}
        />

        {/* Casting Aura Ring on Attack */}
        {isAttack && (
          <div className="absolute top-1/4 right-0 w-20 h-20 rounded-full border-2 border-amber-300 bg-amber-400/25 blur-[2px] animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  );
}

/* ── HELPER: GET 3D MINECRAFT VOXEL SPRITE FOR STAGE / BOSS ── */
export function getVoxelSprite(stageId = 4, bossType = 'balaghah-majaz') {
  const sid = Number(stageId);
  if (sid === 1) return '/assets/npc-khadim-voxel.png';
  if (sid === 2) return '/assets/npc-musaid-voxel.png';
  if (sid === 3) return '/assets/npc-muhaqqiq-voxel.png';
  // Stage 4 (Final Boss): Al-'Allamah Al-Kabir / Syaikhul Azhar (Grand Master Scholar)
  return '/assets/boss-syaikh-kabir-voxel.png';
}

/* ── HELPER: GET 3D MINECRAFT VOXEL HURT SPRITE (DAMAGED / FLUSTERED FACE) ── */
export function getVoxelHurtSprite(stageId = 4, bossType = 'balaghah-majaz') {
  const sid = Number(stageId);
  if (sid === 1) return '/assets/npc-khadim-hurt-voxel.png';
  if (sid === 2) return '/assets/npc-musaid-hurt-voxel.png';
  if (sid === 3) return '/assets/npc-muhaqqiq-hurt-voxel.png';
  // Stage 4 (Final Boss): Al-'Allamah Al-Kabir Hurt / Astonished reaction
  return '/assets/boss-syaikh-kabir-hurt-voxel.png';
}

/* ── 7. MINECRAFT HUD PLATE (AUTHENTIC GOLD-TRIMMED OBSIDIAN CARD) ── */
export function MinecraftHudPlate({
  type = 'player', // 'player' | 'boss'
  name,
  level,
  hp,
  maxHp,
  exp = 0,
  maxExp = 100,
  floatingText = null,
  bossAvatar = '⚖️',
  avatarSrc = null
}) {
  const isPlayer = type === 'player';
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (exp / maxExp) * 100));
  const resolvedAvatarSrc = avatarSrc || (isPlayer ? '/assets/thalib-voxel-facing-right.png' : null);

  return (
    <div className="relative select-none font-mono filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
      {/* Floating Damage inside HUD if targeted */}
      {floatingText && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40">
          <FloatingDamage text={floatingText.text} type={floatingText.type} />
        </div>
      )}

      {/* Main HUD Frame with Minecraft Gold Filigree Bevels */}
      <div className="flex items-center gap-0">
        
        {/* Left Ornate Diamond/Star Medallion */}
        <div className="relative shrink-0 w-11 h-14 sm:w-13 sm:h-16 bg-[#0c100e] border-2 border-[#1c2920] rounded-l-lg flex items-center justify-center shadow-inner overflow-hidden">
          <div className="absolute inset-1.5 border border-amber-500/60 rotate-45 bg-[#141a16]" />
          {resolvedAvatarSrc ? (
            <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden">
              <img
                src={resolvedAvatarSrc}
                alt={name || 'Avatar'}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              />
            </div>
          ) : (
            <div className="relative z-10 text-amber-400 font-extrabold text-sm sm:text-base animate-pulse">
              {bossAvatar}
            </div>
          )}
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-amber-400" />
          <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-amber-400" />
        </div>

        {/* Content Box */}
        <div className="min-w-[190px] sm:min-w-[260px] bg-[#0c100e]/95 backdrop-blur-md border-y-2 border-r-2 border-[#1c2920] rounded-r-lg p-2 sm:p-2.5 relative">
          
          {/* Outer Gold Corner Brackets (Minecraft Style) */}
          <div className="absolute -top-[2px] right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute -bottom-[2px] right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />

          {/* Top Line: Name + Level */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-[180px] drop-shadow-[1px_1px_0_#000]">
              {name}
            </span>
            <span className="shrink-0 text-[10px] sm:text-[11px] font-mono font-black text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-400/50 shadow-sm">
              {String(level).startsWith('Rank') ? level : `Rank ${level}`}
            </span>
          </div>

          {/* HP Row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-black text-amber-400 font-mono tracking-wider drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              HP
            </span>
            <div className="flex-1 h-3 sm:h-3.5 bg-[#050806] border border-[#2a382d] p-[1.5px] rounded-[2px] shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-[1px] ${
                  hpPercent > 50
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-300 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                    : hpPercent > 20
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                    : 'bg-gradient-to-r from-rose-700 to-rose-400 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-white/90 shrink-0">
              {hp}/{maxHp}
            </span>
          </div>

          {/* EXP Row (Player only) */}
          {isPlayer && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[9px] sm:text-[10px] font-black text-sky-400 font-mono tracking-wider">
                EXP
              </span>
              <div className="flex-1 h-1.5 sm:h-2 bg-[#050806] border border-[#1b262f] p-[1px] rounded-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-300 rounded-[1px]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono text-white/40 shrink-0 w-8 text-right">
                {Math.round(expPercent)}%
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

/* ── 8. MINECRAFT 3D VOXEL GUARDIAN SPRITE (STAGE 1 - 4) ── */
export function MinecraftBossSprite({
  stageId = 4,
  bossType = 'balaghah-majaz',
  state = 'idle',
  className = '',
  guardianAvatar = '⚔️',
  guardianName = ''
}) {
  const isAttack = state === 'attack';
  const isHit = state === 'hit';

  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';

  const themeAura = isNahwu ? '#38bdf8' : isUshul ? '#fbbf24' : '#10b981';

  // Map stage & bossType to rendered 3D Minecraft Voxel PNG Sprites (Hurt version on hit)
  const spriteSrc = isHit ? getVoxelHurtSprite(stageId, bossType) : getVoxelSprite(stageId, bossType);
  const isFinalBoss = Number(stageId) === 4;

  return (
    <div
      className={`relative select-none flex flex-col items-center transition-all duration-300 ${className} ${
        isAttack
          ? '-translate-x-6 translate-y-1 scale-105'
          : isHit
          ? 'translate-x-5 -translate-y-1 rotate-[4deg] animate-bossHurt'
          : 'animate-bossFloat'
      }`}
    >
      {/* 3D Contact Shadow */}
      <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-black/85 rounded-[100%] blur-[4px] transform scale-y-40 pointer-events-none ${
        isFinalBoss ? 'w-28 sm:w-36 h-6' : 'w-20 sm:w-26 h-5'
      }`} />
      {/* Warm Ambient Floor Reflection */}
      <div
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-[3px] pointer-events-none animate-pulse ${
          isFinalBoss ? 'w-24 sm:w-32 h-4' : 'w-16 sm:w-22 h-3.5'
        }`}
        style={{ backgroundColor: `${themeAura}33` }}
      />

      {/* Dynamic Rendered 3D Voxel Guardian Model */}
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={spriteSrc}
          alt={guardianName || 'Guardian Voxel 3D'}
          className={`h-auto object-contain transition-all duration-200 ${
            isFinalBoss
              ? 'w-28 sm:w-36 md:w-44 max-h-48 sm:max-h-56 md:max-h-60'
              : 'w-20 sm:w-26 md:w-30 max-h-36 sm:max-h-44 md:max-h-48'
          } ${
            isHit
              ? 'filter brightness-[1.3] contrast-[1.1] drop-shadow-[0_0_25px_rgba(244,63,94,0.95)]'
              : isAttack
              ? 'filter brightness-110 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]'
              : 'filter drop-shadow-[0_10px_18px_rgba(0,0,0,0.85)] brightness-100 contrast-105'
          }`}
        />

        {/* Attack Charging Aura on Attack */}
        {isAttack && (
          <div
            className="absolute top-1/4 left-0 w-16 h-16 rounded-full border-2 animate-ping pointer-events-none"
            style={{ borderColor: themeAura, backgroundColor: `${themeAura}40` }}
          />
        )}
      </div>
    </div>
  );
}
