import {
  Body,
  Controller,
  Get,
  Put,
  BadRequestException,
} from '@nestjs/common';
import type { TripDocument } from './trip.types';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripGateway: TripGateway,
  ) {}

  @Get()
  getTrip(): TripDocument {
    return this.tripService.getTrip();
  }

  @Put()
  async saveTrip(@Body() body: unknown): Promise<TripDocument> {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body must be a trip object');
    }
    try {
      const saved = await this.tripService.replaceTrip(body as TripDocument);
      this.tripGateway.broadcastTrip(saved);
      return saved;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid trip';
      throw new BadRequestException(msg);
    }
  }
}
