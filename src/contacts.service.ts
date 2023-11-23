import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';

@Injectable()
export class ContactsService {
  constructor(private readonly authService: AuthService) {
    dotenv.config();
  }

  async createContact(
    name: string,
    phone: string,
    email: string,
    accessToken: string,
  ) {
    const url = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`;

    const newContact = [
      {
        name,
        created_at: Date.now(),
        updated_at: Date.now(),
        custom_fields_values: [
          {
            field_code: 'PHONE',
            field_name: 'Телефон',
            values: [
              {
                value: phone,
                enum_code: 'WORK',
              },
            ],
          },
          {
            field_code: 'EMAIL',
            field_name: 'Почта',
            values: [
              {
                value: email,
                enum_code: 'WORK',
              },
            ],
          },
        ],
      },
    ];

    console.log('creating:', newContact);
    const postConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const postContactResponse = await axios.post(url, newContact, postConfig);
      console.log('Post to contacts response : ', postContactResponse.data);
      return postContactResponse;
    } catch (error) {
      console.log(error.response.data);
      console.log(
        'errors: ',
        error.response.data['validation-errors'][0].errors,
      );
      return null;
    }
  }

  async patchContact(
    name: string,
    phone: string,
    email: string,
    accessToken: string,
    id: string,
  ) {
    const url = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`;
    const newContact = [
      {
        id,
        name,
        updated_at: Date.now(),
        custom_fields_values: [
          {
            field_code: 'PHONE',
            field_name: 'Телефон',
            values: [
              {
                value: phone,
                enum_code: 'WORK',
              },
            ],
          },
          {
            field_code: 'EMAIL',
            field_name: 'Почта',
            values: [
              {
                value: email,
                enum_code: 'WORK',
              },
            ],
          },
        ],
      },
    ];

    console.log('patching:', newContact);
    const postConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const patchContactResponse = await axios.patch(
        url,
        newContact,
        postConfig,
      );
      console.log('patch to contacts response : ', patchContactResponse.data);
      return patchContactResponse.data;
    } catch (error) {
      console.log(error.response.data);
      console.log(error.response.data['validation-errors'][0].errors);
      return null;
    }
  }

  async getContacts(name: string, email: string, phone: string) {
    //add query to link

    const url = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts?query=${email}&query=${phone}`;

    console.log(url);
    const amoCRMTokens = await this.authService.getLatestAmoCRMToken();

    if (amoCRMTokens) {
      const accessToken = amoCRMTokens.access_token;
      const getConfig = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      try {
        const getContactResponse = await axios.get(url, getConfig);

        if (getContactResponse.data === '') {
          try {
            const createContactResponse = await this.createContact(
              name,
              phone,
              email,
              accessToken,
            );
            console.log(
              'created: ',
              createContactResponse['_embedded'].contacts[0],
            );
            return createContactResponse['_embedded'].contacts[0];
          } catch (error) {
            console.log('error: ', error.response.data);
            console.log(
              'errors: ',
              error.response.data['validation-errors'][0].errors,
            );
          }
        }

        console.log(
          'get contacts response: ',
          getContactResponse.data['_embedded'].contacts[0].id,
        );

        try {
          const patchContactResponse = await this.patchContact(
            name,
            phone,
            email,
            accessToken,
            getContactResponse.data['_embedded'].contacts[0].id,
          );
          console.log(
            'patched: ',
            patchContactResponse['_embedded'].contacts[0],
          );
          return patchContactResponse['_embedded'].contacts[0];
        } catch (error) {
          console.log(error.response);
        }
      } catch (error) {
        console.log(error.response);
      }
    } else {
      console.log('No valid AmoCRM token found.');
    }
  }
}
