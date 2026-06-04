/* ===== Catch View — swipe-to-throw, 3 attempts, pulsing ring ===== */
function CatchView({ encounter, trainer, stonesInv, typeCounts, stoneEarned, onResolve, onOpenDex, onOpenStone }) {
  const [phase, setPhase] = useState('idle');
  const [attempts, setAttempts] = useState(3);
  const [throwQuality, setThrowQuality] = useState('');
  const timers = useRef([]);
  const ballRef = useRef(null);
  const dragStart = useRef(null);

  useEffect(() => {
    setPhase('idle'); setAttempts(3); setThrowQuality('');
    timers.current.forEach(clearTimeout); timers.current = [];
  }, [encounter && encounter.id, encounter && encounter._n]);

  // document-level listeners so drag works even when finger leaves the ball
  useEffect(() => {
    function onMove(e) {
      if (!dragStart.current) return;
      // optional: could show arc preview here
    }
    function onUp(e) {
      if (phase !== 'idle' || !dragStart.current) return;
      const endY = e.clientY ?? (e.changedTouches && e.changedTouches[0].clientY);
      const dy = dragStart.current.y - endY;
      dragStart.current = null;
      if (dy < 40) return;
      const quality = dy > 180 ? 'Eccellente!' : dy > 100 ? 'Ottimo!' : 'Bene!';
      throwBall(quality);
    }
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
      document.removeEventListener('touchmove', onMove);
    };
  }, [phase, attempts]);

  if (!encounter) return null;
  const { id, shiny, ball, types } = encounter;
  const name = PC.nameOf(id);
  const mainType = types[0] || 'normal';
  const tc = PC.typeColor(mainType);
  const rarity = PC.rarityOf(id);
  const tierNum = Object.keys(PC.RARITY).find(k => PC.RARITY[k] === rarity) || 2;
  const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  function throwBall(quality) {
    if (phase !== 'idle') return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setThrowQuality(quality);
    setPhase('throwing');
    // catch rate: base from rarity + bonus from quality
    const base = PC.catchRate(id);
    const bonus = quality === 'Eccellente!' ? 0.20 : quality === 'Ottimo!' ? 0.10 : 0;
    const didCatch = Math.random() < (base + bonus);
    after(() => setPhase('wobble'), 500);
    after(() => {
      if (didCatch) {
        setPhase('caught');
        after(() => onResolve(true), 1800);
      } else {
        const left = attempts - 1;
        setAttempts(left);
        if (left <= 0) {
          setPhase('fled');
          after(() => onResolve(false), 1200);
        } else {
          setPhase('idle');
        }
      }
    }, 500 + 1500);
  }

  // — ball drag start (just record Y) —
  function onPointerDown(e) {
    if (phase !== 'idle') return;
    dragStart.current = { y: e.clientY ?? (e.touches && e.touches[0].clientY) };
  }

  // stone strip: show stones with count > 0
  const stoneKeys = ['fire','water','thunder','leaf','moon','sun'];
  const stoneEmoji = { fire:'🔥', water:'💧', thunder:'⚡', leaf:'🌿', moon:'🌙', sun:'☀️' };

  // type counters for the current encounter's types
  const relevantTypes = types.filter(t => PC.TYPE_TO_STONE[t]);

  const showMon = phase === 'idle' || phase === 'fled';
  const tierNum = PC.FEAT_RARITY[id] || 2;

  return (
    <div className="screen" style={{ background:`radial-gradient(120% 70% at 50% 38%, ${tc}33 0%, var(--bg-catch) 52%, #0f1428 100%)`,
      color:'var(--text-light)', userSelect:'none', position:'relative' }}>

      {/* shiny shimmer */}
      {shiny && <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(120deg, transparent 30%, rgba(255,217,61,.12) 50%, transparent 70%)',
        animation:'screen-shimmer 2.4s ease infinite' }}/>}

      {/* vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(180deg, transparent 60%, rgba(8,10,22,.55) 100%)' }}/>

      {/* Header */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'52px 18px 0', position:'relative', zIndex:3 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar data={trainer.avatar} size={40}/>
          <div>
            <div style={{ fontSize:10, color:'rgba(240,240,240,.5)', fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase' }}>Allenatore</div>
            <div className="fredoka" style={{ fontSize:16, lineHeight:1 }}>{trainer.name}</div>
          </div>
        </div>
        <button className="btn-ghost" style={{ height:40, padding:'0 16px', fontSize:13 }} onClick={onOpenDex}>
          Pokédex <span style={{ fontSize:16 }}>›</span>
        </button>
      </header>

      {/* Stone inventory strip */}
      <div style={{ display:'flex', gap:6, padding:'8px 18px 0', position:'relative', zIndex:3, flexWrap:'wrap' }}>
        {stoneKeys.map(sk => {
          const count = stonesInv[sk] || 0;
          if (count === 0) return null;
          return (
            <button key={sk} onClick={() => onOpenStone(sk)}
              style={{ display:'flex', alignItems:'center', gap:3, background:'rgba(255,255,255,.08)',
                borderRadius:999, padding:'3px 9px', fontSize:11, fontWeight:800,
                border:'none', cursor:'pointer', color:'var(--text-light)' }}>
              {stoneEmoji[sk]} ×{count}
            </button>
          );
        })}
        {/* stone earned toast */}
        {stoneEarned && (
          <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,217,61,.25)',
            border:'1px solid var(--gold)', borderRadius:999, padding:'3px 10px', fontSize:11, fontWeight:800, color:'var(--gold)' }}>
            {stoneEmoji[stoneEarned]} +1 Pietra {PC.stoneOf(stoneEarned)?.name}!
          </div>
        )}
      </div>

      {/* Encounter label */}
      <div style={{ textAlign:'center', marginTop:12, position:'relative', zIndex:2,
        opacity: (phase==='idle') ? 1 : 0, transition:'opacity .3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
          {shiny && <span style={{ color:'var(--gold)', fontSize:15 }}>✨</span>}
          <span style={{ fontSize:12, color:'rgba(240,240,240,.6)', fontWeight:700, letterSpacing:'.5px' }}>
            {shiny ? 'Un CROMATICO è apparso!' : 'Un Pokémon selvatico è apparso!'}
          </span>
        </div>
        <h2 className="fredoka" style={{ fontSize:26, margin:'6px 0 6px', color: shiny?'var(--gold)':'#fff' }}>{name}</h2>
        <div style={{ display:'flex', gap:7, justifyContent:'center', marginBottom:4 }}>
          {types.map(t => <TypeBadge key={t} type={t}/>)}
        </div>
        {/* Rarity pill — only for rare+ */}
        {tierNum >= 3 && (
          <div style={{ display:'inline-block', padding:'3px 14px', borderRadius:999, fontSize:10, fontWeight:900,
            letterSpacing:'1px', border:`1px solid ${tc}`,
            background:`${tc}22`, color:tc,
            animation: tierNum >= 6 ? 'screen-shimmer 2s ease infinite' : 'none' }}>
            {rarity.label.toUpperCase()}
          </div>
        )}
      </div>

      {/* Stage — Pokémon + ring + ball */}
      <div style={{ flex:1, position:'relative' }}>
        {/* platform glow */}
        <div style={{ position:'absolute', left:'50%', top:'56%', transform:'translate(-50%,-50%)',
          width:230, height:60, borderRadius:'50%', background:`radial-gradient(${tc}55,transparent 70%)`, filter:'blur(4px)' }}/>

        {/* Pokémon + pulsing ring */}
        {showMon && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)', display:'grid', placeItems:'center' }}>
            {/* outer static dashed ring */}
            <div style={{ position:'absolute', width:170, height:170, borderRadius:'50%',
              border:'2px dashed rgba(255,255,255,.2)' }}/>
            {/* pulsing shrink ring */}
            <div style={{ position:'absolute', width:170, height:170, borderRadius:'50%',
              border:`3px solid ${tc}`, boxShadow:`0 0 16px ${tc}88`,
              animation:'ring-pulse-shrink 1.8s ease infinite' }}/>
            <div style={{ position:'relative', animation: phase==='fled' ? 'mon-flee .5s ease forwards' : 'float-y 3.2s ease infinite' }}>
              <Sprite id={id} shiny={shiny} art size={190}/>
              {shiny && phase==='idle' && [{x:-80,y:-55},{x:88,y:-28},{x:-62,y:65},{x:74,y:70},{x:0,y:-85}].map((p,i)=>(
                <span key={i} style={{ position:'absolute', left:`calc(50% + ${p.x}px)`, top:`calc(50% + ${p.y}px)`,
                  fontSize:16, animation:`sparkle 1.6s ease ${i*.25}s infinite` }}>✨</span>
              ))}
            </div>
          </div>
        )}

        {/* Throw quality label */}
        {throwQuality && phase === 'throwing' && (
          <div style={{ position:'absolute', left:0, right:0, top:'22%', textAlign:'center',
            fontFamily:'var(--font-display)', fontSize:22, color:'var(--gold)',
            animation:'gotcha-in .4s ease', pointerEvents:'none' }}>{throwQuality}</div>
        )}

        {/* Thrown ball arc */}
        {phase === 'throwing' && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)',
            animation:'ball-arc .5s ease forwards' }}>
            <BallIcon type={ball} size={52}/>
          </div>
        )}

        {/* Wobble */}
        {phase === 'wobble' && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
            <BallIcon type={ball} size={60} wobble/>
            <div style={{ marginTop:12, color:'rgba(255,255,255,.7)', fontSize:20, letterSpacing:'4px' }}>···</div>
          </div>
        )}

        {/* Caught */}
        {phase === 'caught' && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <BallIcon type="poke" size={70}/>
              {[0,1,2,3,4,5].map(i=>(
                <span key={i} style={{ position:'absolute', left:'50%', top:'50%', fontSize:20, color:'var(--gold)',
                  transform:`rotate(${i*60}deg) translateY(-58px)`, transformOrigin:'0 0',
                  animation:`star-burst .9s ease ${i*.04}s` }}>⭐</span>
              ))}
            </div>
            <h2 className="fredoka" style={{ fontSize:36, color:'var(--gold)', margin:'22px 0 4px', animation:'gotcha-in .5s ease' }}>Preso!</h2>
            <p style={{ fontWeight:700, color:'#fff', fontSize:15 }}>{shiny && '✨ '}{name} è stato catturato!</p>
          </div>
        )}

        {/* Fled */}
        {phase === 'fled' && (
          <div style={{ position:'absolute', left:'50%', top:'68%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
            <h2 className="fredoka" style={{ fontSize:28, color:'#fff', margin:0, opacity:.85 }}>È fuggito!</h2>
            <p style={{ fontSize:13, color:'rgba(240,240,240,.55)', fontWeight:600, marginTop:4 }}>Arriva un altro…</p>
          </div>
        )}
      </div>

      {/* Type counters */}
      {phase === 'idle' && relevantTypes.length > 0 && (
        <div style={{ padding:'0 18px 6px', position:'relative', zIndex:2 }}>
          {relevantTypes.map(t => {
            const sk = PC.TYPE_TO_STONE[t];
            const count = typeCounts[sk] || 0;
            return (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                <span style={{ fontSize:10, fontWeight:800, width:52, color:'rgba(240,240,240,.7)' }}>
                  {stoneEmoji[sk]} {PC.titleCase(t)}
                </span>
                <div style={{ flex:1, height:6, borderRadius:999, background:'rgba(255,255,255,.1)', overflow:'hidden' }}>
                  <div style={{ width:`${(count/10)*100}%`, height:'100%', borderRadius:999,
                    background:PC.typeColor(t), transition:'width .4s ease' }}/>
                </div>
                <span style={{ fontSize:10, fontWeight:800, color:'rgba(240,240,240,.5)', width:26, textAlign:'right' }}>{count}/10</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Throw zone — swipeable ball + attempt dots */}
      {(phase === 'idle' || phase === 'throwing' || phase === 'wobble') && (
        <div style={{ padding:'0 22px 28px', position:'relative', zIndex:2,
          display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          {/* attempt dots */}
          <div style={{ display:'flex', gap:8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:'50%',
                background: i < attempts ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.15)',
                boxShadow: i < attempts ? '0 0 6px rgba(255,255,255,.5)' : 'none',
                transition:'all .3s ease' }}/>
            ))}
          </div>
          {/* hint */}
          {phase === 'idle' && (
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,.35)', letterSpacing:'.5px' }}>
              ↑ TRASCINA IN SU PER LANCIARE
            </div>
          )}
          {/* ball */}
          <div ref={ballRef}
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
            style={{ cursor: phase==='idle' ? 'grab' : 'default',
              opacity: phase !== 'idle' ? 0.3 : 1, transition:'opacity .2s ease',
              animation: phase==='idle' ? 'ball-idle 2s ease infinite' : 'none' }}>
            <BallIcon type={ball} size={64}/>
          </div>
        </div>
      )}

    </div>
  );
}

Object.assign(window, { CatchView });
