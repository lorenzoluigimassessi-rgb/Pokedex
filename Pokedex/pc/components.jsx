/* ===== PokéCatch shared components ===== */
const { useState, useEffect, useRef } = React;

/* Poké Ball — SVG, supports ball types + open/wobble states */
function BallIcon({ type='poke', size=64, wobble=false, open=false, style }) {
  const b = PC.BALLS[type] || PC.BALLS.poke;
  const r = size/2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ display:'block', filter:'drop-shadow(0 6px 10px rgba(0,0,0,.35))',
               animation: wobble ? 'wobble .45s ease' : 'none',
               transformOrigin:'50% 85%', ...style }}>
      <defs>
        <clipPath id={`top-${type}`}><rect x="0" y="0" width="100" height="50"/></clipPath>
        <clipPath id={`bot-${type}`}><rect x="0" y="50" width="100" height="50"/></clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill={b.bottom} stroke={b.ring} strokeWidth="3"/>
      <g clipPath={`url(#top-${type})`}>
        <circle cx="50" cy="50" r="46" fill={b.top} stroke={b.ring} strokeWidth="3"/>
        {b.stripe && <rect x="4" y="36" width="92" height="9" fill={b.stripe}/>}
        {type==='ultra' && <><path d="M14 26 L34 44" stroke={b.stripe} strokeWidth="6" strokeLinecap="round"/><path d="M86 26 L66 44" stroke={b.stripe} strokeWidth="6" strokeLinecap="round"/></>}
        {b.mark && <text x="50" y="34" textAnchor="middle" fontSize="22" fontWeight="900" fill={b.mark} fontFamily="Fredoka One">M</text>}
      </g>
      <rect x="2" y="46" width="96" height="8" fill={b.ring}/>
      <circle cx="50" cy="50" r="13" fill="#fff" stroke={b.ring} strokeWidth="3"/>
      <circle cx="50" cy="50" r="6" fill={b.bottom} stroke={b.ring} strokeWidth="2.5"/>
      {type==='premier' && <g>{[20,50,80].map((x,i)=>(
        <text key={i} x={x} y={i%2?22:84} textAnchor="middle" fontSize="13" fill="#ffd93d" style={{animation:`sparkle 1.4s ease ${i*.3}s infinite`}}>{'\u2728'}</text>
      ))}</g>}
    </svg>
  );
}

/* Type badge */
function TypeBadge({ type }) {
  return <span className="type-badge" style={{ background:PC.typeColor(type) }}>{PC.titleCase(type)}</span>;
}

/* Stat bar */
function StatBar({ label, value, color }) {
  const pct = Math.min(100, (value/180)*100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
      <span style={{ width:54, fontSize:12, fontWeight:800, color:'var(--text-muted)', letterSpacing:'.3px' }}>{label}</span>
      <span style={{ width:30, fontSize:13, fontWeight:800, textAlign:'right' }}>{value}</span>
      <div style={{ flex:1, height:8, borderRadius:99, background:'rgba(0,0,0,.08)', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:color, transition:'width .5s ease' }}/>
      </div>
    </div>
  );
}

/* Progress bar */
function ProgressBar({ value, total }) {
  const pct = (value/total)*100;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:10, borderRadius:99, background:'rgba(0,0,0,.10)', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99,
          background:'linear-gradient(90deg,var(--accent),var(--accent-deep))', transition:'width .6s ease' }}/>
      </div>
      <span className="fredoka" style={{ fontSize:14, color:'var(--text-primary)' }}>{value}<span style={{opacity:.4}}>/{total}</span></span>
    </div>
  );
}

/* Sprite img with skeleton + silhouette fallback */
function Sprite({ id, shiny=false, art=false, size=96, silhouette=false, alt='' }) {
  const [state, setState] = useState('load'); // load | ok | err
  const [triedSprite, setTriedSprite] = useState(false);
  const src = art ? PC.artUrl(id, shiny) : PC.spriteUrl(id, shiny);
  if (silhouette) {
    return (
      <div style={{ width:size, height:size, display:'grid', placeItems:'center' }}>
        <SilhouetteImg id={id} size={size} />
      </div>
    );
  }
  return (
    <div style={{ width:size, height:size, position:'relative', display:'grid', placeItems:'center' }}>
      {state==='load' && <div className="skel" style={{ position:'absolute', inset:'10%', borderRadius:'50%' }}/>}
      {state==='err'
        ? <div style={{ fontFamily:'var(--font-display)', fontSize:size*0.32, color:'var(--text-muted)', opacity:.6 }}>#{id}</div>
        : <img src={src} alt={alt} width={size} height={size}
            onLoad={()=>setState('ok')} onError={()=>setState('err')}
            style={{ width:size, height:size, objectFit:'contain', imageRendering: art?'auto':'pixelated',
                     opacity: state==='ok'?1:0, transition:'opacity .25s ease', filter: shiny&&art?'saturate(1.15)':'none' }}/>}
    </div>
  );
}

