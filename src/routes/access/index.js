"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const route = express.Router();
//sign up

route.post("/shop/signup", accessController.signUp);

module.exports = route;
