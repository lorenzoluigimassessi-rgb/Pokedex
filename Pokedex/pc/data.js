/* ===== PokéCatch data layer ===== */
(function () {
  const TYPE_COLORS = {
    normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
    grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
    ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
    rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
    steel:'#B8B8D0', fairy:'#EE99AC'
  };

  const REGIONS = [
    { key:'all',    name:'All',    range:[1,1025] },
    { key:'kanto',  name:'Kanto',  range:[1,151] },
    { key:'johto',  name:'Johto',  range:[152,251] },
    { key:'hoenn',  name:'Hoenn',  range:[252,386] },
    { key:'sinnoh', name:'Sinnoh', range:[387,493] },
    { key:'unova',  name:'Unova',  range:[494,649] },
    { key:'kalos',  name:'Kalos',  range:[650,721] },
    { key:'alola',  name:'Alola',  range:[722,809] },
    { key:'galar',  name:'Galar',  range:[810,905] },
    { key:'paldea', name:'Paldea', range:[906,1025] },
  ];
  const TOTAL = 1025;

  // Kanto national-dex names (1-151)
  const KANTO = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran\u2640","Nidorina","Nidoqueen","Nidoran\u2642","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"];

  function nameOf(id) { return id <= 151 ? KANTO[id-1] : ('Pok\u00e9mon #' + id); }

  // s(hp,atk,def,spa,spd,spe)
  const s = (hp,a,d,sa,sd,sp) => ({ hp, atk:a, def:d, spa:sa, spd:sd, spe:sp });
  // Curated, fully-featured Pokémon (drive catch encounters + rich detail)
  const FEATURE = {
    1:{types:['grass','poison'],stats:s(45,49,49,65,65,45),evo:[1,2,3],flavor:"A strange seed was planted on its back at birth. The plant sprouts and grows with this Pok\u00e9mon."},
    2:{types:['grass','poison'],stats:s(60,62,63,80,80,60),evo:[1,2,3],flavor:"When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs."},
    3:{types:['grass','poison'],stats:s(80,82,83,100,100,80),evo:[1,2,3],flavor:"Its plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight."},
    4:{types:['fire'],stats:s(39,52,43,60,50,65),evo:[4,5,6],flavor:"The flame at the tip of its tail makes a sound as it burns. It can be heard quietly."},
    5:{types:['fire'],stats:s(58,64,58,80,65,80),evo:[4,5,6],flavor:"It has a barbaric nature. In battle, it whips its fiery tail around and slashes with claws."},
    6:{types:['fire','flying'],stats:s(78,84,78,109,85,100),evo:[4,5,6],flavor:"It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames."},
    7:{types:['water'],stats:s(44,48,65,50,64,43),evo:[7,8,9],flavor:"After birth, its back swells and hardens into a shell. It sprays foam from its mouth."},
    8:{types:['water'],stats:s(59,63,80,65,80,58),evo:[7,8,9],flavor:"It is recognized as a symbol of longevity. Its shell often grows algae the older it gets."},
    9:{types:['water'],stats:s(79,83,100,85,105,78),evo:[7,8,9],flavor:"It deliberately makes itself heavy to withstand the recoil of the water jets it fires."},
    25:{types:['electric'],stats:s(35,55,40,50,50,90),evo:[25,26],flavor:"When several gather, their electricity can build and cause lightning storms.",stone:'thunder'},
    26:{types:['electric'],stats:s(60,90,55,90,80,110),evo:[25,26],flavor:"Its long tail serves as a ground to protect itself from its own high-voltage power."},
    37:{types:['fire'],stats:s(38,41,40,50,65,65),evo:[37,38],flavor:"While young, it has six gorgeous tails. When it grows, several new tails are sprouted.",stone:'fire'},
    38:{types:['fire'],stats:s(73,76,75,81,100,100),evo:[37,38],flavor:"Said to live a thousand years, its nine tails are loaded with a wealth of supernatural powers."},
    35:{types:['fairy'],stats:s(70,45,48,60,65,35),evo:[35,36],flavor:"Its magical and cute appeal has many admirers. It is rare and found only in certain areas.",stone:'moon'},
    36:{types:['fairy'],stats:s(95,70,73,95,90,60),evo:[35,36],flavor:"A timid fairy Pok\u00e9mon that is rarely seen. It will run and hide the moment it senses people."},
    39:{types:['normal','fairy'],stats:s(115,45,20,45,25,20),evo:[39,40],flavor:"When its huge eyes light up, it sings a mysteriously soothing melody that lulls its enemies to sleep.",stone:'moon'},
    40:{types:['normal','fairy'],stats:s(140,70,45,85,50,45),evo:[39,40],flavor:"The deeply rare fur is treasured. It is made of a fine, light wool that feels wonderful to touch."},
    58:{types:['fire'],stats:s(55,70,45,70,50,60),evo:[58,59],flavor:"Very protective of its territory. It barks and bites to repel intruders from its turf.",stone:'fire'},
    59:{types:['fire'],stats:s(90,110,80,100,80,95),evo:[58,59],flavor:"A Pok\u00e9mon admired since the past for its beauty. It runs agilely as if on wings."},
    43:{types:['grass','poison'],stats:s(45,50,55,75,65,30),evo:[43,44,45],flavor:"During the day, it stays in the cold underground to avoid the sun. It grows by absorbing moonlight.",stone:'leaf'},
    44:{types:['grass','poison'],stats:s(60,65,70,85,75,40),evo:[43,44,45],flavor:"Its pistils exude an incredibly foul odor. The horrid stench can cause fainting at a distance.",stone:'leaf'},
    45:{types:['grass','poison'],stats:s(75,80,85,110,90,50),evo:[43,44,45],flavor:"Its petals are the largest in the world. It scatters allergenic pollen that can cause crying."},
    92:{types:['ghost','poison'],stats:s(30,35,30,100,35,80),evo:[92,93,94],flavor:"Almost invisible, this gaseous Pok\u00e9mon cloaks the target and puts it to sleep without notice."},
    93:{types:['ghost','poison'],stats:s(45,50,45,115,55,95),evo:[92,93,94],flavor:"By licking, it saps the victim's life. It causes shaking that won't stop until death."},
    94:{types:['ghost','poison'],stats:s(60,65,60,130,75,110),evo:[92,93,94],flavor:"On the night of a full moon, the silhouettes cast on walls are said to be hungry Gengar."},
    129:{types:['water'],stats:s(20,10,55,15,20,80),evo:[129,130],flavor:"In the distant past, it was somewhat stronger than the horribly weak descendants that exist today."},
    130:{types:['water','flying'],stats:s(95,125,79,60,100,81),evo:[129,130],flavor:"Once it appears, its rage will not be quelled until it has flattened everything around it."},
    131:{types:['water','ice'],stats:s(130,85,80,85,95,60),evo:[131],flavor:"A Pok\u00e9mon that has been overhunted almost to extinction. It can ferry people across the water."},
    133:{types:['normal'],stats:s(55,55,50,45,65,55),evo:[133],flavor:"Its genetic code is irregular. It may mutate if exposed to radiation from elemental stones.",branch:[[134,'water'],[135,'thunder'],[136,'fire']]},
    134:{types:['water'],stats:s(130,65,60,110,95,65),evo:[133,134],flavor:"Lives close to water. Its long tail is ridged with a fin often mistaken for a mermaid's."},
    135:{types:['electric'],stats:s(65,65,60,110,95,130),evo:[133,135],flavor:"It accumulates negative ions to blast out 10,000-volt lightning bolts."},
    136:{types:['fire'],stats:s(65,130,60,95,110,65),evo:[133,136],flavor:"It has a flame chamber inside its body. Inhaled air is heated and gushes from its body."},
    143:{types:['normal'],stats:s(160,110,65,65,110,30),evo:[143],flavor:"Very lazy. Just eats and sleeps. As its rotund bulk builds, it becomes steadily more slothful."},
    147:{types:['dragon'],stats:s(41,64,45,50,50,50),evo:[147,148,149],flavor:"Long considered a mythical Pok\u00e9mon until recently when a small colony was found living underwater."},
    148:{types:['dragon'],stats:s(61,84,65,70,70,70),evo:[147,148,149],flavor:"A mystical Pok\u00e9mon that exudes a gentle aura. Has the ability to change the weather."},
    149:{types:['dragon','flying'],stats:s(91,134,95,100,100,80),evo:[147,148,149],flavor:"An extremely rarely seen marine Pok\u00e9mon. Its intelligence is said to match that of humans."},
    150:{types:['psychic'],stats:s(106,110,90,154,90,130),evo:[150],flavor:"It was created by a scientist after years of horrific gene-splicing and DNA-engineering experiments."},
    151:{types:['psychic'],stats:s(100,100,100,100,100,100),evo:[151],flavor:"So rare that it is still said to be a mirage by many experts. Only a few people have seen it worldwide."},
  };
  // Rarity tiers — controls encounter weight and catch rate
  // tier: 1=common 2=uncommon 3=rare 4=ultrarare 5=epic 6=legendary
  const RARITY = {
    1:{ label:'Comune',      weight:48, catchRate:0.95 },
    2:{ label:'Non comune',  weight:27, catchRate:0.85 },
    3:{ label:'Raro',        weight:14, catchRate:0.70 },
    4:{ label:'Ultra Raro',  weight:7,  catchRate:0.55 },
    5:{ label:'Epico',       weight:3,  catchRate:0.50 },
    6:{ label:'Leggendario', weight:1,  catchRate:0.35 },
  };

  // Assign rarity tier to each featured Pokémon (stage 1=common/uncommon, stage2=rare, stage3=ultrarare, special=epic/legendary)
  const FEAT_RARITY = {
    1:2,  2:3,  3:4,  // Bulbasaur line
    4:2,  5:3,  6:4,  // Charmander line
    7:2,  8:3,  9:4,  // Squirtle line
    25:2, 26:3,       // Pikachu line
    35:2, 36:3,       // Clefairy line
    37:2, 38:3,       // Vulpix line
    39:1, 40:3,       // Jigglypuff line
    43:1, 44:2, 45:3, // Oddish line
    58:2, 59:3,       // Growlithe line
    92:2, 93:3, 94:4, // Gastly line
    129:1, 130:4,     // Magikarp line
    131:5,            // Lapras
    133:2, 134:4, 135:4, 136:4, // Eevee line
    143:5,            // Snorlax
    147:3, 148:4, 149:5, // Dratini line
    150:6, 151:6,     // Legendaries
  };

  // Type → stone mapping now handled in TYPE_TO_STONE_FULL below

  // Stones: 2x5 grid
  const STONES = [
    { key:'fire',    name:'Fire',    color:'#f0683c', glow:'#ff8a5c' },
    { key:'water',   name:'Water',   color:'#5b8af0', glow:'#7aa6ff' },
    { key:'thunder', name:'Thunder', color:'#f4cf2e', glow:'#ffe566' },
    { key:'leaf',    name:'Leaf',    color:'#5fbf4f', glow:'#86e070' },
    { key:'moon',    name:'Moon',    color:'#8e7bd6', glow:'#b3a0ee' },
    { key:'sun',     name:'Sun',     color:'#ffb547', glow:'#ffd27a' },
    { key:'dusk',    name:'Dusk',    color:'#4a4f7a', glow:'#7d83b8' },
    { key:'dawn',    name:'Dawn',    color:'#e88bb4', glow:'#ffb3d4' },
    { key:'ice',     name:'Ice',     color:'#7fd0d8', glow:'#aef0f5' },
    { key:'shiny',   name:'Shiny',   color:'#ffd93d', glow:'#fff08a' },
  ];

  // Ball types
  const BALLS = {
    poke:    { name:'Pok\u00e9 Ball',    top:'#ee4b4b', bottom:'#f5f5f5', ring:'#222' },
    great:   { name:'Great Ball',   top:'#2f6fd0', bottom:'#f5f5f5', ring:'#222', stripe:'#e8514f' },
    ultra:   { name:'Ultra Ball',   top:'#2a2a2a', bottom:'#f5f5f5', ring:'#222', stripe:'#ffd93d' },
    master:  { name:'Master Ball',  top:'#7b3fb0', bottom:'#f5f5f5', ring:'#222', mark:'#e87ab8' },
    premier: { name:'Premier Ball', top:'#ffffff', bottom:'#ffffff', ring:'#e8514f' },
  };

  // 8 trainers — real artwork pulled from the Pokémon Wiki (Special:FilePath),
  // with SVG bust as graceful fallback (cap/hair/skin) if an image fails.
  const AVATARS = [
    { key:'red',     name:'Red',     file:'Red Adventures.png',                          cap:'#e23b3b', hair:'#3a2a22', skin:'#f1c79b' },
    { key:'blue',    name:'Blue',    file:'Blue FireRed and LeafGreen.png',              cap:'#3b6fe2', hair:'#5a3c2a', skin:'#f1c79b' },
    { key:'ethan',   name:'Ethan',   file:'Ethan HeartGold and SoulSilver.png',          cap:'#f5d23b', hair:'#2a2a2a', skin:'#f1c79b' },
    { key:'brendan', name:'Brendan', file:'Brendan Omega Ruby and Alpha Sapphire.png',   cap:'#e2546f', hair:'#2a2a2a', skin:'#f1c79b' },
    { key:'may',     name:'May',     file:'May (Champion) Masters (New Pose).png',        cap:'#e2546f', hair:'#5a3c2a', skin:'#f4cda3' },
    { key:'dawn',    name:'Dawn',    file:'Dawn Diamond and Pearl.png',                  cap:'#e896c0', hair:'#2a3358', skin:'#f4cda3' },
    { key:'leaf',    name:'Leaf',    file:'Leaf.png',                                    cap:'#ffffff', hair:'#6a4a32', skin:'#f4cda3' },
    { key:'lucas',   name:'Lucas',   file:'Lucas Diamond and Pearl.png',                 cap:'#3b6fe2', hair:'#2a2a2a', skin:'#f1c79b' },
  ];

  // 3 Pokédex skins
  const SKINS = [
    { key:'classic', name:'Classic Red',  accent:'#cc0000', sub:'Thick border, rounded' },
    { key:'modern',  name:'Modern Blue',  accent:'#3b82f6', sub:'Thin, sharp, glowing' },
    { key:'retro',   name:'Retro Pixel',  accent:'#4ade80', sub:'Chunky pixel border' },
  ];

  /* ---- Sprite URLs ---- */
  const SPR = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  function artUrl(id, shiny) {
    return `${SPR}/other/official-artwork${shiny?'/shiny':''}/${id}.png`;
  }
  function spriteUrl(id, shiny) {
    return `${SPR}${shiny?'/shiny':''}/${id}.png`;
  }

  /* ---- Stone trigger map — expanded for all generations ---- */
  const TYPE_TO_STONE_FULL = {
    fire:'fire', water:'water', electric:'thunder',
    grass:'leaf', fairy:'moon', normal:'moon',
    psychic:'sun', ice:'ice', dark:'dusk', ghost:'dusk',
  };

  /* ---- API evolution trigger → stone key ---- */
  const EVO_TRIGGER_TO_STONE = {
    'fire-stone':'fire', 'water-stone':'water', 'thunder-stone':'thunder',
    'leaf-stone':'leaf', 'moon-stone':'moon', 'sun-stone':'sun',
    'dusk-stone':'dusk', 'dawn-stone':'dawn', 'ice-stone':'ice',
    'shiny-stone':'shiny',
  };

  /* ---- localStorage API cache ---- */
  const API_CACHE_KEY = 'pkapi_v1';
  let _apiCache = null;
  function getApiCache() {
    if (_apiCache) return _apiCache;
    try { _apiCache = JSON.parse(localStorage.getItem(API_CACHE_KEY) || '{}'); }
    catch(e) { _apiCache = {}; }
    return _apiCache;
  }
  function saveApiCache() {
    try { localStorage.setItem(API_CACHE_KEY, JSON.stringify(_apiCache)); } catch(e) {}
  }

  /* ---- Auto rarity from evolution stage ---- */
  function rarityFromStage(stage, isLegendary, isMythical) {
    if (isLegendary || isMythical) return 6;
    if (stage === 0) return 2; // no evolution line — uncommon
    if (stage === 1) return 1; // base form — common
    if (stage === 2) return 3; // middle form — rare
    if (stage === 3) return 4; // final form — ultra rare
    return 2;
  }

  /* ---- Parse PokéAPI evolution chain into flat evo array ---- */
  function parseEvoChain(chain) {
    const lines = [];
    function walk(node, lineage) {
      const id = parseInt(node.species.url.split('/').slice(-2)[0]);
      const current = [...lineage, id];
      // check for stone trigger
      let stone = null;
      if (node.evolution_details && node.evolution_details.length > 0) {
        const detail = node.evolution_details[0];
        if (detail.item) stone = EVO_TRIGGER_TO_STONE[detail.item.name] || null;
      }
      if (node.evolves_to.length === 0) {
        lines.push({ evo: current, stone });
      } else {
        node.evolves_to.forEach(next => walk(next, current));
      }
    }
    walk(chain, []);
    return lines;
  }

  /* ---- Full PokéAPI fetch — pokemon + species + evolution chain ---- */
  async function fetchFullData(id) {
    const cache = getApiCache();
    if (cache[id]) return cache[id];

    try {
      // fetch pokemon and species in parallel
      const [pRes, sRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ]);
      if (!pRes.ok || !sRes.ok) throw new Error('bad');
      const [p, sp] = await Promise.all([pRes.json(), sRes.json()]);

      // flavor text — first English entry
      const flavorEntry = sp.flavor_text_entries.find(e => e.language.name === 'en');
      const flavor = flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f]/g, ' ') : '';

      // fetch evolution chain
      const evoRes = await fetch(sp.evolution_chain.url);
      const evoData = await evoRes.json();
      const evoLines = parseEvoChain(evoData.chain);

      // find which line this pokemon belongs to
      let evo = [id];
      let stone = null;
      let branch = null;
      let stage = 0;

      // find all lines containing this id
      const myLines = evoLines.filter(l => l.evo.includes(id));
      if (myLines.length === 1) {
        evo = myLines[0].evo;
        stage = evo.indexOf(id); // 0-based
        // stone: look at the evolution detail FOR this pokemon (not from it)
        const stoneLine = evoLines.find(l => l.evo.includes(id) && l.stone);
        if (stoneLine) {
          // stone applies to the step BEFORE this id in the chain
          const idx = stoneLine.evo.indexOf(id);
          if (idx > 0) stone = stoneLine.stone;
        }
      } else if (myLines.length > 1) {
        // branch evolution (like Eevee)
        const base = myLines[0].evo[0];
        evo = [base, id];
        stage = id === base ? 0 : 1;
        if (id === base) {
          // this IS the base — collect all branches
          branch = myLines.map(l => {
            const toId = l.evo[1];
            return [toId, l.stone || null];
          });
        }
      }

      const out = {
        types: p.types.map(t => t.type.name),
        flavor,
        evo,
        stone,
        branch: branch || null,
        stage: stage + 1, // 1-based for rarityFromStage
        isLegendary: sp.is_legendary,
        isMythical: sp.is_mythical,
        name: sp.names.find(n => n.language.name === 'en')?.name || `Pokémon #${id}`,
      };

      cache[id] = out;
      saveApiCache();
      return out;
    } catch(e) {
      return null;
    }
  }

  /* ---- Get data for any pokemon — hardcoded first, API fallback ---- */
  function getDataSync(id) {
    const feat = FEATURE[id];
    if (feat) return { ...feat, stage: feat.evo ? feat.evo.indexOf(id) + 1 : 1, isLegendary: false, isMythical: false, name: nameOf(id) };
    const cache = getApiCache();
    return cache[id] || null; // null = not yet fetched
  }

  /* ---- Build region encounter pool — all ids in range, weighted by auto-rarity ---- */
  function buildEncounterPool(regionKey) {
    const reg = REGIONS.find(r => r.key === regionKey) || REGIONS.find(r => r.key === 'kanto');
    const [lo, hi] = reg.range;
    const pool = [];
    for (let id = lo; id <= hi; id++) {
      const data = getDataSync(id);
      let tier;
      if (FEAT_RARITY[id]) {
        tier = FEAT_RARITY[id];
      } else if (data) {
        tier = rarityFromStage(data.stage || 1, data.isLegendary, data.isMythical);
      } else {
        // not yet fetched — use simple positional heuristic within evolution lines
        // Pokémon tend to come in groups of 2-3 in the dex: base=common, mid=rare, final=ultrarare
        const posInGroup = (id - lo) % 3;
        tier = posInGroup === 0 ? 1 : posInGroup === 1 ? 3 : 4;
      }
      const w = RARITY[tier].weight;
      for (let i = 0; i < w; i++) pool.push(id);
    }
    return pool;
  }

  /* ---- Auto rarity for any id ---- */
  function rarityOf(id) {
    if (FEAT_RARITY[id]) return RARITY[FEAT_RARITY[id]];
    const data = getDataSync(id);
    if (data) return RARITY[rarityFromStage(data.stage || 1, data.isLegendary, data.isMythical)];
    return RARITY[2]; // default uncommon
  }

  function catchRate(id) { return rarityOf(id).catchRate; }

  window.PC = {
    TYPE_COLORS, REGIONS, TOTAL, KANTO, nameOf,
    FEATURE, FEAT_RARITY, RARITY,
    TYPE_TO_STONE: TYPE_TO_STONE_FULL,
    STONES, BALLS, AVATARS, SKINS,
    artUrl, spriteUrl,
    fetchFullData, getDataSync, buildEncounterPool,
    rarityOf, catchRate, rarityFromStage,
    typeColor: t => TYPE_COLORS[t] || '#888',
    stoneOf: k => STONES.find(s => s.key === k),
    titleCase: t => t.charAt(0).toUpperCase() + t.slice(1),
    avatarUrl: f => 'https://pokemon.fandom.com/wiki/Special:FilePath/' + encodeURIComponent(f) + '?width=240',
  };
})();
