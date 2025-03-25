import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsAdapter } from '@nestjs/platform-ws';
import { CustomWsAdapter } from './custom-ws-adapter';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  // Load SSL/TLS certificate and key
  const httpsOptions = {
    cert: readFileSync(join(__dirname, '..', 'localhost.pem')), // Path to your certificate
    key: readFileSync(join(__dirname, '..', 'localhost-key.pem')), // Path to your private key
  };

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new CustomWsAdapter(app));
  // app.useWebSocketAdapter(new WsAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Snooze API')
    .setDescription('API for a team communication platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
