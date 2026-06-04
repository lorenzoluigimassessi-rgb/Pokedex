/* ===== Overlays — Detail sheet, Evolution toast ===== */

function DetailOverlay({ id, info, stonesInv, caught, onClose, onEvolve, onOpenCatch }) {
  const isCaught = !!info;
  const feat = PC.FEATURE[id];
  const types = feat ? feat.types : ['normal'];
  const mainType = types[0];
  const tc = PC.typeColor(mainType);
  const name = PC.nameOf(id);

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
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>
                    Cercalo durante le catture selvatiche.
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

Object.assign(window, { DetailOverlay, EvoToast, SectionTitle, EvoThumb });
