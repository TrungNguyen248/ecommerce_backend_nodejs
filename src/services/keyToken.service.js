"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, privateKey, publicKey }) => {
    try {
      //lv 0
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      //return tokens ? tokens.publicKey : null;

      //lv 1
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [],
        refreshToken,
      };
      const options = { upset: true, new: true };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
