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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
/* eslint-disable */
require("dotenv/config");
const mongodb_1 = require("mongodb");
class DbUtil {
    parseFindAndGetResults(target) {
        return new Promise((resolve, reject) => {
            try {
                const result = [];
                target.forEach((i) => {
                    result.push(i);
                });
                resolve(result);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
class Database extends DbUtil {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Database.close(); // Close the session if it's open;
            // NOTE: Make sure to call connect every time you're upto performing any DB operation as it session based;
            try {
                Database.url = process.env.URI || '';
                Database.client = new mongodb_1.MongoClient(Database.url);
                yield Database.client.connect();
                const db = Database.client.db('Todota');
                Database.db = { Users: null, Todos: null, Notes: null, Secrets: null };
                Database.db.Users = db.collection('Users');
                Database.db.Todos = db.collection('Todos');
                Database.db.Notes = db.collection('Notes');
                Database.db.Secrets = db.collection('Secrets');
                console.log('Database connected successfully!');
            }
            catch (e) {
                console.error('>> ', e);
            }
        });
    }
    static close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = Database.client) === null || _a === void 0 ? void 0 : _a.close());
        });
    }
}
exports.Database = Database;
