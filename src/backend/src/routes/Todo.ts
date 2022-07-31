import express from 'express';
import { Document } from 'bson';
import { WithId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import {
  CheckAuthAndRetrieveDB,
  extractDBLinkFromResponse,
} from '../../middleware/middleware';

const router = express.Router();
router.use(CheckAuthAndRetrieveDB);

router.get('/', async (req, res) => {
  const { userId } = req.body;
  const Database = extractDBLinkFromResponse(res);
  const data: Array<WithId<Document>> = [];
  try {
    await Database.db.Todos?.find({ userId }).forEach(
      (i: WithId<Document>): void | boolean => {
        const record: any = i;
        delete record.userId;
        // eslint-disable-next-line no-underscore-dangle
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
  const { task, priority, date, tags, userId } = req.body; // NOTE: userId's a custom property which is being saved with JWTificiation;
  const Database = extractDBLinkFromResponse(res);
  try {
    await Database.db.Todos?.insertOne({
      tid: uuid(),
      task,
      date: new Date().toISOString() || date,
      priority,
      tags: tags || [],
      userId,
    });
    res.json({ task, status: 'Done' });
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

// eslint-disable-next-line consistent-return
router.post('/update', async (req, res): Promise<any> => {
  const { tid, task, priority, date, tags, userId } = req.body;
  const Database = extractDBLinkFromResponse(res);
  const obj: Record<string, any> = { tid };
  if (task) obj.task = task;
  if (priority) obj.priority = priority;
  if (date) obj.date = date;
  if (tags) obj.tags = tags;
  if (Object.keys(obj).length < 2) {
    return res.status(400).json('Invalid request!');
  }
  try {
    await Database.db.Todos?.updateOne({ tid, userId }, { $set: obj });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

router.delete('/remove/:tid', async (req, res) => {
  // TODO: put this at halt for now.
  const { tid } = req.params;
  const { userId } = req.body;
  const Database = extractDBLinkFromResponse(res);
  try {
    await Database.db.Todos.deleteOne({ tid, userId });
    res.json('Done!');
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
});

/* router.delete("/removeAll", async (req, res) => {
  const { userId } = req.body;
  try {
    await Database.db.Todos?.deleteMany({ userId });
    res.json("Done!");
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
}); */

export default router;
