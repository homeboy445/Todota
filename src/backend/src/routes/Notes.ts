import express from 'express';
import { Document, WithId } from 'mongodb';
import { Database } from '../../database/db';
import { v4 as uuid } from 'uuid';
import authenticate from '../../middleware/auth';

const router = express.Router();

router.use(async (req, res, next) => {
  await Database.connect();
  authenticate(req, res, next);
});

router.get('/', async (req, res) => {
  const { userId } = req.body;
  const data: Array<WithId<Document>> = [];
  try {
    await Database.db.Notes?.find({ userId }).forEach(
      (i: WithId<Document>): void | boolean => {
        const record: any = i;
        delete record.userId;
        delete record._id;
        data.push(record);
      }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.post('/add', async (req, res) => {
  const { description, tags, date, userId } = req.body;
  try {
    await Database.db.Notes?.insertOne({
      userId,
      description: description || '',
      tags: tags || [],
      date: date || new Date().toISOString(),
      nid: uuid(),
    });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.post('/update', async (req, res) => {
  const { nid, description, tags, date, userId } = req.body;
  const obj: Record<string, string> = { nid };
  if (description) obj['description'] = description;
  if (tags) obj['tags'] = tags;
  if (date) obj['date'] = date;
  if (Object.keys(obj).length <= 2) {
    return res.status(400).json('Invalid request!');
  }
  try {
    await Database.db.Notes?.updateOne(
      {
        nid,
        userId,
      },
      {
        $set: obj,
      }
    );
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.get('/remove/:nid', async (req, res) => {
  const { nid } = req.params;
  const { userId } = req.body;
  try {
    await Database.db.Notes?.deleteOne({
      nid: nid,
      userId,
    });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.delete('/removeAll', async (req, res) => {
  const { userId } = req.body;
  try {
    await Database.db.Notes?.deleteMany({ userId });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

export default router;
