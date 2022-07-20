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
class Database {
    constructor() {
        this.connected = false;
        this.client = new mongodb_1.MongoClient(process.env.URI || '');
        this.db = {
            Users: null,
            Todos: null,
            Notes: null,
            Secrets: null,
        };
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.close(); // Close the session if it's open;
            // NOTE: Make sure to call connect every time you're upto performing any DB operation as it session based;
            try {
                yield this.client.connect();
                this.connected = true;
                const db = this.client.db('Todota');
                this.db.Users = db.collection('Users');
                this.db.Todos = db.collection('Todos');
                this.db.Notes = db.collection('Notes');
                this.db.Secrets = db.collection('Secrets');
                console.log('Database connected successfully!');
            }
            catch (e) {
                console.error('>> ', e);
            }
        });
    }
    close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.client) === null || _a === void 0 ? void 0 : _a.close());
            this.connected = false;
            console.log('Database disconnected!');
        });
    }
    isConnected() {
        return this.connected;
    }
}
exports.default = Database;
