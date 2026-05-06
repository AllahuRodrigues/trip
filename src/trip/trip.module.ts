import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TripGateway } from './trip.gateway';

@Module({
  controllers: [TripController],
  providers: [TripService, TripGateway],
  exports: [TripService],
})
export class TripModule {}