/* Silhouette — pixel sprite flattened to a dark shape (reliable, no CSS mask) */
function SilhouetteImg({ id, size=96 }) {
  const [ok, setOk] = useState(false);
  return (
    <div style={{ width:size, height:size, display:'grid', placeItems:'center' }}>
      <img src={PC.spriteUrl(id)} width={size} height={size} alt="" draggable="false"
        onLoad={()=>setOk(true)}
        style={{ width:size, height:size, objectFit:'contain', imageRendering:'pixelated',
          filter:'brightness(0) saturate(0)', opacity: ok ? 0.82 : 0,
          mixBlendMode:'normal', transition:'opacity .25s ease' }}/>
    </div>
  );
}

/* Trainer avatar — real wiki artwork, SVG bust fallback */
function Avatar({ data, size=64, ring=false }) {
  const d = typeof data === 'string' ? PC.AVATARS.find(a=>a.key===data) : data;
  const [err, setErr] = useState(false);
  if (!d) return null;
  const frame = { width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
    background:'linear-gradient(160deg,#cfe3f5,#e9dfce)',
    boxShadow: ring ? '0 0 0 3px var(--accent)' : 'inset 0 0 0 2px rgba(0,0,0,.06)' };
  if (d.file && !err) {
    return (
      <div style={frame}>
        <img src={PC.avatarUrl(d.file)} alt={d.name} draggable="false" onError={()=>setErr(true)}
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
      </div>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display:'block', borderRadius:'50%',
        background:'linear-gradient(160deg,#fff,#ece7dd)', boxShadow: ring?'0 0 0 3px var(--accent)':'inset 0 0 0 2px rgba(0,0,0,.06)' }}>
      <circle cx="32" cy="30" r="14" fill={d.skin}/>
      <path d="M18 30 q0 -16 14 -16 q14 0 14 16 q0 -2 -4 -3 l-20 0 q-4 1 -4 3 Z" fill={d.hair}/>
      <path d="M14 24 q18 -14 36 0 l0 5 q-18 -7 -36 0 Z" fill={d.cap} stroke="rgba(0,0,0,.12)" strokeWidth="1"/>
      <ellipse cx="32" cy="20" rx="7" ry="4.5" fill="#fff" opacity=".92"/>
      <circle cx="27" cy="31" r="1.8" fill="#3a2a22"/>
      <circle cx="37" cy="31" r="1.8" fill="#3a2a22"/>
      <path d="M28 37 q4 3 8 0" stroke="#c47b5a" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M16 52 q16 -10 32 0 l0 12 l-32 0 Z" fill={d.cap} opacity=".9"/>
    </svg>
  );
}

/* Stone icon — faceted gem with colored glow */
function StoneIcon({ stone, size=64, glow=true }) {
  const st = typeof stone==='string' ? PC.stoneOf(stone) : stone;
  if (!st) return null;
  const c = st.color, g = st.glow;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display:'block',
        filter: glow ? `drop-shadow(0 0 10px ${g})` : 'none' }}>
      <defs>
        <linearGradient id={`gem-${st.key}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={g}/><stop offset="1" stopColor={c}/>
        </linearGradient>
      </defs>
      <polygon points="32,6 50,22 32,58 14,22" fill={`url(#gem-${st.key})`} stroke="rgba(255,255,255,.5)" strokeWidth="1.4"/>
      <polygon points="32,6 50,22 32,28 14,22" fill="#fff" opacity=".28"/>
      <polygon points="14,22 32,28 32,58" fill="#000" opacity=".12"/>
      {st.key==='shiny' && <text x="32" y="40" textAnchor="middle" fontSize="16" fill="#fff">{'\u2728'}</text>}
    </svg>
  );
}

Object.assign(window, { BallIcon, TypeBadge, StatBar, ProgressBar, Sprite, SilhouetteImg, Avatar, StoneIcon });
