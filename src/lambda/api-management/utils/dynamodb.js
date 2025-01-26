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
exports.dynamoDBService = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamodb = new aws_sdk_1.DynamoDB.DocumentClient();
exports.dynamoDBService = {
    put(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return dynamodb.put(params).promise();
        });
    },
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return dynamodb.get(params).promise();
        });
    },
    scan(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return dynamodb.scan(params).promise();
        });
    },
    delete(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return dynamodb.delete(params).promise();
        });
    }
};
