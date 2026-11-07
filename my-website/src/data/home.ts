export type TableTool = { name: string; href: string; icon: string };

export type ExploreSection = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imagePosition?: string;
};

export const tableTools: TableTool[] = [
  {name: "D&D Beyond", href: "https://www.dndbeyond.com/", icon: "20"},
  {name: "Discord", href: "https://discord.com/app", icon: "◇"},
  {name: "Owlbear Rodeo", href: "https://www.owlbear.rodeo/", icon: "⌖"},
];

/** Current campaign snapshot overrides historical session metadata when specified. */
export const campaignSnapshot: {
  sessionNumber?: number;
  campaignDate?: string;
  location?: string;
  latestSessionHref?: string;
  /** Party level shown in the landing status panel. */
  level?: number;
} = {
  level: 6,
  // Current party location; the latest published session retains its historical starting location.
  location: "Aldea Seongnam",
};

/**
 * Landing-only level milestone. The main quest records 10 cards at level 6;
 * acquiring four additional cards reaches the next milestone.
 * Update cardsAtLevelStart when the party levels up.
 */
export const cardLevelMilestone = {
  questId: "mq-collect-cards",
  cardsAtLevelStart: 10,
  cardsRequired: 4,
} as const;

export const featuredQuestIds = ["mq-collect-cards"];

export const exploreSections: ExploreSection[] = [
  {
    title: "Personajes",
    description: "Aliados, aventureros y enemigos de la campaña.",
    href: "/characters",
    imageSrc: "/img/characters/txt/20250927_1317_Fantasy Admiral Portrait_remix_01k669mp3fepp9f8w8gx3y3ppr.webp",
    imagePosition: "center 30%",
  },
  {
    title: "Facciones",
    description: "Poderes, alianzas y rivalidades que mueven el mundo.",
    href: "/factions",
    imageSrc: "/img/factions/panes-del-destino.webp",
    imagePosition: "center 28%",
  },
  {
    title: "Lugares",
    description: "Reinos, islas y rincones visitados por la party.",
    href: "/world/locations/isla-estelar",
    imageSrc: "/img/lore/Jeyperia el Reino Perfecto.webp",
  },
  {
    title: "Documentos",
    description: "Cartas, rumores y pistas reunidas durante el viaje.",
    href: "/documents",
    imageSrc: "/img/objects/Neogrimorio.webp",
    imagePosition: "center 38%",
  },
  {
    title: "Sesiones",
    description: "La crónica de lo ocurrido alrededor de la mesa.",
    href: "/sessions",
    imageSrc: "/img/lore/Arco de entrenamiento de Soobin.webp",
  },
  {
    title: "Cosmología",
    description: "Planos, divinidades y fuerzas más allá de Hallyura.",
    href: "/cosmology",
    imageSrc: "/img/lore/El Árbol de la Vida.webp",
  },
];
