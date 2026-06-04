/* ===== Overlays — Detail sheet, Evolution toast ===== */

function DetailOverlay({ id, info, stonesInv, caught, onClose, onEvolve, onOpenCatch }) {
  const isCaught = !!info;
  const feat = PC.FEATURE[id];
  const types = feat ? feat.types : ['normal'];
  const mainType = types[0];
  const tc = PC.typeColor(mainType);
  const name = PC.nameOf(id);

  // ── NON-FEATURE Pokémon (not in the game yet) ──
  if (!feat) {
    return (
      <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
        <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
        <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'70%',
          background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
          animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ borderTop:'4px solid var(--skin)', paddingTop:8, flexShrink:0 }}>
            <div onClick={onClose} style={{ width:44, height:5, borderRadius:99, background:'rgba(0,0,0,.18)', margin:'2px auto 6px', cursor:'pointer' }}/>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 28px 28px', gap:12 }}>
            {/* silhouette */}
            <div style={{ filter:'brightness(0) saturate(0)', opacity:.45 }}>
              <Sprite id={id} art size={130}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</div>
              <h2 className="fredoka" style={{ fontSize:26, margin:'4px 0 6px', color:'var(--text-muted)', letterSpacing:3 }}>???</h2>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>Non ancora disponibile</div>
            </div>
            <div style={{ background:'rgba(0,0,0,.04)', border:'1.5px solid rgba(0,0,0,.08)',
              borderRadius:14, padding:'12px 16px', width:'100%', textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>Questo Pokémon</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, lineHeight:1.5 }}>
                non fa ancora parte del gioco.<br/>Continua a catturare per espandere il Pokédex!
              </div>
            </div>
            <button className="btn-primary" style={{ maxWidth:240, margin:'0 auto' }} onClick={onClose}>
              Torna al Pokédex
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- evolution options ---
  // 3-stage: need 5× current form; 2-stage: need 10×
  function evoThreshold(fromId) {
    const f = PC.FEATURE[fromId];
    if (!f || !f.evo) return 5;
    return f.evo.length === 2 ? 10 : 5;
  }

  const stoneOpts = [];
  const evolveOpts = [];
  if (isCaught && feat) {
    if (feat.branch) {
      const threshold = evoThreshold(id);
      const cnt = info.count;
      feat.branch.forEach(([toId, sk]) => {
        const hasStone = (stonesInv[sk] || 0) > 0;
        stoneOpts.push({ toId, sk, threshold, cnt, canEvo: cnt >= threshold && hasStone });
      });
    } else if (feat.evo && feat.evo.length > 1) {
      const idx = feat.evo.indexOf(id);
      if (idx > -1 && idx < feat.evo.length - 1) {
        const toId = feat.evo[idx + 1];
        const threshold = evoThreshold(id);
        const cnt = info.count;
        if (feat.stone) {
          const hasStone = (stonesInv[feat.stone] || 0) > 0;
          stoneOpts.push({ toId, sk: feat.stone, threshold, cnt, canEvo: cnt >= threshold && hasStone });
        } else {
          evolveOpts.push({ toId, threshold, cnt, canEvo: cnt >= threshold });
        }
      }
    }
  }

  return (
    <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'90%',
        background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
        animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* header strip */}
        <div style={{ background:`linear-gradient(180deg, ${tc}30, transparent)`, borderTop:'4px solid var(--skin)', paddingTop:8, flexShrink:0 }}>
          <div onClick={onClose} style={{ width:44, height:5, borderRadius:99, background:'rgba(0,0,0,.18)', margin:'2px auto 6px', cursor:'pointer' }}/>
        </div>

        <div className="scroll" style={{ flex:1, padding:'0 22px 28px' }}>
          {/* artwork */}
          <div style={{ display:'grid', placeItems:'center', position:'relative', marginTop:-4 }}>
            <div style={{ position:'absolute', top:20, width:200, height:200, borderRadius:'50%',
              background:`radial-gradient(${tc}40, transparent 68%)` }}/>
            {isCaught
              ? <Sprite id={id} shiny={info.shiny} art size={210}/>
              : <div style={{ filter:'brightness(0)', opacity:.55 }}><Sprite id={id} art size={210}/></div>}
          </div>

          {/* name / badges */}
          <div style={{ textAlign:'center', marginTop:-6 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</div>
            <h2 className="fredoka" style={{ fontSize:30, margin:'2px 0 10px' }}>
              {isCaught ? name : '???'}
            </h2>
            {isCaught && (
              <div style={{ display:'flex', gap:8, justifyContent:'center', alignItems:'center', flexWrap:'wrap' }}>
                {types.map(t => <TypeBadge key={t} type={t}/>)}
                {info.count > 1 && <span style={{ fontSize:13, fontWeight:800, color:'var(--accent)', whiteSpace:'nowrap',
                  background:'rgba(255,107,107,.12)', padding:'5px 12px', borderRadius:99 }}>×{info.count} catturati</span>}
                {info.shiny && <span style={{ fontSize:13, fontWeight:800, color:'#b8860b', whiteSpace:'nowrap',
                  background:'rgba(255,217,61,.22)', padding:'5px 12px', borderRadius:99 }}>✨ Cromatico</span>}
              </div>
            )}
          </div>

          {/* ── UNCAUGHT STATE ── */}
          {!isCaught ? (
            <div style={{ marginTop:20 }}>
              {/* how to unlock box */}
              <div style={{ background:'rgba(255,107,107,.07)', border:'1.5px solid rgba(255,107,107,.25)',
                borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--accent)', marginBottom:10 }}>
                  Come ottenere {name === '???' ? 'questo Pokémon' : name}
                </div>
                {feat && feat.evo && feat.evo.length > 1 && feat.evo.indexOf(id) > 0 ? (() => {
                  const prevId = feat.evo[feat.evo.indexOf(id) - 1];
                  const threshold = evoThreshold(prevId);
                  const prevCnt = caught[prevId] ? caught[prevId].count : 0;
                  const prevName = PC.nameOf(prevId);
                  return (
                    <>
                      {/* evolve path */}
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,107,107,.15)',
                          display:'grid', placeItems:'center', flexShrink:0, fontSize:13 }}>◆</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)' }}>Evolvi da {prevName}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, marginTop:2 }}>
                            Cattura {threshold}× {prevName} — ne hai {prevCnt}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
                            <div style={{ flex:1, height:5, borderRadius:999, background:'rgba(0,0,0,.1)', overflow:'hidden' }}>
                              <div style={{ width:`${Math.min(100,(prevCnt/threshold)*100)}%`, height:'100%',
                                borderRadius:999, background:'var(--accent)' }}/>
                            </div>
                            <span style={{ fontSize:10, fontWeight:800, color:'var(--accent)' }}>{prevCnt}/{threshold}</span>
                          </div>
                        </div>
                      </div>
                      {/* divider */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <div style={{ flex:1, height:1, background:'rgba(0,0,0,.08)' }}/>
                        <span style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)' }}>OPPURE</span>
                        <div style={{ flex:1, height:1, background:'rgba(0,0,0,.08)' }}/>
                      </div>
                      {/* wild path */}
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(100,100,200,.1)',
                          display:'grid', placeItems:'center', flexShrink:0, fontSize:13 }}>⚡</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)' }}>Trovalo allo stato selvatico</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, marginTop:2 }}>
                            {PC.rarityOf(id).label} — continua a cercare!
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })() : (
                  /* standalone or base-form uncaught */
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(100,100,200,.1)',
                      display:'grid', placeItems:'center', flexShrink:0, fontSize:13 }}>⚡</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)' }}>Trovalo allo stato selvatico</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, marginTop:2 }}>
                        {PC.rarityOf(id).label} — continua a cercare!
                      </div>
                      {feat && types.length > 0 && (
                        <div style={{ display:'flex', gap:5, marginTop:6 }}>
                          {types.map(t => <TypeBadge key={t} type={t}/>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* evo chain preview */}
              {feat && feat.evo && feat.evo.length > 1 && (
                <div style={{ marginBottom:14 }}>
                  <SectionTitle>Linea evolutiva</SectionTitle>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
                    {feat.evo.map((eid, i) => (
                      <React.Fragment key={eid}>
                        {i > 0 && <span style={{ color:'var(--text-muted)', fontSize:18 }}>→</span>}
                        <EvoThumb eid={eid} current={eid === id} isCaught={!!caught[eid]}/>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn-primary" style={{ maxWidth:260, margin:'0 auto' }} onClick={onOpenCatch}>
                Vai a catturare!
              </button>
            </div>
          ) : (
            /* ── CAUGHT STATE ── */
            <>
              {/* flavor text */}
              {feat && feat.flavor && (
                <div style={{ marginTop:20, marginBottom:18 }}>
                  <SectionTitle>Descrizione</SectionTitle>
                  <p style={{ marginTop:10, fontSize:13.5, lineHeight:1.65, color:'var(--text-primary)' }}>
                    {feat.flavor}
                  </p>
                </div>
              )}

              {/* evolution chain */}
              {feat && feat.evo && feat.evo.length > 1 && (
                <div style={{ marginBottom:16 }}>
                  <SectionTitle>Linea evolutiva</SectionTitle>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
                    {feat.evo.map((eid, i) => (
                      <React.Fragment key={eid}>
                        {i > 0 && <span style={{ color:'var(--text-muted)', fontSize:18 }}>→</span>}
                        <EvoThumb eid={eid} current={eid === id} isCaught={!!caught[eid]}/>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* evolve buttons (no stone) */}
              {evolveOpts.map(({ toId, threshold, cnt, canEvo }) => (
                <div key={toId} style={{ marginBottom:8 }}>
                  <button onClick={canEvo ? () => onEvolve(id, toId, null) : undefined}
                    style={{ width:'100%', height:50, borderRadius:14,
                      border:`2px solid ${canEvo ? 'var(--accent)' : 'rgba(0,0,0,.15)'}`,
                      background: canEvo ? 'rgba(255,107,107,.1)' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                      fontFamily:'var(--font-display)', fontSize:15, color:'var(--text-primary)',
                      opacity: canEvo ? 1 : .5, cursor: canEvo ? 'pointer' : 'not-allowed' }}>
                    <Sprite id={toId} size={32}/>
                    Evolvi → {PC.nameOf(toId)}
                  </button>
                  <div style={{ fontSize:10, color: canEvo ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight:700, textAlign:'center', marginTop:3 }}>
                    {canEvo ? `✓ ${cnt}/${threshold} — Pronto!` : `Servono ${threshold}× ${name} (hai ${cnt})`}
                  </div>
                </div>
              ))}

              {/* evolve buttons (stone) */}
              {stoneOpts.map(({ toId, sk, threshold, cnt, canEvo }) => {
                const st = PC.stoneOf(sk);
                return (
                  <div key={`${toId}-${sk}`} style={{ marginBottom:8 }}>
                    <button onClick={canEvo ? () => onEvolve(id, toId, sk) : undefined}
                      style={{ width:'100%', height:50, borderRadius:14,
                        border:`2px solid ${canEvo ? st.color : 'rgba(0,0,0,.15)'}`,
                        background: canEvo ? `${st.color}18` : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                        fontFamily:'var(--font-display)', fontSize:15, color:'var(--text-primary)',
                        opacity: canEvo ? 1 : .5, cursor: canEvo ? 'pointer' : 'not-allowed' }}>
                      <StoneIcon stone={sk} size={28} glow={false}/>
                      Usa Pietra {st.name} → {PC.nameOf(toId)}
                    </button>
                    <div style={{ fontSize:10, color: canEvo ? st.color : 'var(--text-muted)',
                      fontWeight:700, textAlign:'center', marginTop:3 }}>
                      {cnt < threshold
                        ? `Servono ${threshold}× ${name} (hai ${cnt})`
                        : (stonesInv[sk] || 0) === 0
                          ? `Servono ${cnt}/${threshold} ✓ — ma manca la Pietra ${st.name}`
                          : `✓ Pronto!`}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EvoThumb({ eid, current, isCaught }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <div style={{ width:62, height:62, borderRadius:'50%', display:'grid', placeItems:'center',
        background: current ? 'var(--skin-soft)' : 'rgba(0,0,0,.04)',
        border: current ? '2px solid var(--skin)' : '2px solid transparent' }}>
        {isCaught
          ? <Sprite id={eid} size={48}/>
          : <div style={{ filter:'brightness(0) saturate(0)', opacity:.5 }}><Sprite id={eid} size={48}/></div>}
      </div>
      <span style={{ fontSize:10, fontWeight:800, color: current ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {isCaught ? PC.nameOf(eid) : '???'}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--text-primary)',
    letterSpacing:'.3px', borderLeft:'3px solid var(--accent)', paddingLeft:8 }}>{children}</div>;
}

/* ----- Evolution toast ----- */
function EvoToast({ from, to }) {
  return (
    <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', zIndex:50,
      background:'var(--bg-pokedex-dark)', color:'var(--text-light)', borderRadius:16, padding:'12px 18px',
      display:'flex', alignItems:'center', gap:12, boxShadow:'0 12px 36px rgba(0,0,0,.5)',
      border:'1px solid rgba(255,255,255,.12)', animation:'toast-in 3.4s ease forwards', whiteSpace:'nowrap' }}>
      <Sprite id={from} size={36}/>
      <span style={{ color:'var(--gold)', fontSize:18 }}>→</span>
      <Sprite id={to} size={40}/>
      <div>
        <div style={{ fontSize:11, fontWeight:800, color:'var(--gold)', letterSpacing:'.5px' }}>EVOLUTO!</div>
        <div className="fredoka" style={{ fontSize:15 }}>{PC.nameOf(from)} → {PC.nameOf(to)}</div>
      </div>
    </div>
  );
}

/* ----- Full-screen evolution animation ----- */
function EvoScreen({ fromId, toId, onClose }) {
  const [phase, setPhase] = useState('flash'); // flash | reveal | done
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 600);
    const t2 = setTimeout(() => setPhase('done'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const feat = PC.FEATURE[toId];
  const types = feat ? feat.types : ['normal'];
  return (
    <div style={{ position:'absolute', inset:0, zIndex:50,
      background: phase === 'flash' ? '#fff' : 'radial-gradient(circle at 50% 45%, #2a2350, #0f1428)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14,
      transition:'background .5s ease', animation:'fade-in .15s ease' }}>
      {phase !== 'flash' && (
        <>
          <div style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,.4)', letterSpacing:2 }}>IN EVOLUZIONE…</div>
          <div style={{ width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.07)',
            display:'grid', placeItems:'center', position:'relative',
            boxShadow: phase==='done' ? '0 0 0 0 rgba(255,217,61,0)' : '0 0 40px rgba(255,217,61,.4)',
            animation: phase==='reveal' ? 'evo-pulse 1.6s ease infinite' : 'none' }}>
            <div style={{ position:'absolute', inset:-16, borderRadius:'50%',
              border:'2px solid rgba(255,217,61,.3)', animation:'ring-expand 1.6s ease infinite' }}/>
            <Sprite id={toId} art size={120}/>
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--gold)',
            animation:'float-y 2.5s ease infinite' }}>{PC.nameOf(fromId)}</div>
          <div style={{ fontSize:16, color:'rgba(255,255,255,.45)' }}>si è evoluto in</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:34, color:'#fff',
            animation:'gotcha-in .5s ease' }}>{PC.nameOf(toId)}!</div>
          <div style={{ display:'flex', gap:6, marginTop:2 }}>
            {types.map(t => <TypeBadge key={t} type={t}/>)}
          </div>
          {phase === 'done' && (
            <>
              <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'10px 22px', textAlign:'center', marginTop:6 }}>
                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.4)', letterSpacing:1 }}>POKÉDEX AGGIORNATO</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'#fff', marginTop:2 }}>
                  #{String(toId).padStart(3,'0')} {PC.nameOf(toId)} sbloccato ✓
                </div>
              </div>
              <button className="btn-ghost" onClick={onClose} style={{ marginTop:8 }}>Vedi nel Pokédex</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ----- Stone detail sheet ----- */
function StoneSheet({ stoneKey, stonesInv, onClose, onOpenDetail }) {
  const st = PC.stoneOf(stoneKey);
  if (!st) return null;
  // find all FEATURE Pokémon that use this stone
  const users = [];
  Object.entries(PC.FEATURE).forEach(([idStr, feat]) => {
    const id = Number(idStr);
    if (feat.stone === stoneKey) {
      const idx = feat.evo.indexOf(id);
      if (idx > -1 && idx < feat.evo.length - 1) users.push({ fromId: id, toId: feat.evo[idx+1] });
    }
    if (feat.branch) {
      feat.branch.forEach(([toId, sk]) => {
        if (sk === stoneKey) users.push({ fromId: id, toId });
      });
    }
  });
  const stoneEmoji = { fire:'🔥', water:'💧', thunder:'⚡', leaf:'🌿', moon:'🌙', sun:'☀️' };
  return (
    <div style={{ position:'absolute', inset:0, zIndex:35, animation:'fade-in .2s ease' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.6)', backdropFilter:'blur(3px)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'68%',
        background:'#1e1e2a', borderTopLeftRadius:26, borderTopRightRadius:26,
        animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ paddingTop:8, flexShrink:0 }}>
          <div onClick={onClose} style={{ width:44, height:5, borderRadius:99, background:'rgba(255,255,255,.15)', margin:'2px auto 6px', cursor:'pointer' }}/>
        </div>
        {/* stone header */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 0 14px', flexShrink:0 }}>
          <StoneIcon stone={stoneKey} size={56}/>
          <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'#fff' }}>{stoneEmoji[stoneKey] || ''} Pietra {st.name}</div>
          <div style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,.5)' }}>
            Hai: <span style={{ color:st.color }}>×{stonesInv[stoneKey] || 0}</span>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.3)', textAlign:'center', padding:'0 28px' }}>
            Guadagna catturando 10 Pokémon di tipo {st.name}
          </div>
        </div>
        {/* list */}
        <div style={{ fontFamily:'var(--font-display)', fontSize:13, color:'rgba(255,255,255,.5)',
          padding:'0 18px 6px', flexShrink:0 }}>Evolve:</div>
        <div className="scroll" style={{ flex:1, padding:'0 16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
          {users.map(({ fromId, toId }) => (
            <button key={`${fromId}-${toId}`} onClick={() => { onClose(); onOpenDetail(fromId); }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                background:'rgba(255,255,255,.06)', borderRadius:12, textAlign:'left',
                border:'none', cursor:'pointer', width:'100%' }}>
              <Sprite id={fromId} size={38}/>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'#fff' }}>{PC.nameOf(fromId)}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700 }}>→ {PC.nameOf(toId)}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'rgba(255,255,255,.3)', fontSize:18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----- Completion screen ----- */
function CompletionScreen({ trainerName, onClose }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:60,
      background:'radial-gradient(circle at 50% 40%, #1a1060, #0f1428)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:12, overflow:'hidden', animation:'fade-in .4s ease' }}>
      {/* falling stars */}
      {[10,28,50,72,88].map((l,i) => (
        <span key={i} style={{ position:'absolute', top:0, left:`${l}%`, fontSize:18,
          animation:`star-fall ${1.8+i*.2}s linear ${i*.3}s infinite` }}>
          {i%2===0?'⭐':'✨'}
        </span>
      ))}
      <svg width="90" height="90" viewBox="0 0 100 100" style={{ filter:'drop-shadow(0 0 20px var(--gold))' }}>
        <circle cx="50" cy="50" r="46" fill="#f5f5f5" stroke="var(--gold)" strokeWidth="4"/>
        <path d="M4 50 a46 46 0 0 1 92 0 Z" fill="var(--gold)" stroke="var(--gold)" strokeWidth="4"/>
        <rect x="2" y="44" width="96" height="12" fill="#b8860b"/>
        <circle cx="50" cy="50" r="13" fill="#fff" stroke="#b8860b" strokeWidth="4"/>
      </svg>
      <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--gold)',
        textAlign:'center', lineHeight:1.2, animation:'gotcha-in .6s ease' }}>
        Hai catturato<br/>tutti!
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,.6)', fontWeight:700 }}>
        {trainerName} — {Object.keys(PC.FEATURE).length}/{Object.keys(PC.FEATURE).length}
      </div>
      <div style={{ fontSize:40, marginTop:4 }}>🏆</div>
      <button className="btn-ghost" onClick={onClose} style={{ marginTop:12 }}>Continua a giocare</button>
    </div>
  );
}

Object.assign(window, { DetailOverlay, EvoScreen, StoneSheet, CompletionScreen, EvoToast, SectionTitle, EvoThumb });
