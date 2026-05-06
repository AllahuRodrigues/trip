import type { TripDocument } from './trip.types';

export const TRIP_NOTIFIER = Symbol('TRIP_NOTIFIER');

export interface TripNotifier {
  broadcastTrip(trip: TripDocument): void;
}
