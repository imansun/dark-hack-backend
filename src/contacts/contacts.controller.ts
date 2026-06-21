import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './contacts.entity';

@ApiTags('Contacts')
@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit contact',
    description: 'Submit a contact form message from a visitor.',
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Message saved', type: Contact })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List contacts',
    description: 'Returns all contact messages (admin only).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of contacts',
    type: [Contact],
  })
  async findAll(): Promise<Contact[]> {
    return this.contactsService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete contact',
    description: 'Delete a contact message (admin only).',
  })
  @ApiResponse({ status: 204, description: 'Contact deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contactsService.remove(id);
  }
}
