/* ===== Pokédex View — grid / list, controls, skin frame, FAB ===== */
function PokedexView({ trainer, caught, canEvolve, stats, skin, onSetSkin, onOpenCatch, onOpenDetail }) {
  const [region, setRegion] = useState('kanto');
  const [sort, setSort] = useState('num'); // num | az | za
  const [view, setView] = useState('grid'); // grid | list

  const reg = PC.REGIONS.find(r => r.key === region);

  let ids = [];
  if (region === 'all') {
    const set = new Set();
    for (let i = 1; i <= 151; i++) set.add(i);
    Object.keys(caught).forEach(k => set.add(Number(k)));
    ids = [...set].sort((a, b) => a - b);
  } else {
    const [a, b] = reg.range;
    const end = Math.min(b, a + 250);
    for (let i = a; i <= end; i++) ids.push(i);
  }
  if (sort === 'az') ids = [...ids].sort((a, b) => PC.nameOf(a).localeCompare(PC.nameOf(b)));
  if (sort === 'za') ids = [...ids].sort((a, b) => PC.nameOf(b).localeCompare(PC.nameOf(a)));

  const caughtCount = Object.keys(caught).length;

  return (
    <div className="screen" style={{ background:'var(--bg-pokedex)', color:'var(--text-primary)' }}>
      {/* skin frame */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:6,
        border:'var(--frame-border)', borderRadius:'var(--frame-radius)', boxShadow:'var(--frame-glow)',
        margin:0 }}/>

      {/* Header (skin-accented) */}
      <header style={{ padding:'48px 20px 12px', background:'#fff',
        borderBottom:'3px solid var(--skin)', position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--skin)',
            boxShadow:'inset 0 0 0 3px #fff, inset 0 0 0 5px var(--skin)' }}/>
          <h1 className="fredoka" style={{ fontSize:24, margin:0, flex:1, color:'var(--text-primary)' }}>Pokédex</h1>
          {/* skin switcher */}
          <div style={{ display:'flex', gap:6 }}>
            {PC.SKINS.map(sk => (
              <button key={sk.key} onClick={()=>onSetSkin(sk.key)} title={sk.name}
                style={{ width:22, height:22, borderRadius:6, background:sk.accent,
                  border: skin===sk.key?'2px solid #2d2d2d':'2px solid transparent',
                  boxShadow: skin===sk.key?'0 0 0 2px #fff inset':'none', transform: skin===sk.key?'scale(1.1)':'none', transition:'all .15s ease' }}/>
            ))}
          </div>
        </div>
        <div style={{ marginTop:12 }}>
          <ProgressBar value={caughtCount} total={Object.keys(PC.FEATURE).length}/>
        </div>
      </header>

      {/* Region pills */}
      <div className="scroll" style={{ display:'flex', gap:8, padding:'12px 20px 4px', overflowX:'auto', flexShrink:0, position:'relative', zIndex:2 }}>
        {PC.REGIONS.map(r => (
          <button key={r.key} className={'pill'+(region===r.key?' active':'')} onClick={()=>setRegion(r.key)}>{r.name}</button>
        ))}
      </div>

      {/* Sort + view toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px 10px', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.05)', borderRadius:99, padding:3 }}>
          {[['num','#'],['az','A→Z'],['za','Z→A']].map(([k,l])=>(
            <button key={k} onClick={()=>setSort(k)} style={{ height:30, padding:'0 14px', borderRadius:99,
              fontSize:12.5, fontWeight:800, color: sort===k?'#fff':'var(--text-muted)',
              background: sort===k?'var(--skin)':'transparent', transition:'all .15s ease' }}>{l}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.05)', borderRadius:99, padding:3 }}>
          {[['grid','▦'],['list','≡']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{ width:34, height:30, borderRadius:99,
              fontSize:16, color: view===k?'#fff':'var(--text-muted)',
              background: view===k?'var(--skin)':'transparent', transition:'all .15s ease' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Grid / list */}
      <div className="scroll" style={{ flex:1, padding:'4px 16px 120px', position:'relative', zIndex:1 }}>
        {view === 'grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {ids.map(id => <GridCard key={id} id={id} info={caught[id]} ready={canEvolve(id)} onOpen={onOpenDetail}/>)}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ids.map(id => <ListRow key={id} id={id} info={caught[id]} ready={canEvolve(id)} onOpen={onOpenDetail}/>)}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={onOpenCatch} style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
        height:56, padding:'0 30px', borderRadius:99, zIndex:7,
        background:'var(--accent)', color:'#fff', fontFamily:'var(--font-display)', fontSize:18, letterSpacing:'.5px',
        boxShadow:'0 10px 26px rgba(255,107,107,.5)', display:'flex', alignItems:'center', gap:10 }}>
        <BallIcon type="poke" size={26}/> CATTURA!
      </button>
    </div>
  );
}

