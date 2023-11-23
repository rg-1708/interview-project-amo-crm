import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';

@Injectable()
export class LeadsService {
  constructor(private readonly authService: AuthService) {
    dotenv.config();
  }

  async attachLead(contact: any) {
    const url = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`;
    const amoCRMTokens = await this.authService.getLatestAmoCRMToken();

    if (amoCRMTokens) {
      const accessToken = amoCRMTokens.access_token;
      const postConfig = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      console.log(contact);
      const data = [
        {
          name: 'sdelka_TEST',
          price: 0,
          created_by: contact.account_id,
          _embedded: { contacts: [{ id: contact.id }] },
        },
      ];
      console.log(data);

      try {
        const getContactResponse = await axios.post(url, data, postConfig);
        console.log('LEAD: ', getContactResponse.data['_embedded']);
      } catch (error) {
        console.log(error.response.data['validation-errors'][0].errors);
      }
    } else {
      console.log('No valid AmoCRM token found.');
    }
  }
}
