/* ===== Overlays — Detail sheet only ===== */

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--text-primary)',
      letterSpacing:'.3px', borderLeft:'3px solid var(--accent)', paddingLeft:8, marginBottom:8 }}>
      {children}
    </div>
  );
}

function DetailOverlay({ id, info, onClose }) {
  const [data, setData] = useState(() => PC.getDataSync(id));
  const [loading, setLoading] = useState(!PC.getDataSync(id));
  const [shiny, setShiny] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!data) {
      setLoading(true);
      PC.fetchFullData(id).then(d => {
        if (!cancelled) { setData(d); setLoading(false); }
      });
    }
    return () => { cancelled = true; };
  }, [id]);

  // reset shiny when opening a different Pokémon
  useEffect(() => { setShiny(false); }, [id]);

  const types = data?.types || ['normal'];
  const tc = PC.typeColor(types[0]);
  const name = data?.name || PC.nameOf(id);
  const flavor = data?.flavor || '';
  const height = data?.height ? `${(data.height / 10).toFixed(1)} m` : '—';
  const weight = data?.weight ? `${(data.weight / 10).toFixed(1)} kg` : '—';
  const moves = data?.moves || [];

  const TYPE_EMOJI = {
    fire:'🔥', water:'💧', grass:'🌿', electric:'⚡', ice:'❄️',
    fighting:'🥊', poison:'☠️', ground:'🌍', flying:'🌬️', psychic:'🔮',
    bug:'🐛', rock:'🪨', ghost:'👻', dragon:'🐉', dark:'🌑',
    steel:'⚙️', fairy:'✨', normal:'⭐',
  };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:30, animation:'fade-in .2s ease' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0,
        background:'rgba(10,8,20,.5)', backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'92%',
        background:'var(--bg-pokedex)', borderTopLeftRadius:26, borderTopRightRadius:26,
        animation:'sheet-up .32s ease', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* header strip */}
        <div style={{ background:`linear-gradient(180deg,${tc}28,transparent)`,
          borderTop:`4px solid var(--skin)`, paddingTop:8, flexShrink:0 }}>
          <div onClick={onClose} style={{ width:44, height:5, borderRadius:99,
            background:'rgba(0,0,0,.18)', margin:'2px auto 6px', cursor:'pointer' }}/>
        </div>

        {/* loading */}
        {loading ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', gap:14 }}>
            <div className="skel" style={{ width:120, height:120, borderRadius:'50%' }}/>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>Caricamento…</div>
          </div>
        ) : (
          <div className="scroll" style={{ flex:1, padding:'0 22px 32px' }}>

            {/* artwork + shiny toggle */}
            <div style={{ display:'grid', placeItems:'center', position:'relative', paddingTop:8, marginBottom:4 }}>
              <div style={{ position:'absolute', top:16, width:190, height:190, borderRadius:'50%',
                background:`radial-gradient(${tc}38,transparent 68%)` }}/>
              <Sprite id={id} shiny={shiny} art size={200}/>
              {/* shiny toggle */}
              <button onClick={() => setShiny(s => !s)}
                style={{ position:'absolute', top:8, right:0,
                  background: shiny ? 'rgba(255,217,61,.25)' : 'rgba(0,0,0,.06)',
                  border: shiny ? '1.5px solid var(--gold)' : '1.5px solid rgba(0,0,0,.1)',
                  borderRadius:999, padding:'5px 12px', fontSize:12, fontWeight:800,
                  color: shiny ? 'var(--gold)' : 'var(--text-muted)',
                  cursor:'pointer', transition:'all .2s ease', display:'flex', alignItems:'center', gap:5 }}>
                ✨ {shiny ? 'Cromatico' : 'Shiny'}
              </button>
            </div>

            {/* number + name + types */}
            <div style={{ textAlign:'center', marginBottom:18 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)' }}>
                #{String(id).padStart(3,'0')}
              </div>
              <h2 className="fredoka" style={{ fontSize:30, margin:'2px 0 8px', color:'var(--text-primary)' }}>
                {name}
              </h2>
              <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap' }}>
                {types.map(t => <TypeBadge key={t} type={t}/>)}
              </div>
            </div>

            {/* description */}
            {flavor && (
              <div style={{ marginBottom:20 }}>
                <SectionTitle>Descrizione</SectionTitle>
                <p style={{ fontSize:13.5, lineHeight:1.65, color:'var(--text-primary)', marginTop:4 }}>
                  {flavor}
                </p>
              </div>
            )}

            {/* height + weight */}
            <div style={{ marginBottom:20 }}>
              <SectionTitle>Dati</SectionTitle>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <div style={{ flex:1, background:'rgba(0,0,0,.04)', borderRadius:12,
                  padding:'10px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)',
                    letterSpacing:'.5px', marginBottom:4 }}>ALTEZZA</div>
                  <div className="fredoka" style={{ fontSize:20, color:'var(--text-primary)' }}>{height}</div>
                </div>
                <div style={{ flex:1, background:'rgba(0,0,0,.04)', borderRadius:12,
                  padding:'10px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)',
                    letterSpacing:'.5px', marginBottom:4 }}>PESO</div>
                  <div className="fredoka" style={{ fontSize:20, color:'var(--text-primary)' }}>{weight}</div>
                </div>
              </div>
            </div>

            {/* moves */}
            {moves.length > 0 && (
              <div style={{ marginBottom:8 }}>
                <SectionTitle>Mosse principali</SectionTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
                  {moves.map(move => (
                    <div key={move} style={{ display:'flex', alignItems:'center', gap:10,
                      background:'rgba(0,0,0,.04)', borderRadius:10, padding:'9px 14px' }}>
                      <span style={{ fontSize:16 }}>{TYPE_EMOJI[types[0]] || '⭐'}</span>
                      <span style={{ fontSize:13.5, fontWeight:800, color:'var(--text-primary)' }}>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DetailOverlay, SectionTitle });
