export interface Egg {
  id: string;
  laidAt: Date;
}

export interface Nest {
  species: string;
  motherId: string;
  fatherId: string;
  eggs: Egg[];
  parentsNearby: number;
}

export interface Character {
  name: string;
  species: string;
  growth: number;
  parents: string[];
  bornAt: Date;
}
