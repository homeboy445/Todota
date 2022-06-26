/* eslint-disable */
import 'dotenv/config';
import { Collection, FindCursor, MongoClient, WithId } from 'mongodb';
import { Document } from 'bson';

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
// Singleton Architecture for managing the Database efficiently;
export class Database extends DbUtil {
  static client: MongoClient;

  static url: string;

  static db: {
    Users: Collection | null;
    Todos: Collection | null;
    Notes: Collection | null;
    Secrets: Collection | null;
  };

  static util: DbUtil;

  static async connect() {
    await Database?.close(); // Close the session if it's open;
    // NOTE: Make sure to call connect every time you're upto performing any DB operation as it session based;
    Database.url = process.env.URI || '';
    Database.client = new MongoClient(Database.url);
    try {
      await Database.client.connect();
      const db = Database.client.db('Todota');
      Database.db = { Users: null, Todos: null, Notes: null, Secrets: null };
      Database.db.Users = db.collection('Users');
      Database.db.Todos = db.collection('Todos');
      Database.db.Notes = db.collection('Notes');
      Database.db.Secrets = db.collection('Secrets');
      console.log('Database connected successfully!');
      setTimeout(async () => {
        await Database.close();
      }, 20 * 1000); // So that the DB's instance gets closed automatically in about 20sec!
    } catch (e) {
      console.error(e);
    }
  }

  static async close() {
    await Database.client?.close();
    console.log('Database disconnected!');
  }
}
