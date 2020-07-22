'use strict'

const { v4: UUIDv4 } = require("uuid"),
    ErrorResponses = require("./constants/errorResponses"),
    SuccessResponses = require("./constants/successResponses"),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken');

let isConnected;
mongoose.Promise = global.Promise;
class Base {

    constructor() {
        this.event = null;
        this.context = null;
    }

    initialize(event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        this.event = event;
        this.context = context;
    }

    createErrorResponse(statusName, message = null, error = null) {
        let status;
        error = typeof error === "string" ? JSON.parse(error) : error;
        if (error && error.status && error.status.code) {
            status = Object.assign({}, error);
        } else {
            status = Object.assign({}, ErrorResponses[statusName]);
            status.status.identifier = this.extractTraceID();
            status.status.date = this.getDate();
            if (message) {
                status.status.message = message
            }
        }
        return JSON.stringify(status);
    }

    createResponse(body = null) {
        if (process.env.IS_OFFLINE) return body;
        let status = Object.assign({}, SuccessResponses["SUCCESS"]);
        status.status.identifier = this.extractTraceID();
        status.status.date = this.getDate();
        if (body) {
            status.body = body;
        }
        return status;
    }

    getDate() {
        let date = new Date();
        return date.toJSON();
    }

    createUUIDv4() {
        return UUIDv4().toString();
    }

    extractTraceID() {
        if (!this.event.headers || !this.event.headers["X-Amzn-Trace-Id"]) {
            return this.createUUIDv4();
        }
        let amzIDHeader = String(this.event.headers["X-Amzn-Trace-Id"]);
        let match = amzIDHeader.match(/^(Root=\d-)+(.*)$/);
        if (!match || !match[2]) {
            return this.createUUIDv4();
        }
        return match[2];
    }

    async connectToDatabase() {
        if (isConnected) {
            return Promise.resolve();
        }
        const db = await mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
        isConnected = db.connections[0].readyState;
    }

    convertObjectId(id) {
        return new mongoose.mongo.ObjectId(id);
    }

    getPayload(token) {
        let decodedToken = jwt.decode(token);
        return decodedToken;
    }
}

module.exports = Base;