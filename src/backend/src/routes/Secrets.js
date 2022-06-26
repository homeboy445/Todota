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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = require("../../database/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = express_1.default.Router();
router.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.Database.connect();
    (0, auth_1.default)(req, res, next);
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.body;
    const data = [];
    yield ((_a = db_1.Database.db.Secrets) === null || _a === void 0 ? void 0 : _a.find({ userId }).forEach((i) => {
        const record = i;
        delete record.userId;
        delete record._id;
        record.value = jsonwebtoken_1.default.verify(record.value, process.env.SECRET_KEY || '');
        data.push(record);
    }));
    res.json(data);
}));
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { key, value, userId } = req.body;
    try {
        const jwtData = jsonwebtoken_1.default.sign(value, process.env.SECRET_KEY || '');
        yield ((_b = db_1.Database.db.Secrets) === null || _b === void 0 ? void 0 : _b.insertOne({
            key,
            value: jwtData,
            sid: (0, uuid_1.v4)(),
            userId,
        }));
        res.json('Done!');
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
router.get('/remove/:sid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { sid } = req.params;
    const { userId } = req.body;
    try {
        yield ((_c = db_1.Database.db.Secrets) === null || _c === void 0 ? void 0 : _c.deleteOne({ sid, userId }));
        res.json('Done!');
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
router.delete('removeAll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { userId } = req.body;
    try {
        (_d = db_1.Database.db.Secrets) === null || _d === void 0 ? void 0 : _d.deleteMany({ userId });
        res.json('Done!');
    }
    catch (e) {
        res.status(500).json("Something's wrong, please try again!");
    }
}));
exports.default = router;
