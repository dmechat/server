import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class FirebaseService {
  static instance: admin.app.App;
  constructor(private readonly logger: Logger) {

  }
  init() {
    if (FirebaseService.instance) {
      throw new Error("FirebaseService is already initialized");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    FirebaseService.instance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
}