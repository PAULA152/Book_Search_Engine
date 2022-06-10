const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { SignToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id });
        return userData;
      }
      throw new AuthenticationError("User does not exist");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = SignToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const loginInfo = await User.findOne({ email });
      if (!loginInfo) {
        throw new AuthenticationError("User does not exist.");
      }
      const checkPassword = await loginInfo.isCorrectPassword(password);
      if (!checkPassword) {
        throw new AuthenticationError("Password incorrect.");
      }
      const token = SignToken(loginInfo);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );
        return book;
      }
      throw new AuthenticationError("Unable to update book");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return book;
      }
      throw new AuthenticationError("Unable to delete book");
    },
  },
};

module.exports = resolvers;