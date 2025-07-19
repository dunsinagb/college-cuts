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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var supabase_js_1 = require("@supabase/supabase-js");
var resend_1 = require("../lib/resend");
var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
var SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
function sendWelcomeEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, resend_1.resend.emails.send({
                            from: 'CollegeCuts Tracker <onboarding@resend.dev>',
                            to: [email],
                            subject: 'Welcome to CollegeCuts Tracker!',
                            html: "\n        <h2>Welcome to CollegeCuts Tracker \uD83C\uDF93</h2>\n        <p>Thank you for subscribing! You now have full access to the most comprehensive database of college program cuts, closures, and institutional changes in the U.S.</p>\n        <ul>\n          <li>\uD83D\uDD0E Explore all program cuts and closures</li>\n          <li>\uD83D\uDCCA Access analytics and trends</li>\n          <li>\uD83D\uDCA1 Get real-time updates</li>\n        </ul>\n        <p>We\u2019re glad to have you on board.<br/>\u2014 The CollegeCuts Team</p>\n      "
                        })];
                case 1:
                    _a.sent();
                    console.log("\u2705 Welcome email sent to ".concat(email));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("\u274C Failed to send email to ".concat(email, ":"), err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
async function sendTestEmail() {
  try {
    await resend_1.resend.emails.send({
      from: 'CollegeCuts Tracker <onboarding@resend.dev>',
      to: ['wisdomuwaifo@gmail.com'],
      subject: 'Welcome to CollegeCuts Tracker!',
      html: `
        <h2>Welcome to CollegeCuts Tracker 🎓</h2>
        <p>Thank you for subscribing! You now have full access to the most comprehensive database of college program cuts, closures, and institutional changes in the U.S.</p>
        <ul>
          <li>🔎 Explore all program cuts and closures</li>
          <li>📊 Access analytics and trends</li>
          <li>💡 Get real-time updates</li>
        </ul>
        <p>We’re glad to have you on board.<br/>— The CollegeCuts Team</p>
      `
    });
    console.log('✅ Test welcome email sent to wisdomuwaifo@gmail.com');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
  }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, _i, data_1, row;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.from('subscribers').select('email')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('❌ Failed to fetch subscribers:', error);
                        process.exit(1);
                    }
                    if (!data) {
                        console.log('No subscribers found.');
                        return [2 /*return*/];
                    }
                    _i = 0, data_1 = data;
                    _b.label = 2;
                case 2:
                    if (!(_i < data_1.length)) return [3 /*break*/, 6];
                    row = data_1[_i];
                    if (!row.email) return [3 /*break*/, 5];
                    return [4 /*yield*/, sendWelcomeEmail(row.email)
                        // Optional: add a delay to avoid rate limits
                    ];
                case 3:
                    _b.sent();
                    // Optional: add a delay to avoid rate limits
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 4:
                    // Optional: add a delay to avoid rate limits
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    console.log('🎉 All welcome emails sent!');
                    return [2 /*return*/];
            }
        });
    });
}
// Uncomment to send to all subscribers
// main();

// Send a test email to wisdomuwaifo@gmail.com
sendTestEmail();
