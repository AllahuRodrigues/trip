import {
  Body,
  Controller,
  Get,
  Put,
  BadRequestException,
  Inject,
  Header,
} from '@nestjs/common';
import type { TripDocument } from './trip.types';
import { TripService } from './trip.service';
import { TRIP_NOTIFIER, type TripNotifier } from './trip-notifier';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    @Inject(TRIP_NOTIFIER) private readonly tripNotifier: TripNotifier,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getTrip(): TripDocument {
    return this.tripService.getTrip();
  }

  @Put()
  @Header('Cache-Control', 'no-store')
  async saveTrip(@Body() body: unknown): Promise<TripDocument> {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body must be a trip object');
    }
    try {
      const saved = await this.tripService.replaceTrip(body as TripDocument);
      this.tripNotifier.broadcastTrip(saved);
      return saved;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid trip';
      throw new BadRequestException(msg);
    }
  }
}
