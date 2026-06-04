/* ===== Overlays — Detail sheet, Evolution toast ===== */

/* ── Shared helpers ── */
function evoThreshold(d) {
  if (!d || !d.evo) return 5;
  return d.evo.length === 2 ? 10 : 5;
}

function EvoThumb({ eid, current, isCaught }) {
  const d = PC.getDataSync(eid);
  const label = isCaught ? (d?.name || PC.nameOf(eid)) : '???';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <div style={{ width:60, height:60, borderRadius:'50%', display:'grid', placeItems:'center',
        background: current ? 'var(--skin-soft)' : 'rgba(0,0,0,.04)',
        border: current ? '2px solid var(--skin)' : '2px solid rgba(0,0,0,.08)',
        boxShadow: current ? '0 0 12px var(--skin)44' : 'none' }}>
        {isCaught
          ? <Sprite id={eid} size={46}/>
          : <div style={{ filter:'brightness(0) saturate(0)', opacity:.4 }}><Sprite id={eid} size={46}/></div>}
      </div>
      <span style={{ fontSize:10, fontWeight:800,
        color: current ? 'var(--text-primary)' : 'var(--text-muted)',
        letterSpacing: isCaught ? 0 : 1 }}>{label}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--text-primary)',
    letterSpacing:'.3px', borderLeft:'3px solid var(--accent)', paddingLeft:8, marginBottom:8 }}>{children}</div>;
}

