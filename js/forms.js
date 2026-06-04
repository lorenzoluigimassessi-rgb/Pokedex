// Special forms: Mega, Primal, Gigantamax, Ultra Burst
// slug: PokéAPI pokemon slug
// name: Italian display name
// baseId: national dex number of base Pokémon
// mechanic: mega | primal | gigantamax | ultra

export const SPECIAL_FORMS = [
  // ── MEGA EVOLUTIONS ──────────────────────────────────────────
  { slug:'venusaur-mega',       name:'Mega Venusaur',        baseId:3,   mechanic:'mega' },
  { slug:'charizard-mega-x',    name:'Mega Charizard X',     baseId:6,   mechanic:'mega' },
  { slug:'charizard-mega-y',    name:'Mega Charizard Y',     baseId:6,   mechanic:'mega' },
  { slug:'blastoise-mega',      name:'Mega Blastoise',       baseId:9,   mechanic:'mega' },
  { slug:'beedrill-mega',       name:'Mega Beedrill',        baseId:15,  mechanic:'mega' },
  { slug:'pidgeot-mega',        name:'Mega Pidgeot',         baseId:18,  mechanic:'mega' },
  { slug:'slowbro-mega',        name:'Mega Slowbro',         baseId:80,  mechanic:'mega' },
  { slug:'gengar-mega',         name:'Mega Gengar',          baseId:94,  mechanic:'mega' },
  { slug:'kangaskhan-mega',     name:'Mega Kangaskhan',      baseId:115, mechanic:'mega' },
  { slug:'pinsir-mega',         name:'Mega Pinsir',          baseId:127, mechanic:'mega' },
  { slug:'gyarados-mega',       name:'Mega Gyarados',        baseId:130, mechanic:'mega' },
  { slug:'aerodactyl-mega',     name:'Mega Aerodactyl',      baseId:142, mechanic:'mega' },
  { slug:'mewtwo-mega-x',       name:'Mega Mewtwo X',        baseId:150, mechanic:'mega' },
  { slug:'mewtwo-mega-y',       name:'Mega Mewtwo Y',        baseId:150, mechanic:'mega' },
  { slug:'ampharos-mega',       name:'Mega Ampharos',        baseId:181, mechanic:'mega' },
  { slug:'steelix-mega',        name:'Mega Steelix',         baseId:208, mechanic:'mega' },
  { slug:'scizor-mega',         name:'Mega Scizor',          baseId:212, mechanic:'mega' },
  { slug:'heracross-mega',      name:'Mega Heracross',       baseId:214, mechanic:'mega' },
  { slug:'houndoom-mega',       name:'Mega Houndoom',        baseId:229, mechanic:'mega' },
  { slug:'tyranitar-mega',      name:'Mega Tyranitar',       baseId:248, mechanic:'mega' },
  { slug:'blaziken-mega',       name:'Mega Blaziken',        baseId:257, mechanic:'mega' },
  { slug:'gardevoir-mega',      name:'Mega Gardevoir',       baseId:282, mechanic:'mega' },
  { slug:'mawile-mega',         name:'Mega Mawile',          baseId:303, mechanic:'mega' },
  { slug:'aggron-mega',         name:'Mega Aggron',          baseId:306, mechanic:'mega' },
  { slug:'medicham-mega',       name:'Mega Medicham',        baseId:308, mechanic:'mega' },
  { slug:'manectric-mega',      name:'Mega Manectric',       baseId:310, mechanic:'mega' },
  { slug:'banette-mega',        name:'Mega Banette',         baseId:354, mechanic:'mega' },
  { slug:'absol-mega',          name:'Mega Absol',           baseId:359, mechanic:'mega' },
  { slug:'garchomp-mega',       name:'Mega Garchomp',        baseId:445, mechanic:'mega' },
  { slug:'lucario-mega',        name:'Mega Lucario',         baseId:448, mechanic:'mega' },
  { slug:'abomasnow-mega',      name:'Mega Abomasnow',       baseId:460, mechanic:'mega' },
  { slug:'alakazam-mega',       name:'Mega Alakazam',        baseId:65,  mechanic:'mega' },
  { slug:'latias-mega',         name:'Mega Latias',          baseId:380, mechanic:'mega' },
  { slug:'latios-mega',         name:'Mega Latios',          baseId:381, mechanic:'mega' },
  { slug:'lopunny-mega',        name:'Mega Lopunny',         baseId:428, mechanic:'mega' },
  { slug:'gallade-mega',        name:'Mega Gallade',         baseId:475, mechanic:'mega' },
  { slug:'audino-mega',         name:'Mega Audino',          baseId:531, mechanic:'mega' },
  { slug:'rayquaza-mega',       name:'Mega Rayquaza',        baseId:384, mechanic:'mega' },
  { slug:'salamence-mega',      name:'Mega Salamence',       baseId:373, mechanic:'mega' },
  { slug:'metagross-mega',      name:'Mega Metagross',       baseId:376, mechanic:'mega' },
  { slug:'sceptile-mega',       name:'Mega Sceptile',        baseId:254, mechanic:'mega' },
  { slug:'swampert-mega',       name:'Mega Swampert',        baseId:260, mechanic:'mega' },
  { slug:'sableye-mega',        name:'Mega Sableye',         baseId:302, mechanic:'mega' },
  { slug:'sharpedo-mega',       name:'Mega Sharpedo',        baseId:319, mechanic:'mega' },
  { slug:'camerupt-mega',       name:'Mega Camerupt',        baseId:323, mechanic:'mega' },
  { slug:'altaria-mega',        name:'Mega Altaria',         baseId:334, mechanic:'mega' },
  { slug:'glalie-mega',         name:'Mega Glalie',          baseId:362, mechanic:'mega' },
  { slug:'diancie-mega',        name:'Mega Diancie',         baseId:719, mechanic:'mega' },

  // ── PRIMAL REVERSION ─────────────────────────────────────────
  { slug:'kyogre-primal',       name:'Kyogre Primordiale',   baseId:382, mechanic:'primal' },
  { slug:'groudon-primal',      name:'Groudon Primordiale',  baseId:383, mechanic:'primal' },

  // ── ULTRA BURST ──────────────────────────────────────────────
  { slug:'necrozma-ultra',      name:'Necrozma Ultrasolare', baseId:800, mechanic:'ultra' },

  // ── GIGANTAMAX ───────────────────────────────────────────────
  { slug:'charizard-gmax',      name:'Gigamax Charizard',    baseId:6,   mechanic:'gigantamax' },
  { slug:'venusaur-gmax',       name:'Gigamax Venusaur',     baseId:3,   mechanic:'gigantamax' },
  { slug:'blastoise-gmax',      name:'Gigamax Blastoise',    baseId:9,   mechanic:'gigantamax' },
  { slug:'butterfree-gmax',     name:'Gigamax Butterfree',   baseId:12,  mechanic:'gigantamax' },
  { slug:'pikachu-gmax',        name:'Gigamax Pikachu',      baseId:25,  mechanic:'gigantamax' },
  { slug:'meowth-gmax',         name:'Gigamax Meowth',       baseId:52,  mechanic:'gigantamax' },
  { slug:'machamp-gmax',        name:'Gigamax Machamp',      baseId:68,  mechanic:'gigantamax' },
  { slug:'gengar-gmax',         name:'Gigamax Gengar',       baseId:94,  mechanic:'gigantamax' },
  { slug:'kingler-gmax',        name:'Gigamax Kingler',      baseId:99,  mechanic:'gigantamax' },
  { slug:'lapras-gmax',         name:'Gigamax Lapras',       baseId:131, mechanic:'gigantamax' },
  { slug:'eevee-gmax',          name:'Gigamax Eevee',        baseId:133, mechanic:'gigantamax' },
  { slug:'snorlax-gmax',        name:'Gigamax Snorlax',      baseId:143, mechanic:'gigantamax' },
  { slug:'garbodor-gmax',       name:'Gigamax Garbodor',     baseId:569, mechanic:'gigantamax' },
  { slug:'melmetal-gmax',       name:'Gigamax Melmetal',     baseId:809, mechanic:'gigantamax' },
  { slug:'rillaboom-gmax',      name:'Gigamax Rillaboom',    baseId:812, mechanic:'gigantamax' },
  { slug:'cinderace-gmax',      name:'Gigamax Cinderace',    baseId:815, mechanic:'gigantamax' },
  { slug:'inteleon-gmax',       name:'Gigamax Inteleon',     baseId:818, mechanic:'gigantamax' },
  { slug:'corviknight-gmax',    name:'Gigamax Corviknight',  baseId:823, mechanic:'gigantamax' },
  { slug:'orbeetle-gmax',       name:'Gigamax Orbeetle',     baseId:826, mechanic:'gigantamax' },
  { slug:'drednaw-gmax',        name:'Gigamax Drednaw',      baseId:834, mechanic:'gigantamax' },
  { slug:'coalossal-gmax',      name:'Gigamax Coalossal',    baseId:839, mechanic:'gigantamax' },
  { slug:'flapple-gmax',        name:'Gigamax Flapple',      baseId:841, mechanic:'gigantamax' },
  { slug:'appletun-gmax',       name:'Gigamax Appletun',     baseId:842, mechanic:'gigantamax' },
  { slug:'sandaconda-gmax',     name:'Gigamax Sandaconda',   baseId:844, mechanic:'gigantamax' },
  { slug:'toxtricity-amped-gmax', name:'Gigamax Toxtricity', baseId:849, mechanic:'gigantamax' },
  { slug:'centiskorch-gmax',    name:'Gigamax Centiskorch',  baseId:851, mechanic:'gigantamax' },
  { slug:'hatterene-gmax',      name:'Gigamax Hatterene',    baseId:858, mechanic:'gigantamax' },
  { slug:'grimmsnarl-gmax',     name:'Gigamax Grimmsnarl',   baseId:861, mechanic:'gigantamax' },
  { slug:'alcremie-gmax',       name:'Gigamax Alcremie',     baseId:869, mechanic:'gigantamax' },
  { slug:'copperajah-gmax',     name:'Gigamax Copperajah',   baseId:879, mechanic:'gigantamax' },
  { slug:'duraludon-gmax',      name:'Gigamax Duraludon',    baseId:884, mechanic:'gigantamax' },
  { slug:'urshifu-rapid-strike-gmax', name:'Gigamax Urshifu Colpi Rapidi', baseId:892, mechanic:'gigantamax' },
  { slug:'urshifu-gmax',        name:'Gigamax Urshifu Stile Oscuro', baseId:892, mechanic:'gigantamax' },
];

// Index by baseId for quick lookup in detail card
export const FORMS_BY_BASE = {};
for (const form of SPECIAL_FORMS) {
  if (!FORMS_BY_BASE[form.baseId]) FORMS_BY_BASE[form.baseId] = [];
  FORMS_BY_BASE[form.baseId].push(form);
}

// Mechanic labels in Italian
export const MECHANIC_LABEL = {
  mega:       'Mega Evoluzione',
  primal:     'Rigresso Primordiale',
  gigantamax: 'Gigamax',
  ultra:      'Ultra Esplosione',
};
