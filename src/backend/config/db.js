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
// Singleton Architecture for managing the Database efficiently;
class Database extends DbUtil {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (Database === null || Database === void 0 ? void 0 : Database.close()); // Close the session if it's open;
            // NOTE: Make sure to call connect every time you're upto performing any DB operation as it session based;
            Database.url = process.env.URI || '';
            Database.client = new mongodb_1.MongoClient(Database.url);
            try {
                yield Database.client.connect();
                const db = Database.client.db('Todota');
                Database.db = { Users: null, Todos: null, Notes: null, Secrets: null };
                Database.db.Users = db.collection('Users');
                Database.db.Todos = db.collection('Todos');
                Database.db.Notes = db.collection('Notes');
                Database.db.Secrets = db.collection('Secrets');
                console.log('Database connected successfully!');
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    yield Database.close();
                }), 20 * 1000); // So that the DB's instance gets closed automatically in about 20sec!
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    static close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = Database.client) === null || _a === void 0 ? void 0 : _a.close());
            console.log('Database disconnected!');
        });
    }
}
exports.Database = Database;
