import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [
    TripModule,
    ...(process.env.VERCEL
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/',
            exclude: ['/api/(.*)'],
          }),
        ]),
  ],
})
export class AppModule {}
