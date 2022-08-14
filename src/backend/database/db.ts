/* eslint-disable */
import 'dotenv/config';
import { Collection, FindCursor, MongoClient, WithId } from 'mongodb';
import { Document } from 'bson';
import process from '../Strings';

class DbUtil {
  parseFindAndGetResults(
    target: FindCursor<WithId<Document>>
  ): Promise<Array<WithId<Document>>> {
    return new Promise((resolve, reject) => {
      try {
        const result: Array<WithId<Document>> = [];
        target.forEach((i: WithId<Document>) => {
          result.push(i);
        });
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default class Database {
  connected: Boolean;

  client: MongoClient;

  db: {
    Users: Collection | null;
    Todos: Collection | null;
    Notes: Collection | null;
    Secrets: Collection | null;
  };

  constructor() {
    this.connected = false;
    this.client = new MongoClient(process.env.URI || '');
    this.db = {
      Users: null,
      Todos: null,
      Notes: null,
      Secrets: null,
    };
  }

  async connect() {
    await this.close(); // Close the session if it's open;
    // NOTE: Make sure to call connect every time you're upto performing any DB operation as it session based;
    try {
      await this.client.connect();
      this.connected = true;
      const db = this.client.db('Todota');
      this.db.Users = db.collection('Users');
      this.db.Todos = db.collection('Todos');
      this.db.Notes = db.collection('Notes');
      this.db.Secrets = db.collection('Secrets');
      console.log('Database connected successfully!');
    } catch (e) {
      console.error('>> ', e);
    }
  }

  async close() {
    await this.client?.close();
    this.connected = false;
    console.log('Database disconnected!');
  }

  isConnected() {
    return this.connected;
  }
}
