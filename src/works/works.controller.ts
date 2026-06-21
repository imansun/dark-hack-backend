import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorksService } from './works.service';
import { Work } from './works.entity';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import {
  checkExtension,
  checkMimeType,
  sanitizeFilename,
  validateUploadedFile,
  validateSvgSafety,
} from '../common/file-validation.util';

const fileFilter = (_req, file, cb) => {
  if (!checkExtension(file.originalname)) {
    return cb(
      new BadRequestException(
        'Only images (jpg, png, gif, webp, svg) and PDF files are allowed.',
      ),
      false,
    );
  }
  if (!checkMimeType(file.mimetype)) {
    return cb(new BadRequestException('Invalid file type.'), false);
  }
  cb(null, true);
};

const uploadConfig = {
  storage: diskStorage({
    destination: './uploads/works',
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      const safeName = sanitizeFilename(file.originalname);
      const uniqueName = `${Date.now()}-${safeName}${ext}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
};

const multipartFormSchema = (required: string[]) => ({
  schema: {
    type: 'object',
    required,
    properties: {
      title: { type: 'string', description: 'Project title (Persian)' },
      title_en: { type: 'string', description: 'Project title (English)' },
      title_ar: { type: 'string', description: 'Project title (Arabic)' },
      description: {
        type: 'string',
        description: 'Project description (Persian)',
      },
      description_en: {
        type: 'string',
        description: 'Project description (English)',
      },
      description_ar: {
        type: 'string',
        description: 'Project description (Arabic)',
      },
      projectUrl: { type: 'string', description: 'Live project URL' },
      badges: {
        type: 'string',
        description: 'JSON array or comma-separated, e.g. ["HTML","CSS"]',
      },
      image: {
        type: 'string',
        format: 'binary',
        description:
          'Project screenshot or PDF (jpg, png, gif, webp, svg, pdf)',
      },
    },
  },
});

@ApiTags('Works')
@Controller('api/works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ApiOperation({
    summary: 'List works',
    description:
      'Returns all portfolio works with their badges, ordered by newest first.',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['fa', 'en', 'ar'],
    description: 'Filter fields by language',
  })
  @ApiResponse({ status: 200, description: 'List of works', type: [Work] })
  async getWorks(@Query('lang') lang?: string): Promise<Work[]> {
    return this.worksService.findAll(lang);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get work by ID',
    description: 'Returns a single work with its badges.',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['fa', 'en', 'ar'],
    description: 'Filter fields by language',
  })
  @ApiResponse({ status: 200, description: 'Work found', type: Work })
  @ApiResponse({ status: 404, description: 'Work not found' })
  async getWork(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ): Promise<Work> {
    return this.worksService.findOne(id, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create work',
    description:
      'Create a new portfolio work with an optional image or PDF and badges.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartFormSchema(['title']))
  @ApiResponse({ status: 201, description: 'Work created', type: Work })
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async create(
    @Body() dto: CreateWorkDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Work> {
    const imagePath = file ? `/uploads/works/${file.filename}` : undefined;

    if (file) {
      const filePath = `./uploads/works/${file.filename}`;
      const { ok, error } = await validateUploadedFile(filePath);
      if (!ok) throw new BadRequestException(error || 'Invalid file content');

      if (extname(file.filename).toLowerCase() === '.svg') {
        const safe = await validateSvgSafety(filePath);
        if (!safe)
          throw new BadRequestException('SVG file contains unsafe content');
      }
    }

    return this.worksService.create(dto, imagePath);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update work',
    description:
      'Update an existing portfolio work. Upload a new image or PDF to replace the old one.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartFormSchema([]))
  @ApiResponse({ status: 200, description: 'Work updated', type: Work })
  @ApiResponse({ status: 404, description: 'Work not found' })
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Work> {
    const imagePath = file ? `/uploads/works/${file.filename}` : undefined;

    if (file) {
      const filePath = `./uploads/works/${file.filename}`;
      const { ok, error } = await validateUploadedFile(filePath);
      if (!ok) throw new BadRequestException(error || 'Invalid file content');

      if (extname(file.filename).toLowerCase() === '.svg') {
        const safe = await validateSvgSafety(filePath);
        if (!safe)
          throw new BadRequestException('SVG file contains unsafe content');
      }
    }

    return this.worksService.update(id, dto, imagePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete work',
    description: 'Delete a work and its associated image file.',
  })
  @ApiResponse({ status: 204, description: 'Work deleted' })
  @ApiResponse({ status: 404, description: 'Work not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.worksService.remove(id);
  }
}
