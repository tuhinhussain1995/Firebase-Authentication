import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins =
    configService.get<string>('ALLOWED_ORIGINS')?.split(',') || '*';

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Add COOP and COEP headers
  app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
bootstrap();
