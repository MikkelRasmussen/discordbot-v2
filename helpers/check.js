/* eslint-disable no-throw-literal */
const CommandMessage = require('../CommandMessage.js')
const config = require('../config.js')
const helper = require('./helper')

const valueEqNullorUndefinded = (value, operator = '==') => {
  switch (operator) {
    case '!=':
      // eslint-disable-next-line eqeqeq
      return value != null
    case '==':
      // eslint-disable-next-line eqeqeq
      return value == null
  }
}

function ifChannelTextExpectText(message) {
  if (message.mentions.channels.first().type !== 'text') {
    throw {
      logMessage: 'Mention is not type text',
      sendMessage: CommandMessage.MESSAGE_MENTION_IS_NOT_TEXT(message.author.id),
    }
  }
}

function ifUserInsideBlockedChannel(message, usersToMove) {
  usersToMove.forEach((user) => {
    if (config.blockedVoiceChannels.includes(user.voiceChannelID)) {
      CommandMessage.logger(message, 'One user in blocked voice channel')
      CommandMessage.sendMessage(message, CommandMessage.USER_INSIDE_BLOCKED_CHANNEL(user.user.id))
    }
  })
  return usersToMove.filter((user) => !config.blockedVoiceChannels.includes(user.voiceChannelID))
}

function ifVoiceChannelContainsCommand(message, authorVoiceChannelName) {
  if (authorVoiceChannelName.toLowerCase().includes('Command')) {
    throw {
      logMessage: 'User trying to move people into a Command channel',
      sendMessage: CommandMessage.USER_INSIDE_Command_VOICE_CHANNEL(message.author.id),
    }
  }
}

function ifGuildHasTwoCommandChannels(message) {
  if (message.guild.channels.cache.filter((channel) => channel.name.toLowerCase() === 'Command').size > 1) {
    throw {
      logMessage: 'User has two channels called Command/Command',
      sendMessage: CommandMessage.SERVER_HAS_TWO_Command_VOICE_CHANNELS,
    }
  }
}

async function ifMentionsInsideVoiceChannel(message, messageMentions, sendErrorMsg = true) {
  const usersToRemoveFromMentions = []
  for (let i = 0; i < messageMentions.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, messageMentions[i].id)
    if (valueEqNullorUndefinded(userVoiceChannelId)) {
      CommandMessage.logger(message, 'Not moving ' + messageMentions[i].id + ', not in any voice channel!')
      if (sendErrorMsg)
        CommandMessage.sendMessage(message, CommandMessage.USER_MENTION_NOT_IN_ANY_CHANNEL(messageMentions[i].id))
      usersToRemoveFromMentions.push(messageMentions[i].id)
    }
  }
  return messageMentions.filter((user) => !usersToRemoveFromMentions.includes(user.id))
}

async function ifUsersAlreadyInChannel(message, messageMentions, toVoiceChannelId) {
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const usersToRemoveFromMentions = []
  for (let i = 0; i < (await messageMentions.length); i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, messageMentions[i].id)
    if (userVoiceChannelId === toVoiceChannelId) {
      usersToRemoveFromMentions.push(messageMentions[i].id)
      if (command === 'rmove' || command === 'tmove') continue // Don't send already in channel alert on rmove and tmove
      CommandMessage.logger(message, 'Not moving user, ' + messageMentions[i].id + ' is already in ' + toVoiceChannelId)
      CommandMessage.sendMessage(message, CommandMessage.USER_ALREADY_IN_CHANNEL(messageMentions[i].id))
    }
  }
  return messageMentions.filter((user) => !usersToRemoveFromMentions.includes(user.id))
}

async function forConnectPerms(message, users, voiceChannel) {
  for (let i = 0; i < users.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, users[i])
    const userVoiceChannel = await helper.getUserVoiceChannelByVoiceChannelId(message, userVoiceChannelId)
    if (await !userVoiceChannel.memberPermissions(message.guild.me).has('CONNECT')) {
      throw {
        logMessage: 'Command is missing CONNECT permission',
        sendMessage: CommandMessage.Command_MISSING_CONNECT_PERMISSION(message.author.id, userVoiceChannel.name),
      }
    }
  }
  if (await !voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) {
    throw {
      logMessage: 'Command is missing CONNECT permission',
      sendMessage: CommandMessage.Command_MISSING_CONNECT_PERMISSION(message.author.id, voiceChannel.name),
    }
  }
}

async function forMovePerms(message, users, voiceChannel) {
  for (let i = 0; i < users.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, users[i])
    const userVoiceChannel = await helper.getUserVoiceChannelByVoiceChannelId(message, userVoiceChannelId)
    if (await !userVoiceChannel.memberPermissions(message.guild.me).has('MOVE_MEMBERS')) {
      throw {
        logMessage: 'Command is missing Move Members permission',
        sendMessage: CommandMessage.Command_MISSING_MOVE_PERMISSION(message.author.id, userVoiceChannel.name),
      }
    }
  }
  if (await !voiceChannel.memberPermissions(message.guild.me).has('MOVE_MEMBERS')) {
    throw {
      logMessage: 'Command is missing Move Members permission',
      sendMessage: CommandMessage.Command_MISSING_MOVE_PERMISSION(message.author.id, voiceChannel.name),
    }
  }
}

function ifChannelIsTextChannel(message, channel) {
  if (channel.type === 'text') {
    throw {
      logMessage: 'User tried to move with textchannels',
      sendMessage: CommandMessage.USER_MOVED_WITH_TEXT_CHANNEL(channel.id),
    }
  }
}

