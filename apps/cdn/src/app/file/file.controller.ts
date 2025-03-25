import {
  Controller,
  Get,
  Put,
  Param,
  Res,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FileController {
  private readonly uploadDir = join(process.cwd(), 'apps/cdn/uploads');
  private readonly logger: Logger = new Logger(FileController.name);
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ];

  constructor() {
    // Ensure the upload directory exists
    if (!existsSync(this.uploadDir)) {
      this.logger.log(`Creating upload directory at ${this.uploadDir}`);
      try {
        mkdirSync(this.uploadDir, { recursive: true });
      } catch (err) {
        this.logger.error(`Failed to create upload directory: ${err.message}`);
        throw new HttpException(
          'Failed to initialize upload directory',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request (e.g., no data, invalid file type)' })
  @ApiResponse({ status: 409, description: 'File already exists' })
  @ApiResponse({ status: 413, description: 'File size exceeds the maximum limit' })
  @ApiResponse({ status: 500, description: 'Failed to upload file' })
  async uploadFile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    // Validate the 'id' parameter (filename)
    if (!this.isValidFileName(id)) {
      this.logger.warn(`Invalid file name: ${id}`);
      res.status(400).json({ error: 'Invalid file name', details: 'File name contains invalid characters' });
      return;
    }

    const filePath = join(this.uploadDir, id);

    // Check if the file already exists
    if (existsSync(filePath)) {
      this.logger.warn(`File already exists: ${id}`);
      res.status(409).json({ error: 'File already exists' });
      return;
    }

    // Validate Content-Type
    const contentType = req.headers['content-type'];
    if (!contentType || !this.allowedMimeTypes.includes(contentType)) {
      this.logger.warn(`Invalid or unsupported Content-Type: ${contentType}`);
      res.status(400).json({
        error: 'Invalid file type',
        details: `Supported types: ${this.allowedMimeTypes.join(', ')}`,
      });
      return;
    }

    // Track file size
    let fileSize = 0;
    let hasData = false;
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => {
      hasData = true;
      fileSize += chunk.length;
      if (fileSize > this.maxFileSize) {
        req.unpipe(); // Stop piping data to the write stream
        req.destroy(new Error('File size limit exceeded'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!hasData) {
        this.logger.warn('No data uploaded');
        res.status(400).json({ error: 'No data uploaded', details: 'Request body is empty' });
        return;
      }

      const writeStream = createWriteStream(filePath);
      const buffer = Buffer.concat(chunks);

      writeStream.write(buffer);
      writeStream.end();

      writeStream.on('finish', () => {
        this.logger.log(`File uploaded successfully: ${id} (${fileSize} bytes)`);
        res.status(200).json({ ok: true });
      });

      writeStream.on('error', (err) => {
        this.logger.error(`Failed to write file ${id}: ${err.message}`);
        res.status(500).json({ error: 'Failed to upload file', details: err.message });
      });
    });

    req.on('error', (err) => {
      if (err.message === 'File size limit exceeded') {
        this.logger.warn(`File size limit exceeded for ${id}: ${fileSize} bytes`);
        res.status(413).json({
          error: 'File size limit exceeded',
          details: `Maximum file size is ${this.maxFileSize / (1024 * 1024)}MB`,
        });
      } else {
        this.logger.error(`Upload error for ${id}: ${err.message}`);
        res.status(500).json({ error: 'Failed to upload file', details: err.message });
      }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a file' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    // Validate the 'id' parameter (filename)
    if (!this.isValidFileName(id)) {
      this.logger.warn(`Invalid file name: ${id}`);
      throw new HttpException(
        'Invalid file name: File name contains invalid characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    const filePath = join(this.uploadDir, id);

    if (!existsSync(filePath)) {
      this.logger.warn(`File not found: ${id}`);
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const fileBuffer = readFileSync(filePath);
    this.logger.log(`File retrieved: ${id} (${fileBuffer.length} bytes)`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(fileBuffer);
  }

  // Helper method to validate file names
  private isValidFileName(fileName: string): boolean {
    // Disallow path traversal characters and other invalid characters
    const invalidChars = /[\/\\:*?"<>|]/;
    return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255;
  }
}