function GridCard({ id, info, ready, onOpen }) {
  const caught = !!info;
  return (
    <button onClick={()=> onOpen(id)} style={{ background:'var(--card-light)', borderRadius:12, padding:'8px 4px 7px',
      boxShadow:'var(--card-shadow)', display:'flex', flexDirection:'column', alignItems:'center', gap:1,
      position:'relative', minHeight:100, transition:'transform .12s ease' }}
      onMouseDown={e=>e.currentTarget.style.transform='scale(.95)'}
      onMouseUp={e=>e.currentTarget.style.transform='none'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
      <span style={{ position:'absolute', top:5, left:7, fontSize:9.5, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</span>
      {caught && info.shiny && <span style={{ position:'absolute', top:4, right:6, fontSize:12 }}>✨</span>}
      {/* ready-to-evolve dot */}
      {ready && <div style={{ position:'absolute', top:4, right: info && info.shiny ? 22 : 6,
        width:9, height:9, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e' }}/>}
      {caught
        ? <Sprite id={id} shiny={info.shiny} size={58}/>
        : <Sprite id={id} silhouette size={58}/>}
      {caught
        ? <span className="fredoka" style={{ fontSize:11, color:'var(--text-primary)',
            maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'0 2px' }}>{PC.nameOf(id)}</span>
        : <span className="fredoka" style={{ fontSize:12, color:'var(--text-muted)', letterSpacing:'2px' }}>???</span>}
      {caught && info.count > 1 && <span style={{ fontSize:9.5, fontWeight:800, color:'var(--accent)' }}>×{info.count}</span>}
    </button>
  );
}

function ListRow({ id, info, ready, onOpen }) {
  const caught = !!info;
  const feat = PC.FEATURE[id];
  return (
    <button onClick={()=> onOpen(id)} style={{ background:'var(--card-light)', borderRadius:12, padding:'8px 14px',
      boxShadow:'var(--card-shadow)', display:'flex', alignItems:'center', gap:12, textAlign:'left', width:'100%' }}>
      {caught ? <Sprite id={id} shiny={info.shiny} size={46}/> : <Sprite id={id} silhouette size={46}/>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</span>
          <span className="fredoka" style={{ fontSize:15, color: caught?'var(--text-primary)':'var(--text-muted)' }}>{caught?PC.nameOf(id):'???'}</span>
          {caught && info.shiny && <span style={{ fontSize:13 }}>✨</span>}
          {ready && <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 5px #22c55e' }}/>}
        </div>
        {caught && feat && <div style={{ display:'flex', gap:5, marginTop:4 }}>{feat.types.map(t=><TypeBadge key={t} type={t}/>)}</div>}
      </div>
      {caught && info.count > 1 && <span style={{ fontSize:13, fontWeight:800, color:'var(--accent)' }}>×{info.count}</span>}
      <span style={{ color:'var(--text-muted)', fontSize:18 }}>›</span>
    </button>
  );
}

Object.assign(window, { PokedexView, GridCard, ListRow });
