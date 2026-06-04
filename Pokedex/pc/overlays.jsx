/* ===== Overlays — Detail sheet, Stone modal, Evolution toast ===== */

function DetailOverlay({ id, info, stonesInv, onClose, onEvolve }) {
  const caught = !!info;
  const feat = PC.FEATURE[id];
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!feat && caught) {
      setLoading(true);
      PC.fetchDetail(id).then(d => { setRemote(d); setLoading(false); });
    }
  }, [id]);

  const data = feat || remote;
  const types = data ? data.types : ['normal'];
  const mainType = types[0];
  const tc = PC.typeColor(mainType);
  const name = PC.nameOf(id);

  // evolution stone options available to the player
  const stoneOpts = [];
  if (caught && feat) {
    if (feat.branch) {
      feat.branch.forEach(([toId, sk]) => { if ((stonesInv[sk]||0) > 0) stoneOpts.push({ toId, sk }); });
    } else if (feat.stone && feat.evo && feat.evo.length > 1) {
      const idx = feat.evo.indexOf(id);
      if (idx > -1 && idx < feat.evo.length - 1 && (stonesInv[feat.stone]||0) > 0) {
        stoneOpts.push({ toId: feat.evo[idx+1], sk: feat.stone });
      }
    }
  }

  return (
    <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'90%',
        background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
        animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* header strip (skin-accented + type tint) */}
        <div style={{ background:`linear-gradient(180deg, ${tc}30, transparent)`, borderTop:'4px solid var(--skin)', paddingTop:8, flexShrink:0 }}>
          <div onClick={onClose} style={{ width:44, height:5, borderRadius:99, background:'rgba(0,0,0,.18)', margin:'2px auto 6px', cursor:'pointer' }}/>
        </div>

        <div className="scroll" style={{ flex:1, padding:'0 22px 28px' }}>
          {/* artwork */}
          <div style={{ display:'grid', placeItems:'center', position:'relative', marginTop:-4 }}>
            <div style={{ position:'absolute', top:20, width:200, height:200, borderRadius:'50%',
              background:`radial-gradient(${tc}40, transparent 68%)` }}/>
            {caught
              ? <Sprite id={id} shiny={info.shiny} art size={210}/>
              : <div style={{ filter:'brightness(0)', opacity:.7 }}><Sprite id={id} art size={210}/></div>}
          </div>

          {/* name / number / badges */}
          <div style={{ textAlign:'center', marginTop:-6 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</div>
            <h2 className="fredoka" style={{ fontSize:30, margin:'2px 0 10px' }}>{caught ? name : '???'}</h2>
            <div style={{ display:'flex', gap:8, justifyContent:'center', alignItems:'center', flexWrap:'wrap' }}>
              {caught && types.map(t => <TypeBadge key={t} type={t}/>)}
              {caught && info.count > 1 && <span style={{ fontSize:13, fontWeight:800, color:'var(--accent)', whiteSpace:'nowrap',
                background:'rgba(255,107,107,.12)', padding:'5px 12px', borderRadius:99 }}>×{info.count} caught</span>}
              {caught && info.shiny && <span style={{ fontSize:13, fontWeight:800, color:'#b8860b', whiteSpace:'nowrap',
                background:'rgba(255,217,61,.22)', padding:'5px 12px', borderRadius:99 }}>✨ Shiny</span>}
            </div>
          </div>

          {!caught ? (
            <div style={{ textAlign:'center', marginTop:34 }}>
              <p style={{ color:'var(--text-muted)', fontWeight:700, fontSize:15, marginBottom:24 }}>You haven't caught this one yet.</p>
              <button className="btn-primary" style={{ maxWidth:240, margin:'0 auto' }} onClick={onClose}>Go catch it!</button>
            </div>
          ) : (
            <>
              {/* stats */}
              <div style={{ marginTop:24 }}>
                <SectionTitle>Base Stats</SectionTitle>
                {loading && <div style={{ color:'var(--text-muted)', fontSize:13, fontWeight:700 }}>Loading stats…</div>}
                {data && (
                  <div style={{ marginTop:8 }}>
                    {[['HP','hp'],['Attack','atk'],['Defense','def'],['Sp. Atk','spa'],['Sp. Def','spd'],['Speed','spe']].map(([l,k])=>(
                      <StatBar key={k} label={l} value={data.stats[k]} color={tc}/>
                    ))}
                  </div>
                )}
              </div>

              {/* evolution chain */}
              {feat && feat.evo && feat.evo.length > 1 && (
                <div style={{ marginTop:22 }}>
                  <SectionTitle>Evolution</SectionTitle>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
                    {feat.evo.map((eid, i) => (
                      <React.Fragment key={eid}>
                        {i>0 && <span style={{ color:'var(--text-muted)', fontSize:18 }}>→</span>}
                        <EvoThumb eid={eid} current={eid===id} caught={!!info && (eid===id)} caughtInfo={undefined} allCaught={undefined}/>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* stone button(s) */}
              {stoneOpts.length > 0 && (
                <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10 }}>
                  {stoneOpts.map(({toId, sk}) => {
                    const st = PC.stoneOf(sk);
                    return (
                      <button key={sk} onClick={()=>onEvolve(id, toId, sk)}
                        style={{ height:52, borderRadius:14, border:`2px solid ${st.color}`,
                          background:`${st.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                          fontFamily:'var(--font-display)', fontSize:16, color:'var(--text-primary)' }}>
                        <StoneIcon stone={sk} size={28} glow={false}/>
                        Use {st.name} Stone → {PC.nameOf(toId)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* flavor */}
              {feat && feat.flavor && (
                <p style={{ marginTop:22, fontStyle:'italic', color:'var(--text-muted)', fontSize:14.5,
                  lineHeight:1.55, textAlign:'center', textWrap:'pretty' }}>"{feat.flavor}"</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EvoThumb({ eid, current }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <div style={{ width:62, height:62, borderRadius:'50%', display:'grid', placeItems:'center',
        background: current?'var(--skin-soft)':'rgba(0,0,0,.04)',
        border: current?'2px solid var(--skin)':'2px solid transparent' }}>
        <Sprite id={eid} size={48}/>
      </div>
      <span style={{ fontSize:10, fontWeight:800, color: current?'var(--text-primary)':'var(--text-muted)' }}>{PC.nameOf(eid)}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--text-primary)',
    letterSpacing:'.3px', borderLeft:'3px solid var(--accent)', paddingLeft:8 }}>{children}</div>;
}

/* ----- Stone selection modal ----- */
function StoneModal({ onChoose }) {
  const [picked, setPicked] = useState(null);
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40, display:'grid', placeItems:'center',
      background:'rgba(8,6,18,.78)', backdropFilter:'blur(4px)', animation:'fade-in .25s ease' }}>
      <div style={{ width:'88%', background:'var(--bg-pokedex-dark)', borderRadius:22, padding:'26px 20px 22px',
        boxShadow:'0 20px 60px rgba(0,0,0,.6)', color:'var(--text-light)', animation:'pop-in .35s ease' }}>
        <div style={{ textAlign:'center', marginBottom:4 }}>
          <span style={{ fontSize:12, fontWeight:800, color:'var(--gold)', letterSpacing:'1px' }}>★ REWARD ★</span>
        </div>
        <h2 className="fredoka" style={{ fontSize:23, textAlign:'center', margin:'2px 0 4px' }}>You earned a stone!</h2>
        <p style={{ textAlign:'center', fontSize:13.5, color:'rgba(240,240,240,.6)', fontWeight:600, margin:'0 0 18px' }}>Choose one to keep.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          {PC.STONES.map(st => (
            <button key={st.key} onClick={()=>setPicked(st.key)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 2px', borderRadius:12,
                background: picked===st.key?'rgba(255,255,255,.12)':'transparent',
                border: picked===st.key?`2px solid ${st.color}`:'2px solid transparent',
                transform: picked===st.key?'scale(1.06)':'none', transition:'all .15s ease' }}>
              <StoneIcon stone={st} size={46}/>
              <span style={{ fontSize:9.5, fontWeight:800, color:'rgba(240,240,240,.75)' }}>{st.name}</span>
            </button>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop:20 }} disabled={!picked} onClick={()=>onChoose(picked)}>
          Take the {picked ? PC.stoneOf(picked).name : ''} Stone
        </button>
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
        <div style={{ fontSize:11, fontWeight:800, color:'var(--gold)', letterSpacing:'.5px' }}>EVOLVED!</div>
        <div className="fredoka" style={{ fontSize:15 }}>{PC.nameOf(from)} → {PC.nameOf(to)}</div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailOverlay, StoneModal, EvoToast, SectionTitle, EvoThumb });
