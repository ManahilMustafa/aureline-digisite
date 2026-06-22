/**
 * Aurelian Digsite — Core content data
 * 12 artifacts (4 per stage), achievements, puzzles, reconstruction thresholds
 *
 * Artifact photos: assets/artifacts/{id}.png (lowercase — required for Linux/Vercel hosting)
 */

const artifactImage = (id) => `assets/artifacts/${id}.png`;

export const ARTIFACTS = [
  {
    id: 'terracotta-shard',
    stage: 1,
    name: 'Turquoise Scarab Amulet',
    category: 'Ceremonial Objects',
    description: 'A scarab beetle amulet carved from crackled turquoise faience, framed in weathered bronze legs and a crescent head crest.',
    discoveryNote: 'Brushing sand from a shallow pit, a flash of teal emerges — a scarab amulet, its stone still vivid after centuries underground.',
    journalEntry: 'Found in Sector A7, Layer 1. Scarabs symbolized renewal in Aurelian belief. The turquoise inlay suggests trade links with distant mining regions.',
    image: artifactImage('terracotta-shard'),
    digSpot: { x: 22, y: 35 }
  },
  {
    id: 'key',
    stage: 1,
    name: 'Ornate Turquoise Key',
    category: 'Ceremonial Objects',
    description: 'A ceremonial bronze key with openwork scroll filigree and inlaid turquoise stones, darkened by age and burial patina.',
    discoveryNote: 'Your trowel strikes metal — not coin or blade, but a key, its bow set with a disc of polished turquoise.',
    journalEntry: 'Keys of this quality were not for common doors. The turquoise inlay marks it as temple or treasury property in Aurelian Sector A7.',
    image: artifactImage('key'),
    digSpot: { x: 58, y: 28 }
  },
  {
    id: 'pott',
    stage: 1,
    name: 'Cracked Terracotta Amphora',
    category: 'Pottery',
    description: 'A two-handled storage amphora of reddish fired clay, fractured across the body but still holding its classical ovoid form.',
    discoveryNote: 'The sand gives way to curved clay — an amphora, cracked yet intact enough to reveal how Aurelians stored grain and oil.',
    journalEntry: 'Amphorae of this size served communal storehouses in Layer 1 settlements. Stress fractures suggest collapse during a sandstorm burial event.',
    image: artifactImage('pott'),
    digSpot: { x: 75, y: 52 }
  },
  {
    id: 'knife',
    stage: 1,
    name: 'Bronze Curved Dagger',
    category: 'Ceremonial Objects',
    description: 'A short bronze blade with green patina, a ribbed grip, and an animal-head pommel still bearing a frayed ceremonial cord.',
    discoveryNote: 'Half-buried in compacted sand, a curved blade gleams through oxidation — bronze, carefully cast and ritually adorned.',
    journalEntry: 'The pommel carving and attached cord suggest ritual use rather than combat. Similar daggers appear in Aurelian solar rite deposits.',
    image: artifactImage('knife'),
    digSpot: { x: 40, y: 65 }
  },
  {
    id: 'pot',
    stage: 2,
    name: 'Geometric Painted Vessel',
    category: 'Pottery',
    description: 'A hand-painted terracotta jar bearing zigzag bands, dotted chevrons, and teardrop motifs along its surviving rim and body.',
    discoveryNote: 'Deep in the clay stratum, painted lines appear on a broken vessel — geometry that once marked an Aurelian household.',
    journalEntry: 'The zigzag-and-dot pattern matches pottery from Layer 1 but here is executed on a finer clay body, suggesting a prosperous Layer 2 workshop.',
    image: artifactImage('pot'),
    digSpot: { x: 30, y: 40 }
  },
  {
    id: 'jug',
    stage: 2,
    name: 'Verdigris Bronze Pitcher',
    category: 'Pottery',
    description: 'A single-handled bronze pitcher coated in turquoise verdigris, with a flared neck and bulbous body for pouring wine or oil.',
    discoveryNote: 'The clay yields a green-surfaced vessel — bronze, oxidized into brilliant patina over centuries in moist strata.',
    journalEntry: 'Bronze tableware of this type indicates merchant-class dining in Aurelian trade quarters. Residue analysis may reveal imported olive oil.',
    image: artifactImage('jug'),
    digSpot: { x: 62, y: 25 }
  },
  {
    id: 'face',
    stage: 2,
    name: 'Marble Portrait Head',
    category: 'Statues',
    description: 'A life-sized marble head of a bearded man with deeply carved curly hair, weathered by sand and time.',
    discoveryNote: 'Scraping clay from a collapsed niche, stone features emerge — a portrait head, stern and lifelike despite erosion.',
    journalEntry: 'Roman-influenced portraiture reached Aurelian elites in Layer 2. The style suggests a local magistrate or patron of the dig sector.',
    image: artifactImage('face'),
    digSpot: { x: 48, y: 58 }
  },
  {
    id: 'coin',
    stage: 2,
    name: 'Terracotta Fertility Figurine',
    category: 'Statues',
    description: 'A small votive figure of a robed woman with a tiered headdress, bare torso, and wide hips — a household goddess idol.',
    discoveryNote: 'Something small and carved rolls from the clay — a figurine, worn smooth by hands that once prayed to it nightly.',
    journalEntry: 'Fertility figurines were buried beneath Aurelian hearthstones for blessing. This example survived intact in a Layer 2 domestic deposit.',
    image: artifactImage('coin'),
    digSpot: { x: 78, y: 70 }
  },
  {
    id: 'coinn',
    stage: 3,
    name: 'Gold Aureus of Valdric III',
    category: 'Coins',
    description: 'A struck gold coin bearing the laureate profile of Emperor Valdric III, founder of the late Aurelian dynasty.',
    discoveryNote: 'In the temple chamber floor, gold catches the light — an aureus, its legend still legible beneath a thin veil of dust.',
    journalEntry: 'Valdric III unified the river valleys and minted this aureus to fund temple restorations. Its presence in Layer 3 confirms royal patronage of this site.',
    image: artifactImage('coinn'),
    digSpot: { x: 50, y: 45 }
  },
  {
    id: 'lamp',
    stage: 3,
    name: 'Inscribed Cylinder Seal',
    category: 'Tablets',
    description: 'A hollow terracotta cylinder carved in three bands — pictographic script above and below a row of eye-and-cross motifs.',
    discoveryNote: 'Behind a fallen column, a carved cylinder surfaces — a seal, its glyphs waiting to be rolled across wet clay once more.',
    journalEntry: 'Cylinder seals authenticated Aurelian temple records. The central eye motif may invoke solar protection over sacred archives.',
    image: artifactImage('lamp'),
    digSpot: { x: 25, y: 55 }
  },
  {
    id: 'mug',
    stage: 3,
    name: 'Terracotta Oil Lamp',
    category: 'Ceremonial Objects',
    description: 'A coarse clay lamp with a central wick depression, pierced handle, and soot-darkened bowl from centuries of flame.',
    discoveryNote: 'Wrapped in linen within a stone casket, a humble lamp rests untouched — the last light of Aurelian priests, extinguished long ago.',
    journalEntry: 'Oil lamps lined the temple chamber walls. Soot in the bowl proves it burned during final rites before the chamber was sealed.',
    image: artifactImage('mug'),
    digSpot: { x: 70, y: 38 }
  },
  {
    id: 'necklace',
    stage: 3,
    name: 'Turquoise Pectoral Collar',
    category: 'Jewelry',
    description: 'A bib-style bronze collar of disc beads, a central turquoise medallion, and seven hanging rod pendants with sphere tips.',
    discoveryNote: 'The greatest ornament of the expedition — a pectoral collar, turquoise blazing against bronze in the altar shadow.',
    journalEntry: 'Pectorals of this form were worn by high priestesses during solar festivals. Its discovery anchors Layer 3 as a ceremonial treasury chamber.',
    image: artifactImage('necklace'),
    digSpot: { x: 55, y: 72 }
  }
];

