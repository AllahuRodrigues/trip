import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import type { TripDocument } from './trip.types';
import { createDefaultTrip } from './trip.seed';

const STATE_FILE =
  process.env.TRIP_STATE_PATH ?? join(process.cwd(), 'data', 'trip-state.json');

@Injectable()
export class TripService implements OnModuleInit {
  private trip: TripDocument | null = null;

  async onModuleInit() {
    await this.load();
  }

  getTrip(): TripDocument {
    if (!this.trip) {
      throw new Error('Trip not initialized');
    }
    return this.trip;
  }

  async replaceTrip(next: TripDocument): Promise<TripDocument> {
    this.assertTripShape(next);
    this.trip = next;
    await this.persist();
    return this.trip;
  }

  private async load(): Promise<void> {
    try {
      const raw = await fs.readFile(STATE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as TripDocument;
      this.assertTripShape(parsed);
      this.trip = parsed;
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? (e as NodeJS.ErrnoException).code : '';
      if (code !== 'ENOENT') {
        console.warn('Could not read trip state, seeding defaults:', e);
      }
      this.trip = createDefaultTrip();
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    if (!this.trip) return;
    await mkdir(dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(this.trip, null, 2), 'utf8');
  }

  private assertTripShape(doc: TripDocument): void {
    if (
      !doc ||
      typeof doc !== 'object' ||
      typeof doc.id !== 'string' ||
      !doc.budget ||
      typeof doc.budget.total !== 'number'
    ) {
      throw new Error('Invalid trip payload');
    }
    if (!Array.isArray(doc.itineraryDays)) doc.itineraryDays = [];
    if (!Array.isArray(doc.budget.items)) doc.budget.items = [];
    if (!Array.isArray(doc.mustDos)) doc.mustDos = [];
    if (!Array.isArray(doc.travelers)) doc.travelers = [];
    if (!doc.options) {
      doc.options = {
        airbnbInterested: null,
        carRoadTripInterested: null,
        lodgingNotes: '',
        transportNotes: '',
      };
    }
  }
}