function EvoChain({ evo, currentId, caught }) {
  if (!evo || evo.length < 2) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <SectionTitle>Linea evolutiva</SectionTitle>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
        {evo.map((eid, i) => (
          <React.Fragment key={eid}>
            {i > 0 && <span style={{ color:'var(--text-muted)', fontSize:18 }}>→</span>}
            <EvoThumb eid={eid} current={eid === currentId} isCaught={!!caught[eid]}/>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── Evolve button — handles all states (variants 2-6) ── */
function EvolveButton({ id, toId, sk, data, info, stonesInv, onEvolve }) {
  const threshold = evoThreshold(data);
  const cnt = info ? info.count : 0;
  const countOk = cnt >= threshold;
  const st = sk ? PC.stoneOf(sk) : null;
  const stoneOk = !sk || (stonesInv[sk] || 0) > 0;
  const canEvo = countOk && stoneOk;
  const toData = PC.getDataSync(toId);
  const toName = toData?.name || PC.nameOf(toId);
  const fromName = data?.name || PC.nameOf(id);

  const borderColor = canEvo ? (st ? st.color : 'var(--accent)') : 'rgba(0,0,0,.12)';
  const bg = canEvo ? (st ? `${st.color}18` : 'rgba(255,107,107,.08)') : 'transparent';

  // status label below button
  let statusLabel = '';
  let statusColor = 'var(--text-muted)';
  if (!countOk) {
    statusLabel = `Servono ${threshold}× ${fromName} — ne hai ${cnt}`;
  } else if (!stoneOk && st) {
    statusLabel = `✓ ${cnt}/${threshold} — manca Pietra ${st.name}`;
    statusColor = st.color;
  } else {
    statusLabel = '✓ Pronto!';
    statusColor = st ? st.color : 'var(--accent)';
  }

  return (
    <div style={{ marginBottom:10 }}>
      <button
        onClick={canEvo ? () => onEvolve(id, toId, sk) : undefined}
        style={{ width:'100%', height:52, borderRadius:14, border:`2px solid ${borderColor}`,
          background: bg, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          fontFamily:'var(--font-display)', fontSize:15, color:'var(--text-primary)',
          opacity: canEvo ? 1 : .5, cursor: canEvo ? 'pointer' : 'not-allowed', transition:'all .2s ease' }}>
        {st ? <StoneIcon stone={sk} size={26} glow={false}/> : <Sprite id={toId} size={32}/>}
        {st ? `Usa Pietra ${st.name}` : 'Evolvi'} → {toName}
      </button>
      <div style={{ fontSize:10, fontWeight:800, textAlign:'center', marginTop:4, color: statusColor }}>
        {statusLabel}
      </div>
      {/* hint when stone is the missing piece */}
      {countOk && !stoneOk && st && (
        <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textAlign:'center', marginTop:2 }}>
          Cattura 10 Pokémon di tipo {st.name} per ottenerla
        </div>
      )}
    </div>
  );
}

/* ── Main DetailOverlay ── */
function DetailOverlay({ id, info, stonesInv, caught, onClose, onEvolve, onOpenCatch }) {
  const isCaught = !!info;
  const [data, setData] = useState(() => PC.getDataSync(id));
  const [loading, setLoading] = useState(!PC.getDataSync(id));

  useEffect(() => {
    let cancelled = false;
    if (!data) {
      setLoading(true);
      PC.fetchFullData(id).then(d => { if (!cancelled) { setData(d); setLoading(false); } });
    }
    return () => { cancelled = true; };
  }, [id]);

  /* Variant 11 — loading */
  if (loading) {
    return (
      <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
        <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
        <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'45%',
          background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
          <div className="skel" style={{ width:90, height:90, borderRadius:'50%' }}/>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>Caricamento…</div>
        </div>
      </div>
    );
  }

  const types = data?.types || ['normal'];
  const tc = PC.typeColor(types[0]);
  const name = data?.name || PC.nameOf(id);
  const flavor = data?.flavor || '';
  const evo = data?.evo || null;
  const hasBranch = !!(data?.branch);
  const evoIdx = evo ? evo.indexOf(id) : -1;
  const isFinalEvo = evo ? (evoIdx === evo.length - 1) : true;
  const isBaseForm = evoIdx === 0 || evo === null;

  // source badge for caught evolved forms
  const showSourceBadge = isCaught && evo && evo.length > 1 && !isBaseForm;
  const sourceBadge = info?.source === 'wild' ? '⚡ Selvatico' : info?.source === 'evolved' ? '◆ Evoluto' : null;

  // sheet — always 90% height
  return (
    <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'90%',
        background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
        animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* header strip — type-tinted */}
        <div style={{ background:`linear-gradient(180deg,${tc}28,transparent)`, borderTop:`4px solid var(--skin)`, paddingTop:8, flexShrink:0 }}>
          <div onClick={onClose} style={{ width:44, height:5, borderRadius:99, background:'rgba(0,0,0,.18)', margin:'2px auto 6px', cursor:'pointer' }}/>
        </div>

        <div className="scroll" style={{ flex:1, padding:'0 22px 32px' }}>

          {/* artwork */}
          <div style={{ display:'grid', placeItems:'center', position:'relative', marginTop:-4, marginBottom:4 }}>
            <div style={{ position:'absolute', top:16, width:190, height:190, borderRadius:'50%',
              background:`radial-gradient(${tc}38,transparent 68%)` }}/>
            {isCaught
              ? <Sprite id={id} shiny={info.shiny} art size={200}/>
              : <div style={{ filter:'brightness(0)', opacity:.5 }}><Sprite id={id} art size={200}/></div>}
          </div>

          {/* number + name + badges */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</div>
            <h2 className="fredoka" style={{ fontSize:30, margin:'2px 0 8px',
              letterSpacing: isCaught ? 0 : 3, color: isCaught ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {isCaught ? name : '???'}
            </h2>
            <div style={{ display:'flex', gap:6, justifyContent:'center', alignItems:'center', flexWrap:'wrap' }}>
              {isCaught && types.map(t => <TypeBadge key={t} type={t}/>)}
              {isCaught && info.count > 0 && (
                <span style={{ fontSize:12, fontWeight:800, color:'var(--accent)',
                  background:'rgba(255,107,107,.1)', padding:'4px 10px', borderRadius:99 }}>
                  ×{info.count} catturati
                </span>
              )}
              {isCaught && info.shiny && (
                <span style={{ fontSize:12, fontWeight:800, color:'#b8860b',
                  background:'rgba(255,217,61,.18)', padding:'4px 10px', borderRadius:99 }}>✨ Cromatico</span>
              )}
              {showSourceBadge && sourceBadge && (
                <span style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)',
                  background:'rgba(0,0,0,.06)', padding:'4px 10px', borderRadius:99 }}>{sourceBadge}</span>
              )}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              UNCAUGHT VARIANTS (9, 10, 12)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {!isCaught && (
            <div style={{ marginTop:4 }}>
              <div style={{ background:'rgba(255,107,107,.06)', border:'1.5px solid rgba(255,107,107,.2)',
                borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--accent)', marginBottom:12 }}>
                  Come ottenere {name}
                </div>

                {/* variant 10 — evolved form: show evolve path first */}
                {evo && evo.length > 1 && evoIdx > 0 && (() => {
                  const prevId = evo[evoIdx - 1];
                  const prevData = PC.getDataSync(prevId);
                  const thresh = evoThreshold(prevData);
                  const prevCnt = caught[prevId] ? caught[prevId].count : 0;
                  const prevName = prevData?.name || PC.nameOf(prevId);
                  return (
                    <>
                      {/* evolve path */}
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,107,107,.15)',
                          display:'grid', placeItems:'center', flexShrink:0, fontSize:13 }}>◆</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)' }}>
                            Evolvi da {prevName}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, marginTop:2 }}>
                            Cattura {thresh}× {prevName} — ne hai {prevCnt}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                            <div style={{ flex:1, height:5, borderRadius:999, background:'rgba(0,0,0,.08)', overflow:'hidden' }}>
                              <div style={{ width:`${Math.min(100,(prevCnt/thresh)*100)}%`, height:'100%',
                                borderRadius:999, background:'var(--accent)', transition:'width .4s ease' }}/>
                            </div>
                            <span style={{ fontSize:10, fontWeight:800, color:'var(--accent)' }}>{prevCnt}/{thresh}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                        <div style={{ flex:1, height:1, background:'rgba(0,0,0,.08)' }}/>
                        <span style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)' }}>OPPURE</span>
                        <div style={{ flex:1, height:1, background:'rgba(0,0,0,.08)' }}/>
                      </div>
                    </>
                  );
                })()}

                {/* wild path — always shown */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(100,120,220,.12)',
                    display:'grid', placeItems:'center', flexShrink:0, fontSize:13 }}>⚡</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'var(--text-primary)' }}>
                      Trovalo allo stato selvatico
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700 }}>
                        {PC.rarityOf(id).label}
                      </span>
                      <div style={{ display:'flex', gap:4 }}>
                        {types.map(t => <TypeBadge key={t} type={t}/>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* evo chain preview */}
              {evo && evo.length > 1 && <EvoChain evo={evo} currentId={id} caught={caught}/>}

              {/* CTA */}
              <button className="btn-primary" style={{ maxWidth:260, margin:'0 auto' }} onClick={onOpenCatch}>
                {evo && evoIdx > 0
                  ? `Vai a catturare ${(PC.getDataSync(evo[evoIdx-1])?.name || PC.nameOf(evo[evoIdx-1]))}!`
                  : 'Vai a catturare!'}
              </button>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              CAUGHT VARIANTS (1–8)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {isCaught && (
            <>
              {/* description */}
              {flavor && (
                <div style={{ marginBottom:20 }}>
                  <SectionTitle>Descrizione</SectionTitle>
                  <p style={{ fontSize:13.5, lineHeight:1.65, color:'var(--text-primary)', marginTop:4 }}>{flavor}</p>
                </div>
              )}

              {/* evo chain — variants 2-8 */}
              {evo && evo.length > 1 && <EvoChain evo={evo} currentId={id} caught={caught}/>}

              {/* ─── EVOLVE SECTION ─── */}

              {/* variants 2-5: linear evolution */}
              {!hasBranch && evo && !isFinalEvo && (
                <div style={{ marginBottom:4 }}>
                  <SectionTitle>Evolvi</SectionTitle>
                  <div style={{ marginTop:8 }}>
                    <EvolveButton
                      id={id} toId={evo[evoIdx+1]} sk={data?.stone || null}
                      data={data} info={info} stonesInv={stonesInv} onEvolve={onEvolve}
                    />
                  </div>
                </div>
              )}

              {/* variant 6: branch (Eevee-style) */}
              {hasBranch && (
                <div style={{ marginBottom:4 }}>
                  <SectionTitle>Evolvi</SectionTitle>
                  <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:0 }}>
                    {data.branch.map(([toId, sk]) => (
                      <EvolveButton
                        key={`${toId}-${sk}`}
                        id={id} toId={toId} sk={sk}
                        data={data} info={info} stonesInv={stonesInv} onEvolve={onEvolve}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* variants 1, 8: final / no evolution — nothing to show */}
            </>
          )}
        </div>
      </div>
    </div>
  );
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
