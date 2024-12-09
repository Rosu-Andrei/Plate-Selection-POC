export interface Well {
  id: string;
  row?: number;
  column?: number;
  sampleRole?: string;
  sampleId?: string;
}


export const mockWells: Well[] = [
  {id: 'F5', sampleId: "56", sampleRole: "Unknown Sample"},
  {id: 'A1', sampleId: "12", sampleRole: "Negative Process Control"},
  {id: 'X16', sampleId: "22", sampleRole: "Quantitation Standard"},
  {id: 'B7', sampleId: "123", sampleRole: "No Template Control"},
  {id: 'C3', sampleId: "19", sampleRole: "Positive Process Control"},
  {id: 'N2', sampleId: "64", sampleRole: "Quantitation Standard"},
  {id: 'O10', sampleId: "47", sampleRole: "Positive Template Control"}
];
