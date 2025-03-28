import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsAdapter } from '@nestjs/platform-ws';
import { CustomWsAdapter } from './custom-ws-adapter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { WhiteboardsModule } from './whiteboards/whiteboards.module';
import { VoiceModule } from './voice/voice.module';

async function bootstrap() {
  // Load SSL/TLS certificate and key
  const httpsOptions = {
    cert: readFileSync(join(__dirname, '..', 'localhost.pem')), // Path to your certificate
    key: readFileSync(join(__dirname, '..', 'localhost-key.pem')), // Path to your private key
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions
  });

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

  const voiceApp = await NestFactory.create(VoiceModule, {
    httpsOptions
  });

  voiceApp.enableCors();
  voiceApp.useWebSocketAdapter(new CustomWsAdapter(voiceApp));
  // app.useWebSocketAdapter(new WsAdapter(app));

  await voiceApp.listen(3030);

  const whiteboardApp = await NestFactory.create(WhiteboardsModule, {
    httpsOptions
  });

  whiteboardApp.enableCors();
  whiteboardApp.useWebSocketAdapter(new CustomWsAdapter(whiteboardApp));
  // app.useWebSocketAdapter(new WsAdapter(app));

  await whiteboardApp.listen(3040);
}
bootstrap();
