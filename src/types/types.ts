interface Species {
  speciesId: string;
  speciesName: string;
  family: string;
  habitat: string;
  status: string;
}

interface SpeciesRecord {
  speciesId: string;
  speciesName: string;
  family: string;
  habitat: string;
  status: string;
  count: number;
}

interface SpeciesList {
  speciesList: Array<Species>;
}

interface GridList {
  speciesList: Array<string>;
}
