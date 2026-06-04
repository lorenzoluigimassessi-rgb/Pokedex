/* ===== PokéDex — browse-only app ===== */
const KEY = 'pokedex_v2';

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch(e) {}
  return null;
}

function populateRegion(existing, regionKey) {
  const reg = PC.REGIONS.find(r => r.key === regionKey);
  if (!reg) return existing;
  const [lo, hi] = reg.key === 'all' ? [1, 1025] : reg.range;
  const next = { ...existing };
  for (let i = lo; i <= hi; i++) {
    if (!next[i]) next[i] = { count: 1, shiny: false };
  }
  return next;
}

function App() {
  const saved = loadState();
  const [trainer, setTrainer] = useState(saved ? saved.trainer : null);
  const [region, setRegion] = useState(saved ? (saved.region || 'kanto') : 'kanto');
  const [caught, setCaught] = useState(() => populateRegion(saved ? saved.caught || {} : {}, saved ? (saved.region || 'kanto') : 'kanto'));
  const [detailId, setDetailId] = useState(null);

  const skin = trainer ? trainer.skin : 'classic';

  // populate new region when it changes
  useEffect(() => {
    setCaught(prev => populateRegion(prev, region));
  }, [region]);

  useEffect(() => {
    document.getElementById('stage').setAttribute('data-skin', skin);
  }, [skin]);

  useEffect(() => {
    if (!trainer) return;
    try { localStorage.setItem(KEY, JSON.stringify({ trainer, region, caught })); } catch(e) {}
  }, [trainer, region, caught]);

  useEffect(() => {
    window.__resetPokedex = () => { localStorage.removeItem(KEY); location.reload(); };
  }, []);

  if (!trainer) {
    return <FTE onComplete={t => { setTrainer(t); }} />;
  }

  return (
    <>
      <PokedexView
        trainer={trainer} caught={caught}
        canEvolve={() => false}
        stats={{ catches: Object.keys(caught).length, stones: 0 }}
        region={region} onSetRegion={r => setRegion(r)}
        skin={skin} onSetSkin={s => setTrainer(t => ({ ...t, skin: s }))}
        onOpenCatch={() => {}}
        onOpenDetail={id => setDetailId(id)}
      />
      {detailId != null && (
        <DetailOverlay
          id={detailId} info={caught[detailId]} stonesInv={{}} caught={caught}
          onClose={() => setDetailId(null)}
          onEvolve={() => {}}
          onOpenCatch={() => {}}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
