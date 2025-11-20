"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const Jmt2_node_1 = require("./nodes/Jmt2.node");
const Jmt2Api_credentials_1 = require("./credentials/Jmt2Api.credentials");
exports.nodes = [Jmt2_node_1.Jmt2];
exports.credentials = [Jmt2Api_credentials_1.Jmt2Api];
