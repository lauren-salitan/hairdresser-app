export const SPECIALTIES = [
  "Cut",
  "Color",
  "Balayage",
  "Highlights",
  "Blowout",
  "Updo",
  "Extensions",
  "Curly hair",
  "Keratin treatment",
  "Braids",
  "Locs",
  "Men's cut",
  "Kids cut",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
