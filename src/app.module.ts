import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { ApiModule } from './modules/api/api.module';
import { TokenModule } from './modules/token/token.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    CoreModule,
    ApiModule,
    TokenModule,
    MetricsModule,
  ],
})
export class AppModule {}