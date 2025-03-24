import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useWebSocketAdapter(new IoAdapter(app));

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
