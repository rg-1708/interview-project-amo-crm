import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { AmoCRMInfo } from 'model/entities/amoCRMInfo.entity';
import { AmoCRMToken } from 'model/entities/amoCRMToken.entity';

import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AmoCRMToken)
    private readonly amoCRMTokenRepository: Repository<AmoCRMToken>,
    @InjectRepository(AmoCRMInfo)
    private readonly amoCRMInfoRepository: Repository<AmoCRMInfo>,
  ) {
    dotenv.config();
  }

  async amoCRMTokenRequestByCode(code: string, client_id: string) {
    const amoCRMUrl = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`;

    const clientSecret = process.env.NEST_AMO_CRM_SECRET_KEY;

    const amoCRMInfo = this.amoCRMInfoRepository.create({ code, client_id });
    const savedInfo = await this.amoCRMInfoRepository.save(amoCRMInfo);

    const payload = {
      client_id,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://863d-185-156-120-204.ngrok-free.app',
    };

    try {
      console.log('Payload : ', payload);
      const response = await axios.post(amoCRMUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('AmoCRM Response:', response.data);

      // Saving the response data to the database
      const amoCRMToken = this.amoCRMTokenRepository.create(response.data);
      const savedToken = await this.amoCRMTokenRepository.save(amoCRMToken);

      return response.data;
    } catch (error) {
      console.error('Error: ', error.response?.data || error.message);
    }
  }

  async amoCRMRefreshToken() {
    const { client_id } = await this.getLatestAmoCRMInfo();
    const { refresh_token } = await this.getLatestAmoCRMToken();

    const amoCRMUrl = `https://${process.env.NEST_AMO_CRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`;
    const clientSecret = process.env.NEST_AMO_CRM_SECRET_KEY;
    const payload = {
      client_id,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token,
      redirect_uri: 'https://863d-185-156-120-204.ngrok-free.app',
    };

    const response = await axios.post(amoCRMUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Saving the response data to the database
    const amoCRMToken = this.amoCRMTokenRepository.create(response.data);
    const savedToken = await this.amoCRMTokenRepository.save(amoCRMToken);

    console.log('AmoCRM Response:', response.data);
  }

  async getLatestAmoCRMToken(): Promise<AmoCRMToken | null> {
    return this.amoCRMTokenRepository.findOne({
      order: {
        createdAt: 'DESC', // Replace with the actual timestamp field
      },
    });
  }

  async getLatestAmoCRMInfo(): Promise<AmoCRMInfo | null> {
    return this.amoCRMInfoRepository.findOne({
      order: {
        createdAt: 'DESC', // Replace with the actual timestamp field
      },
    });
  }
}
