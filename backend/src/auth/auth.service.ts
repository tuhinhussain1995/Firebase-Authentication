import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly secretKey: string;
  private readonly telegramSecretKey: Buffer;

  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {
    this.secretKey =
      this.configService.get<string>('SECRET_KEY') ||
      '7f05cb5444328732bd837071291f5d3e3b1911a9d514449fd9de30be0175418ceb8587a0c7828d4bc36ff8c9aedb5b14294fae5b2fef047a1d5e8f1beb4899ec';

    this.telegramSecretKey = crypto
      .createHash('sha256')
      .update(this.configService.get<string>('TELEGRAM_BOT_TOKEN'))
      .digest();
  }

  async verifyToken(idToken: string, provider: string) {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    let providerData: any = {
      provider,
      uid,
    };

    if (provider === 'twitter') {
      const { twitter } =
        decodedToken.firebase.sign_in_provider === 'twitter.com'
          ? decodedToken
          : { twitter: {} };

      providerData = {
        ...providerData,
        username: twitter?.screen_name,
        displayName: twitter?.name,
        photoUrl: twitter?.profile_image_url,
      };
    } else if (provider === 'google') {
      const { google } =
        decodedToken.firebase.sign_in_provider === 'google.com'
          ? decodedToken
          : { google: {} };

      providerData = {
        ...providerData,
        email: google?.email,
        displayName: google?.name,
        photoUrl: google?.picture,
      };
    } else if (provider === 'facebook') {
      const { facebook } =
        decodedToken.firebase.sign_in_provider === 'facebook.com'
          ? decodedToken
          : { facebook: {} };

      providerData = {
        ...providerData,
        email: facebook?.email,
        displayName: facebook?.name,
        photoUrl: facebook?.picture?.data?.url,
      };
    } else if (provider === 'anonymous') {
      providerData.isAnonymous = true;
    }

    const sessionToken = this.generateSessionToken(uid, providerData);
    return { sessionToken };
  }

  async verifyTelegramAuth(data: any) {
    const { hash, ...authData } = data;

    const sortedData = Object.keys(authData)
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join('\n');

    const calculatedHash = crypto
      .createHmac('sha256', this.telegramSecretKey)
      .update(sortedData)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new Error('Invalid authentication');
    }

    const sessionToken = this.generateSessionToken(authData.id, {
      provider: 'telegram',
      username: authData.username,
      firstName: authData.first_name,
      lastName: authData.last_name,
      photoUrl: authData.photo_url,
      authDate: authData.auth_date,
    });

    return {
      sessionToken,
      user: {
        id: authData.id,
        username: authData.username,
        firstName: authData.first_name,
        lastName: authData.last_name,
        photoUrl: authData.photo_url,
      },
    };
  }

  async verifyAnonymousAuth(idToken: string) {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const sessionToken = this.generateSessionToken(uid, {
      provider: 'anonymous',
      isAnonymous: true,
    });

    return {
      sessionToken,
      user: {
        id: uid,
        isAnonymous: true,
      },
    };
  }

  private generateSessionToken(uid: string, providerData: any = {}) {
    const payload = {
      uid,
      provider: providerData.provider,
      ...providerData,
    };

    return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
  }
}
