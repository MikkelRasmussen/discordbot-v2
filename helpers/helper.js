/* eslint-disable no-throw-literal */
const CommandMessage = require('../CommandMessage.js')
const config = require('../config.js')

function getCategoryByName(message, categoryName) {
  let category = message.guild.channels.cache.find(
    (category) => category.id === categoryName && category.type === 'category'
  )
  if (category == null) {
    category = message.guild.channels.cache.find(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase() && category.type === 'category'
    )
  }
  if (category == null) {
    throw {
      logMessage: 'Cant find category with that name: ' + categoryName,
      sendMessage: 'No category found with the name: ' + categoryName + ' <@' + message.author.id + '>',
    }
  }
  return category
}

async function getNameOfVoiceChannel(message, authorId) {
  const voiceChannelId = await getUserVoiceChannelIdByUserId(message, authorId)
  const voiceChannelName = await message.guild.channels.cache.get(voiceChannelId).name
  return voiceChannelName
}

function getChannelByName(message, findByName) {
  let voiceChannel = message.guild.channels.cache.get(findByName)

  if (voiceChannel == null) {
    voiceChannel = message.guild.channels.cache
      .filter((channel) => channel.type === 'voice' && channel.name.toLowerCase() === findByName.toLowerCase())
      .first()
  }
  return voiceChannel
}

async function moveUsers(message, usersToMove, toVoiceChannelId, rabbitMqChannel, command) {
  let usersMoved = 0
  usersToMove.forEach((user) => {
    PublishToRabbitMq(message, user, toVoiceChannelId, rabbitMqChannel)
    usersMoved++
  })
  
  if (command === 'tgrupper') return
  const ShouldISendRLMessage =
    (usersMoved > 15 ) ||
    (usersMoved > 15 )
  
  CommandMessage.logger(
    message,
    'Moved ' +
      usersMoved +
      (usersMoved === 1 ? ' user' : ' users') +
      (ShouldISendRLMessage ? ' - Sent RL message about announcment' : '')
  ) 


  CommandMessage.sendMessage(
    message,
    'Flyttede ' +
      usersMoved +
      (usersMoved === 1 ? ' bruger' : ' brugere') +
      ', anmodet af <@' +
      message.author.id +
      '>' +
      (ShouldISendRLMessage ? CommandMessage.TAKE_A_WHILE_RL_MESSAGE : '')
  )
}

async function PublishToRabbitMq(message, userToMove, toVoiceChannelId, rabbitMqChannel) {
  const messageToRabbitMQ = {
    userId: userToMove,
    voiceChannelId: toVoiceChannelId,
    guildId: message.guild.id,
  }
  const queue = "ServerQueue"
  rabbitMqChannel.assertQueue(queue, {
    durable: false,
  })

  rabbitMqChannel.sendToQueue(queue, Buffer.from(JSON.stringify(messageToRabbitMQ)), {
    
  })
  
  CommandMessage.logger(
    message,
    'Sent message - User: ' +
      messageToRabbitMQ.userId +
      ' toChannel: ' +
      messageToRabbitMQ.voiceChannelId +
      ' in guild: ' +
      messageToRabbitMQ.guildId
  )
}

function getNameWithSpacesName(args, authorId) {
  const string = args.join()
  let fnuttCounter = string[0] === '"' ? 0 : 2
  let testFrom = ''
  let testTo = ''
  let fromVoiceChannelName
  let toVoiceChannelName

  for (let i = string[0] === '"' ? 0 : args[0].length; i < string.length; i++) {
    if (string[i] === '"') {
      fnuttCounter += 1
      continue
    }
    if (fnuttCounter === 2 && string[i] === ',') continue
    if (fnuttCounter < 2) testFrom += string[i] === ',' ? ' ' : string[i]
    if (fnuttCounter > 1) testTo += string[i] === ',' ? ' ' : string[i]
  }

  if (fnuttCounter ? !(fnuttCounter % 2) : void 0) {
    fromVoiceChannelName = string[0] === '"' ? testFrom : args[0]
    toVoiceChannelName = testTo
  } else {
    throw {
      logMessage: CommandMessage.MISSING_FNUTTS_IN_ARGS(authorId),
      sendMessage: CommandMessage.MISSING_FNUTTS_IN_ARGS(authorId),
    }
  }
  return [fromVoiceChannelName, toVoiceChannelName]
}

function getRandomUsers(userArray, amoutToGet) {
  const result = new Array(amoutToGet)
  let len = userArray.length
  const taken = new Array(len)
  while (amoutToGet--) {
    const x = Math.floor(Math.random() * len)
    result[amoutToGet] = userArray[x in taken ? taken[x] : x]
    taken[x] = --len in taken ? taken[len] : len
  }
  return result
}

async function getUserVoiceChannelIdByUserId(message, userId) {
  const user = await message.guild.members.fetch(userId)
  try {
    const userVoiceChannelId = await user.guild.voiceStates.cache.filter((user) => user.id === userId).first().channelID
    return userVoiceChannelId
  } catch (err) {
    return null
  }
}

async function getUserVoiceChannelByVoiceChannelId(message, channelId) {
  return await message.guild.channels.cache.get(channelId)
}

module.exports = {
  getNameOfVoiceChannel,
  moveUsers,
  getChannelByName,
  getNameWithSpacesName,
  getRandomUsers,
  getCategoryByName,
  getUserVoiceChannelIdByUserId,
  getUserVoiceChannelByVoiceChannelId,
}
