import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelModule } from '../channel/channel.module';
import { ServerModule } from '../server/server.module';
import { VoiceModule } from '../voice/voice.module';
import { WhiteboardsModule } from '../whiteboards/whiteboards.module';

@Module({
    imports: [ChatModule, AuthModule, ChannelModule, ServerModule],
    providers: [PrismaService],
})
export class AppModule {}
