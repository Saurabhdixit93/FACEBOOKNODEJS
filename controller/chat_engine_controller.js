const Chat = require('../models/message');
const User = require('../models/user');

exports.createChat = async (req, res, next) => {
  const { senderId, receiverId } = req.body;
  try {
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists' });
    }
    // Create new chat
    const newChat = new Chat({
      members: [senderId, receiverId],
      messages: [],
    });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.sendMessage = async (req, res, next) => {
  const { chatId, senderId, receiverId, content } = req.body;
  try {
    // Check if chat exists
    const existingChat = await Chat.findById(chatId);
    if (!existingChat) {
      return res.status(400).json({ message: 'Chat does not exist' });
    }
    // Check if user is a member of the chat
    if (
      !existingChat.members.includes(senderId) ||
      !existingChat.members.includes(receiverId)
    ) {
      return res.status(400).json({ message: 'User is not a member of the chat' });
    }
    // Add message to chat
    existingChat.messages.push({ sender: senderId, content });
    await existingChat.save();
    // Emit message to receiver
    req.app.get('io').to(receiverId).emit('message', { chatId, senderId, content });
    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getChats = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    // Find chats that user is a member of
    const chats = await Chat.find({ members: userId });
    const chatIds = chats.map((chat) => chat._id);
    // Find users that are members of the chats
    const chatMembers = await User.find({ _id: { $in: chats.flatMap((chat) => chat.members) } });
    const chatData = chatMembers.map((user) => {
      const userChats = chats.filter((chat) => chat.members.includes(user._id));
      return {
        user: user,
        chats: userChats.map((chat) => {
          const otherUser = chat.members.filter((member) => member !== user._id)[0];
          return {
            id: chat._id,
            otherUser: chatMembers.find((member) => member._id.toString() === otherUser.toString()),
            latestMessage: chat.messages[chat.messages.length - 1],
          };
        }),
      };
    });
    res.status(200).json(chatData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};