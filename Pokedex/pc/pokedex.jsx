/* ===== Pokédex View ===== */
function PokedexView({ trainer, caught, region, onSetRegion, skin, onSetSkin, onOpenDetail }) {
  const [sort, setSort] = useState('num');
  const [view, setView] = useState('grid');

  const reg = PC.REGIONS.find(r => r.key === region) || PC.REGIONS.find(r => r.key === 'kanto');
  const [lo, hi] = reg.key === 'all' ? [1, 1025] : reg.range;

  let ids = [];
  for (let i = lo; i <= Math.min(hi, lo + 400); i++) ids.push(i);
  if (sort === 'az') ids = [...ids].sort((a, b) => PC.nameOf(a).localeCompare(PC.nameOf(b)));
  if (sort === 'za') ids = [...ids].sort((a, b) => PC.nameOf(b).localeCompare(PC.nameOf(a)));

  const total = Math.min(hi, lo + 400) - lo + 1;
  const caughtInRegion = ids.filter(id => caught[id]).length;

  return (
    <div className="screen" style={{ background:'var(--bg-pokedex)', color:'var(--text-primary)' }}>
      {/* skin frame */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:6,
        border:'var(--frame-border)', borderRadius:'var(--frame-radius)', boxShadow:'var(--frame-glow)' }}/>

      {/* Header */}
      <header style={{ padding:'48px 20px 12px', background:'#fff',
        borderBottom:'3px solid var(--skin)', position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--skin)',
            boxShadow:'inset 0 0 0 3px #fff, inset 0 0 0 5px var(--skin)' }}/>
          <h1 className="fredoka" style={{ fontSize:24, margin:0, flex:1, color:'var(--text-primary)' }}>Pokédex</h1>
          <div style={{ display:'flex', gap:6 }}>
            {PC.SKINS.map(sk => (
              <button key={sk.key} onClick={() => onSetSkin(sk.key)} title={sk.name}
                style={{ width:22, height:22, borderRadius:6, background:sk.accent,
                  border: skin===sk.key?'2px solid #2d2d2d':'2px solid transparent',
                  boxShadow: skin===sk.key?'0 0 0 2px #fff inset':'none',
                  transform: skin===sk.key?'scale(1.1)':'none', transition:'all .15s ease' }}/>
            ))}
          </div>
        </div>
        <div style={{ marginTop:10, fontSize:12, fontWeight:800, color:'var(--text-muted)' }}>
          {caughtInRegion} Pokémon — {reg.name}
        </div>
      </header>

      {/* Region pills */}
      <div className="scroll" style={{ display:'flex', gap:8, padding:'10px 20px 4px',
        overflowX:'auto', flexShrink:0, position:'relative', zIndex:2 }}>
        {PC.REGIONS.map(r => (
          <button key={r.key} className={'pill'+(region===r.key?' active':'')}
            onClick={() => onSetRegion(r.key)}>{r.name}</button>
        ))}
      </div>

      {/* Sort + view toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 20px 10px', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.05)', borderRadius:99, padding:3 }}>
          {[['num','#'],['az','A→Z'],['za','Z→A']].map(([k,l]) => (
            <button key={k} onClick={() => setSort(k)} style={{ height:30, padding:'0 14px', borderRadius:99,
              fontSize:12.5, fontWeight:800, color: sort===k?'#fff':'var(--text-muted)',
              background: sort===k?'var(--skin)':'transparent', transition:'all .15s ease' }}>{l}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.05)', borderRadius:99, padding:3 }}>
          {[['grid','▦'],['list','≡']].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)} style={{ width:34, height:30, borderRadius:99,
              fontSize:16, color: view===k?'#fff':'var(--text-muted)',
              background: view===k?'var(--skin)':'transparent', transition:'all .15s ease' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Grid / list */}
      <div className="scroll" style={{ flex:1, padding:'4px 16px 32px', position:'relative', zIndex:1 }}>
        {view === 'grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {ids.map(id => <GridCard key={id} id={id} info={caught[id]} onOpen={onOpenDetail}/>)}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ids.map(id => <ListRow key={id} id={id} info={caught[id]} onOpen={onOpenDetail}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({ id, info, onOpen }) {
  const isCaught = !!info;
  const data = PC.getDataSync(id);
  const name = data?.name || PC.nameOf(id);
  return (
    <button onClick={() => onOpen(id)}
      style={{ background:'var(--card-light)', borderRadius:12, padding:'8px 4px 7px',
        boxShadow:'var(--card-shadow)', display:'flex', flexDirection:'column', alignItems:'center', gap:1,
        position:'relative', minHeight:100, transition:'transform .12s ease' }}
      onMouseDown={e => e.currentTarget.style.transform='scale(.95)'}
      onMouseUp={e => e.currentTarget.style.transform='none'}
      onMouseLeave={e => e.currentTarget.style.transform='none'}>
      <span style={{ position:'absolute', top:5, left:7, fontSize:9.5, fontWeight:800, color:'var(--text-muted)' }}>
        #{String(id).padStart(3,'0')}
      </span>
      {isCaught
        ? <Sprite id={id} size={58}/>
        : <Sprite id={id} silhouette size={58}/>}
      <span className="fredoka" style={{ fontSize:11,
        color: isCaught ? 'var(--text-primary)' : 'var(--text-muted)',
        maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'0 2px',
        letterSpacing: isCaught ? 0 : 1 }}>
        {isCaught ? name : '???'}
      </span>
    </button>
  );
}

function ListRow({ id, info, onOpen }) {
  const isCaught = !!info;
  const data = PC.getDataSync(id);
  const name = data?.name || PC.nameOf(id);
  return (
    <button onClick={() => onOpen(id)}
      style={{ background:'var(--card-light)', borderRadius:12, padding:'8px 14px',
        boxShadow:'var(--card-shadow)', display:'flex', alignItems:'center', gap:12,
        textAlign:'left', width:'100%' }}>
      {isCaught ? <Sprite id={id} size={46}/> : <Sprite id={id} silhouette size={46}/>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</span>
          <span className="fredoka" style={{ fontSize:15, color: isCaught?'var(--text-primary)':'var(--text-muted)',
            letterSpacing: isCaught ? 0 : 1 }}>{isCaught ? name : '???'}</span>
        </div>
        {isCaught && data && (
          <div style={{ display:'flex', gap:5, marginTop:4 }}>
            {data.types.map(t => <TypeBadge key={t} type={t}/>)}
          </div>
        )}
      </div>
      <span style={{ color:'var(--text-muted)', fontSize:18 }}>›</span>
    </button>
  );
}

Object.assign(window, { PokedexView, GridCard, ListRow });
