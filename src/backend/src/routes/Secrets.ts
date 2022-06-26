import 'dotenv/config';
import express, { request } from 'express';
import { WithId, Document } from 'mongodb';
import { Database } from '../../database/db';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import authenticate from '../../middleware/auth';

const router = express.Router();

router.use(async (req, res, next) => {
  await Database.connect();
  authenticate(req, res, next);
});

router.get('/', async (req, res) => {
  const { userId } = req.body;
  const data: Array<WithId<Document>> = [];
  await Database.db.Secrets?.find({ userId }).forEach(
    (i: WithId<Document>): void | boolean => {
      const record: any = i;
      delete record.userId;
      delete record._id;
      record.value = jwt.verify(record.value, process.env.SECRET_KEY || '');
      data.push(record);
    }
  );
  res.json(data);
});

router.post('/add', async (req, res) => {
  const { key, value, userId } = req.body;
  try {
    const jwtData = jwt.sign(value, process.env.SECRET_KEY || '');
    await Database.db.Secrets?.insertOne({
      key,
      value: jwtData,
      sid: uuid(),
      userId,
    });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.get('/remove/:sid', async (req, res) => {
  const { sid } = req.params;
  const { userId } = req.body;
  try {
    await Database.db.Secrets?.deleteOne({ sid, userId });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.delete('removeAll', async (req, res) => {
  const { userId } = req.body;
  try {
    Database.db.Secrets?.deleteMany({ userId });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

export default router;
