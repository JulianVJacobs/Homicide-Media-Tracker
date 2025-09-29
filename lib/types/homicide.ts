// Data interfaces for Homicide Media Tracker

export interface ArticleData {
  newsReportUrl: string;
  newsReportHeadline: string;
  dateOfPublication: string;
  author: string;
  wireService: string;
  language: string;
  sourceType: string;
  newsSource: string;
}

export interface VictimData {
  victimName: string;
  dateOfDeath: string;
  province: string;
  town: string;
  locationType: string;
  sexualAssault: string;
  genderOfVictim: string;
  race: string;
  ageOfVictim: string;
  ageRangeOfVictim: string;
  modeOfDeathSpecific: string;
  modeOfDeathGeneral: string;
  policeStation: string;
}

export interface PerpetratorData {
  perpetratorName: string;
  relationshipToVictim: string;
  suspectIdentified: string;
  suspectArrested: string;
  suspectCharged: string;
  conviction: string;
  sentence: string;
}

export interface HomicideCase {
  id?: string;
  articleData: ArticleData;
  victims: VictimData[];
  perpetrators: PerpetratorData[];
  typeOfMurder: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: string;
  failureCount?: number;
  lastError?: string;
}

// Province and town data structure
export interface TownsByProvince {
  [province: string]: string[];
}

// Form submission handlers
export interface FormSubmissionHandlers {
  onSubmitArticleForm: (data: ArticleData) => void;
  onSubmitVictimForm: (data: VictimData) => void;
  onSubmitPerpetratorForm: (data: PerpetratorData) => void;
}

// Select options for dropdowns
export interface SelectOption {
  value: string;
  label: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HomicideListResponse {
  cases: HomicideCase[];
  total: number;
  page: number;
  limit: number;
}
