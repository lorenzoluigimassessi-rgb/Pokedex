/* ===== Catch View — core game, scripted mini-game ===== */
function CatchView({ encounter, trainer, stats, onResolve, onOpenDex }) {
  // phase: idle | aiming | wobble | caught | fled
  const [phase, setPhase] = useState('idle');
  const [timingMsg, setTimingMsg] = useState('');
  const timers = useRef([]);

  useEffect(() => {
    setPhase('idle'); setTimingMsg('');
    return () => timers.current.forEach(clearTimeout);
  }, [encounter && encounter.id, encounter && encounter._n]);

  if (!encounter) return null;
  const { id, shiny, ball, types } = encounter;
  const name = PC.nameOf(id);
  const mainType = types[0] || 'normal';
  const tc = PC.typeColor(mainType);
  const ballType = shiny ? 'premier' : ball;
  const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  function startCatch() {
    if (phase !== 'idle') return;
    setPhase('aiming');
    // ring shrink ~1.3s, then auto-throw if not tapped
    after(() => setPhase(p => p==='aiming' ? throwBall('') : p), 1350);
  }

  function onAimTap() {
    if (phase !== 'aiming') return;
    // timing feedback based on how late the tap is (cosmetic)
    const msg = ['Nice!','Great!','Excellent!'][Math.floor(Math.random()*3)];
    throwBall(msg);
  }

  function throwBall(msg) {
    timers.current.forEach(clearTimeout); timers.current = [];
    setTimingMsg(msg);
    setPhase('throwing');
    after(() => setPhase('wobble'), 480);
    // decide outcome — weighted toward success ("no punishment")
    const caught = Math.random() < 0.8;
    after(() => {
      setPhase(caught ? 'caught' : 'fled');
      after(() => onResolve(caught), caught ? 1700 : 1500);
    }, 480 + 1500);
  }

  const showMon = phase==='idle' || phase==='aiming' || phase==='fled';
  const aiming = phase==='aiming';

  return (
    <div className="screen" onClick={aiming ? onAimTap : undefined}
      style={{ background:`radial-gradient(120% 70% at 50% 38%, ${tc}33 0%, var(--bg-catch) 52%, #0f1428 100%)`,
        color:'var(--text-light)', transition:'background .4s ease', userSelect:'none' }}>

      {/* shiny shimmer overlay */}
      {shiny && <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(120deg, transparent 30%, rgba(255,217,61,.12) 50%, transparent 70%)',
        animation:'screen-shimmer 2.4s ease infinite' }}/>}

      {/* tall-grass vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(180deg, transparent 60%, rgba(8,10,22,.55) 100%)' }}/>

      {/* Header */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'52px 18px 0', position:'relative', zIndex:3 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar data={trainer.avatar} size={40}/>
          <div>
            <div style={{ fontSize:10, color:'rgba(240,240,240,.5)', fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase' }}>Trainer</div>
            <div className="fredoka" style={{ fontSize:16, lineHeight:1 }}>{trainer.name}</div>
          </div>
        </div>
        <button className="btn-ghost" style={{ height:40, padding:'0 16px', fontSize:13 }} onClick={onOpenDex}>
          Pokédex <span style={{ fontSize:16 }}>›</span>
        </button>
      </header>

      {/* Encounter label */}
      <div style={{ textAlign:'center', marginTop:14, position:'relative', zIndex:2,
        opacity: (phase==='idle'||phase==='aiming') ? 1 : 0, transition:'opacity .3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, whiteSpace:'nowrap' }}>
          {shiny && <span style={{ color:'var(--gold)', fontSize:15 }}>✨</span>}
          <span style={{ fontSize:12, color:'rgba(240,240,240,.6)', fontWeight:700, letterSpacing:'.5px' }}>
            {shiny ? 'A SHINY appeared!' : 'A wild Pokémon appeared!'}
          </span>
        </div>
        <h2 className="fredoka" style={{ fontSize:26, margin:'8px 0 10px', lineHeight:1.1, color: shiny?'var(--gold)':'#fff' }}>{name}</h2>
        <div style={{ display:'flex', gap:7, justifyContent:'center' }}>
          {types.map(t => <TypeBadge key={t} type={t}/>)}
        </div>
      </div>

      {/* Stage */}
      <div style={{ flex:1, position:'relative' }}>
        {/* platform glow */}
        <div style={{ position:'absolute', left:'50%', top:'56%', transform:'translate(-50%,-50%)',
          width:230, height:60, borderRadius:'50%', background:`radial-gradient(${tc}55,transparent 70%)`, filter:'blur(4px)' }}/>

        {/* Pokémon */}
        {showMon && (
          <div key={'mon'+phase} style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)' }}>
            <div style={{ position:'relative', animation: phase==='fled' ? 'mon-pop .4s ease' : 'float-y 3.2s ease infinite' }}>
              <Sprite id={id} shiny={shiny} art size={208}/>
              {/* shiny sparkles */}
              {shiny && (phase==='idle'||phase==='aiming') && [
                {x:-90,y:-60},{x:96,y:-30},{x:-70,y:70},{x:80,y:78},{x:0,y:-92}
              ].map((p,i)=>(
                <span key={i} style={{ position:'absolute', left:`calc(50% + ${p.x}px)`, top:`calc(50% + ${p.y}px)`,
                  fontSize:18, animation:`sparkle 1.6s ease ${i*.25}s infinite` }}>✨</span>
              ))}
            </div>
          </div>
        )}

        {/* Aiming ring */}
        {aiming && (
          <>
            <div style={{ position:'absolute', left:'50%', top:'42%', width:170, height:170,
              borderRadius:'50%', border:'3px dashed rgba(255,255,255,.35)', transform:'translate(-50%,-50%)' }}/>
            <div style={{ position:'absolute', left:'50%', top:'42%', width:170, height:170,
              borderRadius:'50%', border:'4px solid #fff', boxShadow:'0 0 18px rgba(255,255,255,.6)',
              animation:'ring-shrink 1.35s ease forwards' }}/>
            <div style={{ position:'absolute', left:0, right:0, top:'70%', textAlign:'center',
              fontSize:13, fontWeight:800, color:'rgba(255,255,255,.85)' }}>Tap when the ring lines up!</div>
          </>
        )}

        {/* Thrown ball */}
        {(phase==='throwing'||phase==='wobble') && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)' }}>
            <div style={{ animation: phase==='throwing' ? 'ball-drop .48s ease' : 'none' }}>
              <BallIcon type={ballType} size={64} wobble={phase==='wobble'}/>
              {phase==='wobble' && <div style={{ textAlign:'center', marginTop:14, color:'rgba(255,255,255,.7)', fontSize:20, letterSpacing:'4px' }}>···</div>}
            </div>
          </div>
        )}

        {/* Caught */}
        {phase==='caught' && (
          <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <BallIcon type={ballType} size={70}/>
              {[0,1,2,3,4,5].map(i=>(
                <span key={i} style={{ position:'absolute', left:'50%', top:'50%', fontSize:20, color:'var(--gold)',
                  transform:`rotate(${i*60}deg) translateY(-58px)`, transformOrigin:'0 0',
                  animation:`star-burst .9s ease ${i*.04}s` }}>⭐</span>
              ))}
            </div>
            <h2 className="fredoka" style={{ fontSize:36, color:'var(--gold)', margin:'22px 0 4px', animation:'gotcha-in .5s ease' }}>Gotcha!</h2>
            <p style={{ fontWeight:700, color:'#fff', fontSize:15 }}>{shiny && '✨ '}{name} was caught!</p>
          </div>
        )}

        {/* Fled */}
        {phase==='fled' && (
          <div style={{ position:'absolute', left:'50%', top:'70%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
            <h2 className="fredoka" style={{ fontSize:28, color:'#fff', margin:0, opacity:.85 }}>It fled!</h2>
            <p style={{ fontSize:13, color:'rgba(240,240,240,.55)', fontWeight:600, marginTop:4 }}>Here comes another…</p>
          </div>
        )}

        {timingMsg && phase!=='idle' && phase!=='aiming' && (
          <div style={{ position:'absolute', left:0, right:0, top:'24%', textAlign:'center', color:'var(--gold)',
            fontFamily:'var(--font-display)', fontSize:20, animation:'gotcha-in .4s ease', pointerEvents:'none',
            opacity: phase==='throwing'?1:0, transition:'opacity .4s ease' }}>{timingMsg}</div>
        )}
      </div>

      {/* Ball indicator */}
      {(phase==='idle'||phase==='aiming') && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9, marginBottom:14, position:'relative', zIndex:2 }}>
          <BallIcon type={ballType} size={26}/>
          <span style={{ fontSize:13, fontWeight:800, color:'rgba(240,240,240,.8)' }}>{PC.BALLS[ballType].name}</span>
        </div>
      )}

      {/* CATCH button */}
      <div style={{ padding:'0 22px 14px', position:'relative', zIndex:2 }}>
        <button className="btn-primary"
          style={{ background: aiming?'var(--gold)':'var(--accent)', color: aiming?'#2d2d2d':'#fff',
            boxShadow: aiming?'0 8px 22px rgba(255,217,61,.45)':'0 8px 22px rgba(255,107,107,.42)' }}
          disabled={phase==='throwing'||phase==='wobble'||phase==='caught'||phase==='fled'}
          onClick={(e)=>{ e.stopPropagation(); aiming ? onAimTap() : startCatch(); }}>
          {phase==='idle' && <>CATCH!</>}
          {aiming && <>THROW</>}
          {(phase==='throwing'||phase==='wobble') && <>…</>}
          {phase==='caught' && <>Gotcha!</>}
          {phase==='fled' && <>It fled…</>}
        </button>
      </div>

      {/* Footer */}
      <footer style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18,
        padding:'0 0 30px', fontSize:13, fontWeight:800, color:'rgba(240,240,240,.55)', position:'relative', zIndex:2 }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><BallIcon type="poke" size={16}/> Catches: <span style={{ color:'#fff' }}>{stats.catches}</span></span>
        <span style={{ opacity:.3 }}>|</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ color:'var(--gold)' }}>◆</span> Stones: <span style={{ color:'#fff' }}>{stats.stones}</span></span>
      </footer>
    </div>
  );
}

Object.assign(window, { CatchView });
