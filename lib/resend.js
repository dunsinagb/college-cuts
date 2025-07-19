"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
var resend_1 = require("resend");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
exports.resend = resend;
