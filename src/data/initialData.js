// Puduppady Grama Panchayat (പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്) - Kozhikode District
// Clean Production Setup - No Dummy Data

export const STANDING_COMMITTEES = [
  { id: 'finance', name: 'ധനകാര്യം', englishName: 'Finance', color: 'blue', chairTitle: 'ധനകാര്യ ചെയർമാൻ (വൈസ് പ്രസിഡന്റ്)' },
  { id: 'development', name: 'വികസനകാര്യം', englishName: 'Development', color: 'emerald', chairTitle: 'വികസനകാര്യ സ്ഥിരംസമിതി അധ്യക്ഷൻ/അധ്യക്ഷ' },
  { id: 'welfare', name: 'ക്ഷേമകാര്യം', englishName: 'Welfare', color: 'amber', chairTitle: 'ക്ഷേമകാര്യ സ്ഥിരംസമിതി അധ്യക്ഷൻ/അധ്യക്ഷ' },
  { id: 'health_education', name: 'ആരോഗ്യ-വിദ്യാഭ്യാസം', englishName: 'Health & Education', color: 'purple', chairTitle: 'ആരോഗ്യ-വിദ്യാഭ്യാസ സ്ഥിരംസമിതി അധ്യക്ഷൻ/അധ്യക്ഷ' },
];

export const STATUTORY_RATES = {
  sittingFeePerMeeting: 250,
  monthlySittingFeeCeiling: 1250, // max 5 meetings fee per month
  honorarium: {
    president: 13200,
    vice_president: 10600,
    sc_chairperson: 9400,
    member: 8200,
  }
};

// Clean Slate: No Dummy Data
export const INITIAL_MEMBERS = [];

export const INITIAL_MEETINGS = [];

export const INITIAL_ATTENDANCE = {};
