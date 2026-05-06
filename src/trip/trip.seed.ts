import { v4 as uuid } from 'uuid';
import type { TripDocument } from './trip.types';

function dayIds(startIso: string, count: number): { id: string; date: string }[] {
  const start = new Date(startIso + 'T12:00:00Z');
  const out: { id: string; date: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push({
      id: uuid(),
      date: d.toISOString().slice(0, 10),
    });
  }
  return out;
}

export function createDefaultTrip(): TripDocument {
  const arrive = '2026-08-01';
  const days = dayIds(arrive, 7);

  const itineraryDays = days.map((d, i) => {
    let title = `Day ${i + 1}`;
    let plans = 'Plan together — edit this block.';
    let estimatedSpend = 0;
    if (i === 0) {
      title = 'Lisbon — arrival';
      plans =
        'Land in Lisbon, check-in, light explore nearby. Dinner somewhere central.';
      estimatedSpend = 80;
    }
    if (i === 6) {
      title = 'Pack & depart';
      plans = 'Breakfast, last souvenirs, head to airport.';
      estimatedSpend = 40;
    }
    return {
      id: d.id,
      date: d.date,
      title,
      plans,
      estimatedSpend,
    };
  });

  return {
    id: 'yumna-lisbon-2026',
    title: 'Portugal — Rodrigues & Yumna',
    subtitle: '7 days from Lisbon · August 2026',
    departureFrom: 'San Francisco — July 31',
    startCity: 'Lisbon',
    dates: {
      leaveSf: '2026-07-31',
      arrivePortugal: arrive,
      lastDayPortugal: days[6].date,
      dayCount: 7,
    },
    budget: {
      currency: 'EUR',
      total: 500,
      items: [],
    },
    travelers: [
      { id: uuid(), name: 'Rodrigues' },
      { id: uuid(), name: 'Yumna' },
    ],
    mustDos: [
      {
        id: uuid(),
        title: 'Skydiving (day trip)',
        dayHint: 'Pick one day — tandem jump outside Lisbon or coastal drop zones.',
        notes: 'Placeholder quote — replace with the quote you book.',
        estimatedCost: 220,
        completed: false,
      },
      {
        id: uuid(),
        title: 'Bar hopping',
        dayHint: 'One night — Bairro Alto / Pink Street style crawl.',
        notes: 'Drinks + snacks envelope.',
        estimatedCost: 90,
        completed: false,
      },
      {
        id: uuid(),
        title: 'Beach day',
        dayHint: 'Day trip — Cascais / Costa da Caparica / Nazaré depending on mood.',
        notes: 'Train + umbrella + lunch.',
        estimatedCost: 45,
        completed: false,
      },
      {
        id: uuid(),
        title: 'Romantic boat + restaurant date',
        dayHint: 'Sunset river cruise or Atlantic sail + reservation dinner.',
        notes: 'Combine cruise quotes + dinner tasting menu.',
        estimatedCost: 260,
        completed: false,
      },
    ],
    itineraryDays,
    options: {
      airbnbInterested: null,
      carRoadTripInterested: null,
      lodgingNotes: '',
      transportNotes: '',
    },
    notes:
      'Share this URL with Yumna — on Vercel use polling sync; with Redis attached everyone shares one saved trip.',
  };
}
