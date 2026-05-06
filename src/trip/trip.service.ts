import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { Redis } from '@upstash/redis';
import type { TripDocument } from './trip.types';
import { createDefaultTrip } from './trip.seed';

const STATE_FILE =
  process.env.TRIP_STATE_PATH ?? join(process.cwd(), 'data', 'trip-state.json');

const REDIS_KEY = process.env.TRIP_REDIS_KEY ?? 'trip:document';

function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

@Injectable()
export class TripService implements OnModuleInit {
  private trip: TripDocument | null = null;
  private readonly redis = redisClient();

  async onModuleInit() {
    await this.load();
    await this.ensureRevision();
  }

  getTrip(): TripDocument {
    if (!this.trip) {
      throw new Error('Trip not initialized');
    }
    return this.trip;
  }

  async replaceTrip(next: TripDocument): Promise<TripDocument> {
    this.assertTripShape(next);
    next.updatedAt = new Date().toISOString();
    this.trip = next;
    await this.persist();
    return this.trip;
  }

  private async load(): Promise<void> {
    if (this.redis) {
      try {
        const raw = await this.redis.get<string>(REDIS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TripDocument;
          this.assertTripShape(parsed);
          this.trip = parsed;
          return;
        }
      } catch (e) {
        console.warn('Redis load failed, falling back to seed:', e);
      }
      this.trip = createDefaultTrip();
      await this.persist();
      return;
    }

    try {
      const diskRaw = await fs.readFile(STATE_FILE, 'utf8');
      const parsed = JSON.parse(diskRaw) as TripDocument;
      this.assertTripShape(parsed);
      this.trip = parsed;
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e ? (e as NodeJS.ErrnoException).code : '';
      if (code !== 'ENOENT') {
        console.warn('Could not read trip state, seeding defaults:', e);
      }
      this.trip = createDefaultTrip();
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    if (!this.trip) return;

    if (this.redis) {
      await this.redis.set(REDIS_KEY, JSON.stringify(this.trip));
      return;
    }

    if (process.env.VERCEL) {
      console.warn(
        '[trip] VERCEL without UPSTASH_REDIS_REST_* — state only lives in this function instance and resets often. Add Upstash Redis env vars in Vercel.',
      );
      return;
    }

    await mkdir(dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(this.trip, null, 2), 'utf8');
  }

  /** Ensures updatedAt exists for polling / optimistic concurrency in the UI. */
  private async ensureRevision(): Promise<void> {
    if (!this.trip || this.trip.updatedAt) {
      return;
    }
    this.trip.updatedAt = new Date().toISOString();
    await this.persist();
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
    for (const m of doc.mustDos) {
      if (typeof m.estimatedCost !== 'number' || Number.isNaN(m.estimatedCost)) {
        m.estimatedCost = 0;
      }
    }
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
