/* ===== PokéDex — browse-only app ===== */
const KEY = 'pokedex_v1';

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch(e) {}
  return null;
}

// Pre-populate all Pokémon in a region range as caught
function makeCaught(lo, hi) {
  const c = {};
  for (let i = lo; i <= hi; i++) c[i] = { count: 1, shiny: false };
  return c;
}

function App() {
  const saved = loadState();
  const [trainer, setTrainer] = useState(saved ? saved.trainer : null);
  const [region, setRegion] = useState(saved ? (saved.region || 'kanto') : 'kanto');
  const [caught, setCaught] = useState(() => {
    if (saved && saved.caught) return saved.caught;
    const reg = PC.REGIONS.find(r => r.key === 'kanto');
    return makeCaught(reg.range[0], reg.range[1]);
  });
  const [detailId, setDetailId] = useState(null);
  const skin = trainer ? trainer.skin : 'classic';

  // When region changes, ensure all Pokémon in that region are populated
  useEffect(() => {
    const reg = PC.REGIONS.find(r => r.key === region);
    if (!reg) return;
    const [lo, hi] = reg.key === 'all' ? [1, 1025] : reg.range;
    setCaught(prev => {
      const next = { ...prev };
      for (let i = lo; i <= hi; i++) {
        if (!next[i]) next[i] = { count: 1, shiny: false };
      }
      return next;
    });
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
        region={region} onSetRegion={setRegion}
        skin={skin} onSetSkin={s => setTrainer(t => ({ ...t, skin: s }))}
        onOpenDetail={id => setDetailId(id)}
      />
      {detailId != null && (
        <DetailOverlay
          id={detailId} info={caught[detailId]}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
