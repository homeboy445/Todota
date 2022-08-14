import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { WithId } from 'mongodb';
import TodoRouter from './routes/Todo';
import NotesRouter from './routes/Notes';
import SecretsRouter from './routes/Secrets';
import Database from '../database/db';
import Util from '../utility/util';
import process from '../Strings';

export default class Server {
  app: any;

  database: Database;

  constructor() {
    this.app = express();
    this.database = new Database();
  }

  private RegisterMiddleWares() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use((req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*'); // Change this if possible!
      // res.header('Access-Control-Allow-Origin', 'http://localhost:1212/login');
      res.locals.dbLink = this.database;
      next();
    });
    this.app.use('/Todos', TodoRouter);
    this.app.use('/Notes', NotesRouter);
    this.app.use('/Secrets', SecretsRouter);
  }

  private RegisterRoutes() {
    this.app.get('/', (req: any, res: any) => {
      res.json("Server's live!");
    });

    this.app.post('/register', async (req: any, res: any) => {
      const { email, password } = req.body;
      try {
        bcrypt.hash(
          password,
          11,
          async (err: any, hashedPassword: string): Promise<boolean> => {
            if (
              err ||
              !process.env.ACCESS_TOKEN_KEY ||
              !process.env.REFRESH_TOKEN_KEY
            ) {
              res.status(401).json("Something's wrong, try again!");
              return false;
            }
            const userId = uuid();
            const tokens = Util.getJwtToken(jwt, { email, userId });
            let status = true;
            await this.database.db.Users?.find().forEach((user) => {
              if (user.email === email) {
                status = false;
              }
            });
            if (!status) {
              return res.status(405).json('User already exist!');
            }
            const secretKey = crypto.randomBytes(200).toString('base64');
            await this.database.db.Users?.insertOne({
              userId,
              email,
              password: hashedPassword,
              refreshToken: tokens.RefreshToken,
              secretKey,
            });
            return res.json({ ...tokens, secretKey });
          }
        );
      } catch (e) {
        res.sendStatus(500);
      }
    });

    // eslint-disable-next-line consistent-return
    this.app.post('/login', async (req: any, res: any): Promise<void> => {
      const { email, password } = req.body;
      try {
        const userData: Record<string, string> =
          (await this.database.db.Users?.findOne({ email })) || {};
        if (Object.keys(userData).length === 0) {
          return res.status(401).json("User doesn't exist!");
        }
        if (await bcrypt.compare(password, userData?.password || '')) {
          if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
            res.status(500).json("Something's wrong, please try again!");
          }
          const tokens = Util.getJwtToken(jwt, {
            email,
            userId: userData?.userId,
          });
          await this.database.db.Users?.updateOne(
            { email },
            {
              $set: { refreshToken: tokens.RefreshToken },
            }
          );
          return res.json(tokens);
        }
        res.status(401).json('Wrong password!');
      } catch (e) {
        res.sendStatus(500);
      }
    });

    this.app.post(
      '/refresh',
      // eslint-disable-next-line consistent-return
      async (req: any, res: any): Promise<void> => {
        const { email, RefreshToken } = req.body;
        try {
          const userData = await this.database.db.Users?.findOne({ email });
          if (
            userData?.refreshToken !== RefreshToken ||
            !jwt.verify(RefreshToken, process.env.REFRESH_TOKEN_KEY || '')
          ) {
            return res.status(401).json('Error!');
          }
          const tokens = Util.getJwtToken(jwt, email);
          await this.database.db.Users?.updateOne(
            { email },
            {
              $set: { refreshToken: tokens.RefreshToken },
            }
          );
          res.json(tokens);
        } catch (e) {
          res.sendStatus(500);
        }
      }
    );

    this.app.post(
      '/resetPassword',
      // eslint-disable-next-line consistent-return
      async (req: any, res: any): Promise<void> => {
        const { secretKey, email, newPassword } = req.body;
        if (!secretKey || !email || !newPassword) {
          return res.sendStatus(400);
        }
        try {
          let data: any = {};
          await this.database.db.Users?.find({ email }).forEach(
            (i: WithId<Document>): void => {
              data = i;
            }
          );
          if (Object.keys(data).length === 0) {
            return res.sendStatus(404);
          }
          if (data.secretKey !== secretKey) {
            return res.status(403).json("Key doesn't match!");
          }
          // eslint-disable-next-line consistent-return
          bcrypt.hash(
            newPassword,
            11,
            // eslint-disable-next-line consistent-return
            async (err, hashedPassword): Promise<void> => {
              if (err) return res.sendStatus(500);
              const SecretKey = crypto.randomBytes(200).toString('base64');
              await this.database.db.Users?.updateOne(
                { email },
                {
                  $set: { password: hashedPassword, SecretKey },
                }
              );
              res.status(200).json({ SecretKey });
            }
          );
        } catch (e) {
          res.sendStatus(500);
        }
      }
    );
  }

  public run() {
    this.database.connect();
    this.RegisterMiddleWares();
    this.RegisterRoutes();
    this.app.listen(3005, () => {
      // eslint-disable-next-line no-console
      console.log("Server's live at PORT", 3005);
    });
  }

  public async dispose() {
    await this.database.close();
  }
}
