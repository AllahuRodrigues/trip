export interface Traveler {
  id: string;
  name: string;
}

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  notes?: string;
}

export interface MustDoItem {
  id: string;
  title: string;
  dayHint?: string;
  notes?: string;
  completed: boolean;
  /** Rough quote for this experience (EUR). */
  estimatedCost?: number;
}

export interface TripDay {
  id: string;
  date: string;
  title: string;
  plans: string;
  estimatedSpend: number;
}

export interface TripOptions {
  airbnbInterested: boolean | null;
  carRoadTripInterested: boolean | null;
  lodgingNotes: string;
  transportNotes: string;
}

export interface TripDocument {
  id: string;
  title: string;
  subtitle: string;
  departureFrom: string;
  startCity: string;
  dates: {
    leaveSf: string;
    arrivePortugal: string;
    lastDayPortugal: string;
    dayCount: number;
  };
  budget: {
    currency: string;
    total: number;
    items: BudgetItem[];
  };
  travelers: Traveler[];
  mustDos: MustDoItem[];
  itineraryDays: TripDay[];
  options: TripOptions;
  notes: string;
  /** Set by server on save (ISO timestamp). */
  updatedAt?: string;
}
