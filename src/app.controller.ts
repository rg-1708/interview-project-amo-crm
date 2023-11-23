import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ContactsService } from './contacts.service';
import { LeadsService } from './leads.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly contactsService: ContactsService,
    private readonly leadsService: LeadsService,
  ) {}

  @Get()
  handleAmoCodeRequest(
    @Query('code') code: string,
    @Query('client_id') clientId: string,
  ): { status: string } {
    if (code) {
      this.authService.amoCRMTokenRequestByCode(code, clientId);

      return { status: 'OK' };
    } else {
      // Handle missing code parameter
      return { status: 'Error' };
    }
  }

  @Get('/contacts')
  async handleContactsRequest(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('phone') phone: string,
  ): Promise<{ status: string }> {
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);

    // Call your service method with the extracted data
    const response = await this.contactsService.getContacts(name, email, phone);
    this.leadsService.attachLead(response);

    return { status: 'OK' };
  }
}
