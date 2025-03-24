import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@snooze/shared-types';

@Injectable()
export class VoiceService {
  constructor(public prisma: PrismaService) {}
}
