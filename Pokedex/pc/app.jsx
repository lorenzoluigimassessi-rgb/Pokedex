/* ===== PokéCatch — root app ===== */
const KEY = 'pokecatch_v2';

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch(e){}
  return null;
}
function seedCaught() {
  const SKIP = new Set([3,6,9,26,38,45,59,94,130,131,134,135,136,143,149,150,151]);
  const caught = {};
  for (let i = 1; i <= 151; i++) {
    if (SKIP.has(i)) continue;
    caught[i] = { count: 1 + ((i * 7) % 4), shiny: (i === 25 || i === 129) };
  }
  for (let i = 152; i <= 178; i++) { if ((i * 5) % 7 < 4) caught[i] = { count: 1, shiny: false }; }
  return caught;
}

function makeEncounter(n) {
  const pool = PC.ENCOUNTER_POOL;
  const id = pool[Math.floor(Math.random() * pool.length)];
  const feat = PC.FEATURE[id];
  const shiny = Math.random() < 1/11;
  const tier = PC.FEAT_RARITY[id] || 2;
  const ball = tier >= 6 ? 'master' : tier >= 4 ? 'ultra' : tier >= 3 ? 'great' : 'poke';
  return { id, shiny, ball, types: feat.types, _n: n };
}

function App() {
  const saved = loadState();
  const [trainer, setTrainer] = useState(saved ? saved.trainer : null);
  const [screen, setScreen] = useState('pokedex');
  const [caught, setCaught] = useState(saved ? saved.caught : {});
  const [stonesInv, setStonesInv] = useState(saved ? saved.stonesInv : { fire:2, water:1, thunder:1, leaf:1 });
  const [typeCounts, setTypeCounts] = useState(saved ? (saved.typeCounts || {}) : {});
  const [catches, setCatches] = useState(saved ? saved.catches : 0);
  const [encounter, setEncounter] = useState(null);
  const [encN, setEncN] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [stoneEarned, setStoneEarned] = useState(null); // key of stone just earned
  const [toast, setToast] = useState(null);
  const [evoScreen, setEvoScreen] = useState(null); // { fromId, toId }
  const [stoneSheet, setStoneSheet] = useState(null); // stone key
  const [completed, setCompleted] = useState(saved ? saved.completed : false);

  // first encounter
  useEffect(() => { if (!encounter) setEncounter(makeEncounter(0)); }, []);

  // persist
  useEffect(() => {
    if (!trainer) return;
    try { localStorage.setItem(KEY, JSON.stringify({ trainer, caught, stonesInv, typeCounts, catches, completed })); } catch(e){}
  }, [trainer, caught, stonesInv, typeCounts, catches, completed]);

  const skin = trainer ? trainer.skin : 'classic';
  useEffect(() => {
    document.getElementById('stage').setAttribute('data-skin', skin);
  }, [skin]);

  // expose reset for testing
  useEffect(() => { window.__resetPokeCatch = () => { localStorage.removeItem(KEY); location.reload(); }; }, []);

  const stonesTotal = Object.values(stonesInv).reduce((a,b)=>a+b, 0);

  // Evolution threshold check — returns true if player can evolve `id`
  function canEvolve(id) {
    const feat = PC.FEATURE[id];
    if (!feat) return false;
    // branch evolution (Eevee): needs 10×
    if (feat.branch) {
      const cnt = caught[id] ? caught[id].count : 0;
      if (cnt < 10) return false;
      return feat.branch.some(([, sk]) => (stonesInv[sk] || 0) > 0);
    }
    if (!feat.evo || feat.evo.length < 2) return false;
    const idx = feat.evo.indexOf(id);
    if (idx < 0 || idx >= feat.evo.length - 1) return false;
    const needed = feat.evo.length === 2 ? 10 : 5;
    const cnt = caught[id] ? caught[id].count : 0;
    if (cnt < needed) return false;
    if (feat.stone) return (stonesInv[feat.stone] || 0) > 0;
    return true;
  }

  function nextEncounter() { const n = encN + 1; setEncN(n); setEncounter(makeEncounter(n)); }

  function onResolve(didCatch) {
    if (didCatch && encounter) {
      const { id, shiny, types } = encounter;
      setCaught(prev => {
        const next = { ...prev, [id]: { count: (prev[id] ? prev[id].count : 0) + 1, shiny: (prev[id] && prev[id].shiny) || shiny } };
        // check completion — all FEATURE caught
        if (!completed && Object.keys(PC.FEATURE).every(k => next[Number(k)])) {
          setCompleted(true);
        }
        return next;
      });
      setCatches(c => c + 1);
      // update type counters, award stones at 10
      setTypeCounts(prev => {
        const next = { ...prev };
        const earned = [];
        types.forEach(t => {
          const sk = PC.TYPE_TO_STONE[t];
          if (!sk) return;
          next[sk] = (next[sk] || 0) + 1;
          if (next[sk] >= 10) { next[sk] = 0; earned.push(sk); }
        });
        if (earned.length > 0) {
          setStonesInv(s => {
            const ns = { ...s };
            earned.forEach(sk => { ns[sk] = (ns[sk] || 0) + 1; });
            return ns;
          });
          setStoneEarned(earned[0]);
          setTimeout(() => setStoneEarned(null), 3000);
        }
        return next;
      });
    }
    nextEncounter();
  }

  function evolve(fromId, toId, sk) {
    if (sk) setStonesInv(prev => ({ ...prev, [sk]: Math.max(0, (prev[sk]||0) - 1) }));
    setCaught(prev => {
      const tgt = prev[toId];
      return { ...prev, [toId]: { count: (tgt ? tgt.count : 0) + 1, shiny: tgt ? tgt.shiny : false } };
    });
    setDetailId(null);
    setEvoScreen({ fromId, toId });
  }

  if (!trainer) {
    return <FTE onComplete={(t)=>{ setTrainer(t); setScreen('pokedex'); }}/>;
  }

  return (
    <>
      {screen === 'catch'
        ? <CatchView encounter={encounter} trainer={trainer}
            stonesInv={stonesInv} typeCounts={typeCounts} stoneEarned={stoneEarned}
            onResolve={onResolve} onOpenDex={()=>setScreen('pokedex')} onOpenStone={(sk)=>setStoneSheet(sk)}/>
        : <PokedexView trainer={trainer} caught={caught} canEvolve={canEvolve}
            stats={{ catches: Object.keys(caught).length, stones: stonesTotal }}
            skin={skin} onSetSkin={(s)=>setTrainer(t=>({ ...t, skin:s }))}
            onOpenCatch={()=>setScreen('catch')} onOpenDetail={(id)=>setDetailId(id)}/>}

      {detailId != null && (
        <DetailOverlay id={detailId} info={caught[detailId]} stonesInv={stonesInv} caught={caught}
          onClose={()=>setDetailId(null)} onEvolve={evolve} onOpenCatch={()=>{ setDetailId(null); setScreen('catch'); }}/>
      )}

      {evoScreen && <EvoScreen fromId={evoScreen.fromId} toId={evoScreen.toId}
        onClose={()=>{ setEvoScreen(null); setDetailId(evoScreen.toId); }}/>}

      {stoneSheet && <StoneSheet stoneKey={stoneSheet} stonesInv={stonesInv}
        onClose={()=>setStoneSheet(null)} onOpenDetail={(id)=>{ setStoneSheet(null); setDetailId(id); }}/>}

      {completed && <CompletionScreen trainerName={trainer.name} onClose={()=>setCompleted(false)}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
