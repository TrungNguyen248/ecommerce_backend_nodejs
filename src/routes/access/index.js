"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//sign up
router.post("/shop/signup", asyncHandler(accessController.signUp));
//sign in
router.post("/shop/signin", asyncHandler(accessController.login));

//authentication
router.use(authentication);
//////////
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandler(accessController.handlerRefreshToken)
);

module.exports = router;
