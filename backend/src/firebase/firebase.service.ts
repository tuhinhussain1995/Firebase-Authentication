import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class FirebaseService {
  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(join(process.cwd(), 'jw-social-key.json'), 'utf-8'),
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async verifyIdToken(idToken: string) {
    return admin.auth().verifyIdToken(idToken);
  }
}
