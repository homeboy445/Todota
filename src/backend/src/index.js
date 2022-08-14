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
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const Todo_1 = __importDefault(require("./routes/Todo"));
const Notes_1 = __importDefault(require("./routes/Notes"));
const Secrets_1 = __importDefault(require("./routes/Secrets"));
const db_1 = __importDefault(require("../database/db"));
const util_1 = __importDefault(require("../utility/util"));
const Strings_1 = __importDefault(require("../Strings"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.database = new db_1.default();
    }
    RegisterMiddleWares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*'); // Change this if possible!
            // res.header('Access-Control-Allow-Origin', 'http://localhost:1212/login');
            res.locals.dbLink = this.database;
            next();
        });
        this.app.use('/Todos', Todo_1.default);
        this.app.use('/Notes', Notes_1.default);
        this.app.use('/Secrets', Secrets_1.default);
    }
    RegisterRoutes() {
        this.app.get('/', (req, res) => {
            res.json("Server's live!");
        });
        this.app.post('/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                bcryptjs_1.default.hash(password, 11, (err, hashedPassword) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    if (err ||
                        !Strings_1.default.env.ACCESS_TOKEN_KEY ||
                        !Strings_1.default.env.REFRESH_TOKEN_KEY) {
                        res.status(401).json("Something's wrong, try again!");
                        return false;
                    }
                    const userId = (0, uuid_1.v4)();
                    const tokens = util_1.default.getJwtToken(jsonwebtoken_1.default, { email, userId });
                    let status = true;
                    yield ((_a = this.database.db.Users) === null || _a === void 0 ? void 0 : _a.find().forEach((user) => {
                        if (user.email === email) {
                            status = false;
                        }
                    }));
                    if (!status) {
                        return res.status(405).json('User already exist!');
                    }
                    const secretKey = crypto_1.default.randomBytes(200).toString('base64');
                    yield ((_b = this.database.db.Users) === null || _b === void 0 ? void 0 : _b.insertOne({
                        userId,
                        email,
                        password: hashedPassword,
                        refreshToken: tokens.RefreshToken,
                        secretKey,
                    }));
                    return res.json(Object.assign(Object.assign({}, tokens), { secretKey }));
                }));
            }
            catch (e) {
                res.sendStatus(500);
            }
        }));
        // eslint-disable-next-line consistent-return
        this.app.post('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            const { email, password } = req.body;
            try {
                const userData = (yield ((_c = this.database.db.Users) === null || _c === void 0 ? void 0 : _c.findOne({ email }))) || {};
                if (Object.keys(userData).length === 0) {
                    return res.status(401).json("User doesn't exist!");
                }
                if (yield bcryptjs_1.default.compare(password, (userData === null || userData === void 0 ? void 0 : userData.password) || '')) {
                    if (!Strings_1.default.env.ACCESS_TOKEN_KEY || !Strings_1.default.env.REFRESH_TOKEN_KEY) {
                        res.status(500).json("Something's wrong, please try again!");
                    }
                    const tokens = util_1.default.getJwtToken(jsonwebtoken_1.default, {
                        email,
                        userId: userData === null || userData === void 0 ? void 0 : userData.userId,
                    });
                    yield ((_d = this.database.db.Users) === null || _d === void 0 ? void 0 : _d.updateOne({ email }, {
                        $set: { refreshToken: tokens.RefreshToken },
                    }));
                    return res.json(tokens);
                }
                res.status(401).json('Wrong password!');
            }
            catch (e) {
                res.sendStatus(500);
            }
        }));
        this.app.post('/refresh', 
        // eslint-disable-next-line consistent-return
        (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e, _f;
            const { email, RefreshToken } = req.body;
            try {
                const userData = yield ((_e = this.database.db.Users) === null || _e === void 0 ? void 0 : _e.findOne({ email }));
                if ((userData === null || userData === void 0 ? void 0 : userData.refreshToken) !== RefreshToken ||
                    !jsonwebtoken_1.default.verify(RefreshToken, Strings_1.default.env.REFRESH_TOKEN_KEY || '')) {
                    return res.status(401).json('Error!');
                }
                const tokens = util_1.default.getJwtToken(jsonwebtoken_1.default, email);
                yield ((_f = this.database.db.Users) === null || _f === void 0 ? void 0 : _f.updateOne({ email }, {
                    $set: { refreshToken: tokens.RefreshToken },
                }));
                res.json(tokens);
            }
            catch (e) {
                res.sendStatus(500);
            }
        }));
        this.app.post('/resetPassword', 
        // eslint-disable-next-line consistent-return
        (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _g;
            const { secretKey, email, newPassword } = req.body;
            if (!secretKey || !email || !newPassword) {
                return res.sendStatus(400);
            }
            try {
                let data = {};
                yield ((_g = this.database.db.Users) === null || _g === void 0 ? void 0 : _g.find({ email }).forEach((i) => {
                    data = i;
                }));
                if (Object.keys(data).length === 0) {
                    return res.sendStatus(404);
                }
                if (data.secretKey !== secretKey) {
                    return res.status(403).json("Key doesn't match!");
                }
                // eslint-disable-next-line consistent-return
                bcryptjs_1.default.hash(newPassword, 11, 
                // eslint-disable-next-line consistent-return
                (err, hashedPassword) => __awaiter(this, void 0, void 0, function* () {
                    var _h;
                    if (err)
                        return res.sendStatus(500);
                    const SecretKey = crypto_1.default.randomBytes(200).toString('base64');
                    yield ((_h = this.database.db.Users) === null || _h === void 0 ? void 0 : _h.updateOne({ email }, {
                        $set: { password: hashedPassword, SecretKey },
                    }));
                    res.status(200).json({ SecretKey });
                }));
            }
            catch (e) {
                res.sendStatus(500);
            }
        }));
    }
    run() {
        this.database.connect();
        this.RegisterMiddleWares();
        this.RegisterRoutes();
        this.app.listen(3005, () => {
            // eslint-disable-next-line no-console
            console.log("Server's live at PORT", 3005);
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.close();
        });
    }
}
exports.default = Server;
