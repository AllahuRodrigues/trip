import { Injectable } from '@nestjs/common';
import type { TripNotifier } from './trip-notifier';
import type { TripDocument } from './trip.types';

@Injectable()
export class NoopTripNotifier implements TripNotifier {
  broadcastTrip(_trip: TripDocument) {}
}
