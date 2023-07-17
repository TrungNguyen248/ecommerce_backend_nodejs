"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
    1-Check email
    2-match password
    3-create AT vs RT and save
    4-generate tokens
    5-get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    //1-Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");
    //2-match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");
    //3-create AT vs RT and save
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    //4-generate tokens
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    //1: check email exists
    const holderShop = await shopModel.findOne({ email }).lean(); //lean giảm thiểu size query

    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey });

      //save collection key
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Key store error");
      }

      //created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      console.log(`Created Token Success`, tokens);

      return {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: newShop,
        }),
        tokens,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
