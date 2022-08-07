import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseApp, initializeApp } from "firebase/app"

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class FirebaseService {
  static instance: admin.app.App;
  static firebase: FirebaseApp;
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

    FirebaseService.firebase = initializeApp({
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      apiKey: "AIzaSyBwxYR8mCIlBcv38AUjY-WJOP0PR8davdA",
      authDomain: "dmechat-testnet.firebaseapp.com",
      projectId: "dmechat-testnet",
      storageBucket: "dmechat-testnet.appspot.com",
      messagingSenderId: "663814795413",
      appId: "1:663814795413:web:fc21819c28f1fcdb24eb9c"
    });
  }
}