import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TripGateway } from './trip.gateway';
import { NoopTripNotifier } from './noop-trip.notifier';
import { TRIP_NOTIFIER } from './trip-notifier';

const vercel = !!process.env.VERCEL;

@Module({
  controllers: [TripController],
  providers: vercel
    ? [
        TripService,
        NoopTripNotifier,
        { provide: TRIP_NOTIFIER, useExisting: NoopTripNotifier },
      ]
    : [
        TripService,
        TripGateway,
        { provide: TRIP_NOTIFIER, useExisting: TripGateway },
      ],
  exports: [TripService],
})
export class TripModule {}