export const ACHIEVEMENTS = [
  {
    id: 'first-discovery',
    name: 'First Discovery',
    description: 'Uncover your first artifact at the dig site.',
    icon: 'search',
    check: (state) => state.discoveredArtifacts.length >= 1
  },
  {
    id: 'excavator',
    name: 'Excavator',
    description: 'Complete all discoveries in Excavation Stage 1.',
    icon: 'pickaxe',
    check: (state) => ARTIFACTS.filter(a => a.stage === 1).every(a => state.discoveredArtifacts.includes(a.id))
  },
  {
    id: 'artifact-hunter',
    name: 'Artifact Hunter',
    description: 'Discover 8 or more artifacts across all stages.',
    icon: 'gem',
    check: (state) => state.discoveredArtifacts.length >= 8
  },
  {
    id: 'journal-complete',
    name: 'Journal Complete',
    description: 'Find all 12 artifacts and complete the collection.',
    icon: 'book-open',
    check: (state) => state.discoveredArtifacts.length >= ARTIFACTS.length
  }
];

export const PUZZLES = [
  {
    id: 'symbol-matching',
    name: 'Symbol Matching',
    stage: 1,
    description: 'Match the Aurelian symbols to their correct pairs to unlock Layer 2.',
    unlocksStage: 2,
    requiredArtifacts: 4,
    type: 'symbol-matching'
  },
  {
    id: 'glyph-sequence',
    name: 'Glyph Sequence',
    stage: 2,
    description: 'Arrange the sacred glyphs in the correct ritual order to enter the temple chamber.',
    unlocksStage: 3,
    requiredArtifacts: 8,
    type: 'glyph-sequence'
  }
];

export const RECONSTRUCTION_THRESHOLDS = {
  ruins: { min: 0, max: 3, label: 'Ruins' },
  partial: { min: 4, max: 8, label: 'Partial Reconstruction' },
  restored: { min: 9, max: 12, label: 'Restored Civilization' }
};

export const STAGES = [
  {
    id: 1,
    title: 'Surface Sands',
    subtitle: 'Sector A7 — Layer 1',
    description: 'The uppermost stratum reveals scarabs, storage vessels, ceremonial keys, and bronze blades from daily Aurelian life.',
    theme: 'stage-surface'
  },
  {
    id: 2,
    title: 'Clay Strata',
    subtitle: 'Sector A7 — Layer 2',
    description: 'Beneath the sand lies painted pottery, bronze tableware, portrait sculpture, and household votive idols.',
    theme: 'stage-clay'
  },
  {
    id: 3,
    title: 'Temple Chamber',
    subtitle: 'Sector A7 — Layer 3',
    description: 'The deepest level holds imperial coinage, cylinder seals, ritual lamps, and the priesthood\'s turquoise pectoral collar.',
    theme: 'stage-temple'
  }
];

export const CIVILIZATION_INTRO = 'The Aurelian civilization flourished along sun-drenched river valleys over two millennia ago. Their temples, markets, and sacred texts vanished beneath the sands — until now.';
