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
exports.handler = void 0;
const uuid_1 = require("uuid");
const dynamodb_1 = require("./utils/dynamodb");
const APIS_TABLE = process.env.APIS_TABLE;
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (event.httpMethod) {
            case 'GET':
                return yield handleGetAPIs();
            case 'POST':
                return yield handleCreateAPI(event);
            case 'PUT':
                return yield handleUpdateAPI(event);
            case 'DELETE':
                return yield handleDeleteAPI(event);
            default:
                return {
                    statusCode: 405,
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
});
exports.handler = handler;
function handleGetAPIs() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield dynamodb_1.dynamoDBService.scan({
            TableName: APIS_TABLE
        });
        return {
            statusCode: 200,
            body: JSON.stringify({
                apis: result.Items
            })
        };
    });
}
function handleCreateAPI(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const body = JSON.parse(event.body || '{}');
        if (!body.name || !body.endpoint || !body.method) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields: name, endpoint, method'
                })
            };
        }
        const api = {
            id: (0, uuid_1.v4)(),
            name: body.name,
            endpoint: body.endpoint,
            method: body.method.toUpperCase(),
            status: 'active',
            created_at: new Date().toISOString(),
            config: {
                rateLimit: ((_a = body.config) === null || _a === void 0 ? void 0 : _a.rateLimit) || 100,
                cacheDuration: ((_b = body.config) === null || _b === void 0 ? void 0 : _b.cacheDuration) || 0,
                timeout: ((_c = body.config) === null || _c === void 0 ? void 0 : _c.timeout) || 29000
            }
        };
        yield dynamodb_1.dynamoDBService.put({
            TableName: APIS_TABLE,
            Item: api
        });
        return {
            statusCode: 201,
            body: JSON.stringify(api)
        };
    });
}
function handleUpdateAPI(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const apiId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        if (!apiId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'API ID is required' })
            };
        }
        const body = JSON.parse(event.body || '{}');
        // Check if API exists
        const existingApi = yield dynamodb_1.dynamoDBService.get({
            TableName: APIS_TABLE,
            Key: { id: apiId }
        });
        if (!existingApi.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'API not found' })
            };
        }
        const updatedApi = Object.assign(Object.assign({}, existingApi.Item), { name: body.name || existingApi.Item.name, endpoint: body.endpoint || existingApi.Item.endpoint, method: body.method ? body.method.toUpperCase() : existingApi.Item.method, status: body.status || existingApi.Item.status, config: {
                rateLimit: ((_b = body.config) === null || _b === void 0 ? void 0 : _b.rateLimit) || existingApi.Item.config.rateLimit,
                cacheDuration: ((_c = body.config) === null || _c === void 0 ? void 0 : _c.cacheDuration) || existingApi.Item.config.cacheDuration,
                timeout: ((_d = body.config) === null || _d === void 0 ? void 0 : _d.timeout) || existingApi.Item.config.timeout
            } });
        yield dynamodb_1.dynamoDBService.put({
            TableName: APIS_TABLE,
            Item: updatedApi
        });
        return {
            statusCode: 200,
            body: JSON.stringify(updatedApi)
        };
    });
}
function handleDeleteAPI(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const apiId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        if (!apiId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'API ID is required' })
            };
        }
        // Check if API exists
        const existingApi = yield dynamodb_1.dynamoDBService.get({
            TableName: APIS_TABLE,
            Key: { id: apiId }
        });
        if (!existingApi.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'API not found' })
            };
        }
        yield dynamodb_1.dynamoDBService.delete({
            TableName: APIS_TABLE,
            Key: { id: apiId }
        });
        return {
            statusCode: 204,
            body: ''
        };
    });
}
