import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { TripDocument } from './trip.types';
import type { TripNotifier } from './trip-notifier';
import { TripService } from './trip.service';

const corsOrigin = process.env.CLIENT_ORIGIN ?? '*';

@WebSocketGateway({
  cors: { origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()) },
  transports: ['websocket', 'polling'],
})
export class TripGateway implements OnGatewayConnection, TripNotifier {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly tripService: TripService) {}

  handleConnection(client: Socket) {
    try {
      client.emit('trip:updated', this.tripService.getTrip());
    } catch {
      client.disconnect(true);
    }
  }

  broadcastTrip(trip: TripDocument) {
    this.server.emit('trip:updated', trip);
  }
}
