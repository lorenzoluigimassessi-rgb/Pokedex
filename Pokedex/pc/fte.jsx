/* ===== First-Time Experience — 5-step paginated flow ===== */
function FTE({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [skin, setSkin] = useState(null);
  const [opening, setOpening] = useState(false);

  const next = () => setStep(s => s + 1);

  function finish() {
    setOpening(true);
    setTimeout(() => onComplete({ name: name.trim() || 'Trainer', avatar, skin }), 1700);
  }

  const dots = (
    <div style={{ display:'flex', gap:7, justifyContent:'center', marginTop:'auto', paddingBottom:6 }}>
      {[0,1,2,3].map(i => (
        <span key={i} style={{ width: i===Math.min(step,3)?22:7, height:7, borderRadius:99,
          background: i<=step?'var(--accent)':'rgba(255,255,255,.18)', transition:'all .3s ease' }}/>
      ))}
    </div>
  );

  return (
    <div className="screen" style={{ background:'radial-gradient(120% 80% at 50% 0%, #2a2350 0%, #16213e 55%, #0f1428 100%)', color:'var(--text-light)' }}>
      {/* ambient stars */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {Array.from({length:26}).map((_,i)=>(
          <span key={i} style={{ position:'absolute', width:2, height:2, borderRadius:99, background:'#fff',
            left:`${(i*37)%100}%`, top:`${(i*53)%92}%`, opacity:.18+((i%4)*.12),
            animation:`sparkle ${2+(i%3)}s ease ${i*.2}s infinite` }}/>
        ))}
      </div>

      {/* STEP 0 — Splash */}
      {step===0 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', position:'relative', zIndex:1 }}>
          <div style={{ animation:'float-y 3.5s ease infinite' }}>
            <div style={{ animation:'spin 8s linear infinite' }}>
              <BallIcon type="poke" size={132}/>
            </div>
          </div>
          <h1 className="fredoka" style={{ fontSize:52, margin:'34px 0 6px', letterSpacing:'.5px',
            background:'linear-gradient(180deg,#fff,#ffd93d)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PokéCatch</h1>
          <p style={{ fontSize:15, color:'rgba(240,240,240,.7)', margin:'0 0 46px', fontWeight:600 }}>Catch them. Collect them. All yours.</p>
          <button className="btn-primary" onClick={next}>Get Started</button>
        </div>
      )}

      {/* STEP 1 — Name */}
      {step===1 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'76px 32px 24px', position:'relative', zIndex:1 }}>
          <h2 className="fredoka" style={{ fontSize:30, lineHeight:1.15, margin:'0 0 10px' }}>What's your name,<br/>Trainer?</h2>
          <p style={{ fontSize:14, color:'rgba(240,240,240,.6)', margin:'0 0 34px', fontWeight:600 }}>We'll put it on your Pokédex.</p>
          <input value={name} onChange={e=>setName(e.target.value.slice(0,14))} autoFocus placeholder="Type your name"
            onKeyDown={e=>e.key==='Enter'&&name.trim()&&next()}
            style={{ height:60, borderRadius:16, border:'2px solid rgba(255,255,255,.16)', background:'rgba(255,255,255,.06)',
              color:'#fff', fontSize:22, fontFamily:'var(--font-display)', padding:'0 20px', outline:'none', textAlign:'center' }}/>
          <div style={{ flex:1 }}/>
          <button className="btn-primary" onClick={next} disabled={!name.trim()}>Continue</button>
          {dots}
        </div>
      )}

      {/* STEP 2 — Avatar */}
      {step===2 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'64px 28px 24px', position:'relative', zIndex:1 }}>
          <h2 className="fredoka" style={{ fontSize:30, margin:'0 0 6px' }}>Choose your look</h2>
          <p style={{ fontSize:14, color:'rgba(240,240,240,.6)', margin:'0 0 26px', fontWeight:600 }}>Pick your trainer.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {PC.AVATARS.map(a => (
              <button key={a.key} onClick={()=>setAvatar(a.key)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  padding:'10px 0', borderRadius:16, transition:'transform .15s ease, background .15s ease',
                  background: avatar===a.key?'rgba(255,107,107,.16)':'transparent',
                  transform: avatar===a.key?'scale(1.04)':'none' }}>
                <Avatar data={a} size={62} ring={avatar===a.key}/>
                <span style={{ fontSize:11, fontWeight:700, color: avatar===a.key?'var(--accent)':'rgba(240,240,240,.7)' }}>{a.name}</span>
              </button>
            ))}
          </div>
          <div style={{ flex:1 }}/>
          <button className="btn-primary" onClick={next} disabled={!avatar}>Continue</button>
          {dots}
        </div>
      )}

      {/* STEP 3 — Skin */}
      {step===3 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'56px 28px 24px', position:'relative', zIndex:1 }}>
          <h2 className="fredoka" style={{ fontSize:30, margin:'0 0 6px' }}>Choose your Pokédex</h2>
          <p style={{ fontSize:14, color:'rgba(240,240,240,.6)', margin:'0 0 22px', fontWeight:600 }}>You can change this later.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {PC.SKINS.map(sk => (
              <button key={sk.key} onClick={()=>setSkin(sk.key)}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', textAlign:'left',
                  borderRadius:16, background:'rgba(255,255,255,.05)',
                  border: skin===sk.key?`2px solid ${sk.accent}`:'2px solid rgba(255,255,255,.1)',
                  boxShadow: skin===sk.key?`0 0 22px ${sk.accent}55`:'none', transition:'all .18s ease' }}>
                <SkinSwatch skin={sk}/>
                <div>
                  <div className="fredoka" style={{ fontSize:18 }}>{sk.name}</div>
                  <div style={{ fontSize:12.5, color:'rgba(240,240,240,.55)', fontWeight:600 }}>{sk.sub}</div>
                </div>
                {skin===sk.key && <div style={{ marginLeft:'auto', color:sk.accent, fontSize:22 }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ flex:1 }}/>
          <button className="btn-primary" onClick={finish} disabled={!skin}>Open my Pokédex</button>
          {dots}
        </div>
      )}

      {/* STEP 4 — Opening animation */}
      {opening && (
        <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', zIndex:5,
          background:'radial-gradient(circle at 50% 45%, #2a2350, #0f1428)', animation:'fade-in .3s ease' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ width:150, height:150, margin:'0 auto', position:'relative' }}>
              <div style={{ position:'absolute', inset:0, animation:'spin .7s ease' }}>
                <BallIcon type="poke" size={150}/>
              </div>
              <div style={{ position:'absolute', inset:'-30px', borderRadius:'50%',
                boxShadow:'0 0 0 0 rgba(255,217,61,.6)', animation:'ring-burst 1.5s ease forwards' }}/>
            </div>
            <p className="fredoka" style={{ fontSize:24, marginTop:30, color:'var(--gold)' }}>Welcome, {name||'Trainer'}!</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* Mini pokedex device preview for skin cards */
function SkinSwatch({ skin }) {
  const styleByKey = {
    classic: { border:`5px solid ${skin.accent}`, borderRadius:12 },
    modern:  { border:`1.5px solid ${skin.accent}`, borderRadius:3, boxShadow:`0 0 10px ${skin.accent}` },
    retro:   { border:`4px solid ${skin.accent}`, borderRadius:0, boxShadow:`3px 3px 0 #166534` },
  };
  return (
    <div style={{ width:48, height:54, background:'#11131f', flexShrink:0,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', paddingTop:5, gap:4, ...styleByKey[skin.key] }}>
      <div style={{ display:'flex', gap:3 }}>
        <span style={{ width:8, height:8, borderRadius:99, background:skin.accent }}/>
        <span style={{ width:4, height:4, borderRadius:99, background:'#f5d23b' }}/>
        <span style={{ width:4, height:4, borderRadius:99, background:'#5fbf4f' }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginTop:2 }}>
        {Array.from({length:6}).map((_,i)=><span key={i} style={{ width:7, height:7, borderRadius:2, background:'rgba(255,255,255,.18)' }}/>)}
      </div>
    </div>
  );
}

Object.assign(window, { FTE });
