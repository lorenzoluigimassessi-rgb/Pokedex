/* ===== PokéCatch — root app ===== */
const KEY = 'pokecatch_v1';

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
  let ball = 'poke';
  const r = Math.random();
  if (r > 0.97) ball = 'master'; else if (r > 0.86) ball = 'ultra'; else if (r > 0.62) ball = 'great';
  return { id, shiny, ball, types: feat.types, _n: n };
}

function App() {
  const saved = loadState();
  const [trainer, setTrainer] = useState(saved ? saved.trainer : null);
  const [screen, setScreen] = useState('catch');
  const [caught, setCaught] = useState(saved ? saved.caught : seedCaught());
  const [stonesInv, setStonesInv] = useState(saved ? saved.stonesInv : { fire:2, water:1, thunder:1, leaf:1 });
  const [catches, setCatches] = useState(saved ? saved.catches : 0);
  const [encounter, setEncounter] = useState(null);
  const [encN, setEncN] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [stoneModal, setStoneModal] = useState(false);
  const [toast, setToast] = useState(null);

  // first encounter
  useEffect(() => { if (!encounter) setEncounter(makeEncounter(0)); }, []);

  // persist
  useEffect(() => {
    if (!trainer) return;
    try { localStorage.setItem(KEY, JSON.stringify({ trainer, caught, stonesInv, catches })); } catch(e){}
  }, [trainer, caught, stonesInv, catches]);

  const skin = trainer ? trainer.skin : 'classic';
  useEffect(() => {
    document.getElementById('stage').setAttribute('data-skin', skin);
  }, [skin]);

  // expose reset for testing
  useEffect(() => { window.__resetPokeCatch = () => { localStorage.removeItem(KEY); location.reload(); }; }, []);

  const stonesTotal = Object.values(stonesInv).reduce((a,b)=>a+b, 0);

  function nextEncounter() { const n = encN + 1; setEncN(n); setEncounter(makeEncounter(n)); }

  function onResolve(didCatch) {
    if (didCatch && encounter) {
      const { id, shiny } = encounter;
      setCaught(prev => {
        const cur = prev[id];
        return { ...prev, [id]: { count: (cur ? cur.count : 0) + 1, shiny: (cur && cur.shiny) || shiny } };
      });
      const newCount = catches + 1;
      setCatches(newCount);
      if (newCount % 5 === 0) { setStoneModal(true); return; } // pause for reward; encounter advances after choose
    }
    nextEncounter();
  }

  function chooseStone(sk) {
    setStonesInv(prev => ({ ...prev, [sk]: (prev[sk]||0) + 1 }));
    setStoneModal(false);
    nextEncounter();
  }

  function evolve(fromId, toId, sk) {
    setStonesInv(prev => ({ ...prev, [sk]: Math.max(0, (prev[sk]||0) - 1) }));
    setCaught(prev => {
      const tgt = prev[toId];
      return { ...prev, [toId]: { count: (tgt ? tgt.count : 0) + 1, shiny: tgt ? tgt.shiny : false } };
    });
    setToast({ from: fromId, to: toId });
    setTimeout(() => setToast(null), 3400);
    setDetailId(toId);
  }

  if (!trainer) {
    return <FTE onComplete={(t)=>{ setTrainer(t); setScreen('catch'); }}/>;
  }

  return (
    <>
      {screen === 'catch'
        ? <CatchView encounter={encounter} trainer={trainer} stats={{ catches: Object.keys(caught).length, stones: stonesTotal }}
            onResolve={onResolve} onOpenDex={()=>setScreen('pokedex')}/>
        : <PokedexView trainer={trainer} caught={caught} stats={{ catches: Object.keys(caught).length, stones: stonesTotal }}
            skin={skin} onSetSkin={(s)=>setTrainer(t=>({ ...t, skin:s }))}
            onOpenCatch={()=>setScreen('catch')} onOpenDetail={(id)=>setDetailId(id)}/>}

      {detailId != null && (
        <DetailOverlay id={detailId} info={caught[detailId]} stonesInv={stonesInv}
          onClose={()=>setDetailId(null)} onEvolve={evolve}/>
      )}

      {stoneModal && <StoneModal onChoose={chooseStone}/>}
      {toast && <EvoToast from={toast.from} to={toast.to}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
