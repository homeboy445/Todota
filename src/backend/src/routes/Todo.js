"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const middleware_1 = require("../../middleware/middleware");
const router = express_1.default.Router();
router.use(middleware_1.CheckAuthAndRetrieveDB);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.body;
    const Database = (0, middleware_1.extractDBLinkFromResponse)(res);
    const data = [];
    try {
        yield ((_a = Database.db.Todos) === null || _a === void 0 ? void 0 : _a.find({ userId }).forEach((i) => {
            const record = i;
            delete record.userId;
            // eslint-disable-next-line no-underscore-dangle
            delete record._id;
            data.push(record);
        }));
        res.json(data);
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { task, priority, date, tags, userId } = req.body; // NOTE: userId's a custom property which is being saved with JWTificiation;
    const Database = (0, middleware_1.extractDBLinkFromResponse)(res);
    try {
        yield ((_b = Database.db.Todos) === null || _b === void 0 ? void 0 : _b.insertOne({
            tid: (0, uuid_1.v4)(),
            task,
            date: new Date().toISOString() || date,
            priority,
            tags: tags || [],
            userId,
        }));
        res.json({ task, status: 'Done' });
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
// eslint-disable-next-line consistent-return
router.post('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { tid, task, priority, date, tags, userId } = req.body;
    const Database = (0, middleware_1.extractDBLinkFromResponse)(res);
    const obj = { tid };
    if (task)
        obj.task = task;
    if (priority)
        obj.priority = priority;
    if (date)
        obj.date = date;
    if (tags)
        obj.tags = tags;
    if (Object.keys(obj).length < 2) {
        return res.status(400).json('Invalid request!');
    }
    try {
        yield ((_c = Database.db.Todos) === null || _c === void 0 ? void 0 : _c.updateOne({ tid, userId }, { $set: obj }));
        res.json('Done!');
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
router.get('/remove/:tid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: put this at halt for now.
    const { tid } = req.params;
    const { userId } = req.body;
    console.log(tid, ' ', userId);
    res.json('Hello!');
}));
/* router.delete("/removeAll", async (req, res) => {
  const { userId } = req.body;
  try {
    await Database.db.Todos?.deleteMany({ userId });
    res.json("Done!");
  } catch (e) {
    res.status(500).json("Something's wrong, please try again!");
  }
}); */
exports.default = router;
