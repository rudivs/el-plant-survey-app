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

interface PlotSubmission {
  _id: string;
  type: string;
  date: string;
  surveyorName: string;
  gridCode: string;
  latitude: number;
  longitude: number;
  positionAccuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  localityDescription: string;
  habitatDescription: string;
  siteCondition: string;
  areaSampled: number;
  plotList: Array<SpeciesRecord>;
}
