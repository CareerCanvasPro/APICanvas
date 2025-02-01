import { Module, Global } from '@nestjs/common';
import { MetricsService } from './services/metrics.service';

@Global()
@Module({
  providers: [
    MetricsService
  ],
  exports: [
    MetricsService
  ],
})
export class CoreModule {}