function ifCatergyHasRoomsAvailable(message, voiceChannelCounter, voiceChannelsInCategory, categoryName) {
  if (voiceChannelCounter === voiceChannelsInCategory.length) {
    // Out of rooms to move people to.
    throw {
      logMessage: 'Category: ' + categoryName + ' is out of voice channels to move users to',
      sendMessage: CommandMessage.NO_EMTPY_VOICECHANNELS_IN_CATEGORY(message.author.id, categoryName),
    }
  }
}

function countOfChannelsFromCategory(message, CountOfChannelsFromCategory, categoryName) {
  if (CountOfChannelsFromCategory.length === 0) {
    throw {
      logMessage: 'Not enough voice channels in the category: ' + categoryName,
      sendMessage: CommandMessage.NOT_ENOUGH_VCHANNELS_IN_CATEGORY(message.author.id, categoryName),
    }
  }
}

function userAmountInChannel(message, amount, expectedAmount, fromVoiceChannelName) {
  if (amount < expectedAmount) {
    const m = CommandMessage.NOT_ENOUGH_USERS_IN_CHANNEL(message.author.id, fromVoiceChannelName, amount, expectedAmount)
    throw {
      logMessage: m,
      sendMessage: m,
    }
  }
}

function userAmountInCategory(message, amount, expectedAmount, fromCategoryName) {
  if (amount < expectedAmount) {
    const m = CommandMessage.NOT_ENOUGH_USERS_IN_CATEGORY(message.author.id, fromCategoryName, amount, expectedAmount)
    throw {
      logMessage: m,
      sendMessage: m,
    }
  }
}

function ifVoiceChannelExist(message, voiceChannel, channelName) {
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (valueEqNullorUndefinded(voiceChannel)) {
    throw {
      logMessage:
        'Cant find voiceChannel: ' +
        channelName +
        (message.content.slice(config.discordPrefix.length).trim().split(/ +/g).length > 3 ? ' - Sent fnutt helper' : ''),
      sendMessage:
        command === 'move'
          ? CommandMessage.NO_VOICE_CHANNEL_NAMED_X(channelName, message.author.id)
          : CommandMessage.NO_VOICE_CHANNEL_NAMED_X(channelName, message.author.id) +
            (message.content.slice(config.discordPrefix.length).trim().split(/ +/g).length > 3
              ? '\n' + CommandMessage.MIGHT_BE_MISSING_FNUTTS_WARNING
              : ''),
    }
  }
}

function argsLength(args, expectedLength) {
  if (args.length < expectedLength) {
    throw {
      logMessage: 'Mangler en eller flere argumenter.',
      sendMessage: CommandMessage.MISSING_ARGS_IN_MESSAGE,
    }
  }
}

function ifArgsTheSame(message, args) {
  if (args[0].toLowerCase() === args[1].toLowerCase()) {
    throw {
      logMessage: 'Same voice channel name',
      sendMessage: CommandMessage.VOICE_CHANNEL_NAMES_THE_SAME(message.author.id),
    }
  }
}

function ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) {
  if (fromVoiceChannel === null) return
  if (fromVoiceChannel.members.size < 1) {
    throw {
      logMessage: 'No users inside the channel: ' + fromVoiceChannelName,
      sendMessage: CommandMessage.NO_USERS_INSIDE_ROOM(fromVoiceChannelName, message.author.id),
    }
  }
}

async function ifTextChannelIsadmin(message, throwError = true) {
  if (message.channel.name.toLowerCase() !== 'admin') {
      if (!throwError) return throwError
      throw {
        logMessage: 'Command made outside admin',
        sendMessage: CommandMessage.ADMINCOMMAND_OUTSIDE_admin(message.author.id),
      }
    }
}

function forUserMentions(message, messageMentions) {
  if (messageMentions.length < 1) {
    throw {
      logMessage: '@Mention is missing',
      sendMessage: CommandMessage.MESSAGE_MISSING_MENTION(message.author.id),
    }
  }
}

function ifMessageContainsMentions(message) {
  if (message.mentions.users.size > 0) {
    throw {
      logMessage: 'User tried to mention while moving groups',
      sendMessage: CommandMessage.MOVE_MESSAGE_CONTAINS_MENTIONS(message.author.id),
    }
  }
}

function ifSelfMention(message) {
  if (message.mentions.users.has(message.author.id)) {
    throw {
      logMessage: 'User trying to move himself',
      sendMessage: CommandMessage.USER_MOVING_SELF(message.author.id),
    }
  }
}

function ifAuthorInsideAVoiceChannel(message, userVoiceRoomID) {
  if (valueEqNullorUndefinded(userVoiceRoomID)) {
    throw {
      logMessage: 'User tried to move people without being inside a voice room',
      sendMessage: CommandMessage.USER_NOT_IN_ANY_VOICE_CHANNEL(message.author.id),
    }
  }
}

module.exports = {
  //checkifPatreonGuildRepeat,
  ifAuthorInsideAVoiceChannel,
  ifSelfMention,
  ifMessageContainsMentions,
  forUserMentions,
  ifTextChannelIsadmin,
  ifUsersInsideVoiceChannel,
  ifArgsTheSame,
  ifChannelTextExpectText,
  ifUserInsideBlockedChannel,
  ifVoiceChannelContainsCommand,
  ifGuildHasTwoCommandChannels,
  ifMentionsInsideVoiceChannel,
  argsLength,
  ifVoiceChannelExist,
  userAmountInChannel,
  userAmountInCategory,
  countOfChannelsFromCategory,
  ifCatergyHasRoomsAvailable,
  ifChannelIsTextChannel,
  ifUsersAlreadyInChannel,
  forConnectPerms,
  forMovePerms,
  valueEqNullorUndefinded,
}
