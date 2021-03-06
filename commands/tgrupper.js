const CommandMessage = require('../CommandMessage.js')
const check = require('../helpers/check.js')
const helper = require('../helpers/helper.js')

async function move(args, message, rabbitMqChannel) {
  try {
    const amountInEachChannel = args.pop()
    let fromVoiceChannelName = args[0]
    let categoryName = args[1]
    if (args.join().includes('"')) {
      const names = await helper.getNameWithSpacesName(args, message.author.id) // fromChannel and category name (channels to move to)
      fromVoiceChannelName = names[0]
      categoryName = names[1]
    }

    await check.ifTextChannelIsadmin(message)
    check.argsLength(args, 2) 
    check.ifMessageContainsMentions(message)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    check.ifVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) 

    const category = helper.getCategoryByName(message, categoryName)
    const voiceChannelsInCategory = category.children
      .filter((channel) => channel.type === 'voice' && channel.members.size === 0)
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .array()
    check.countOfChannelsFromCategory(message, voiceChannelsInCategory, categoryName)
    check.userAmountInChannel(message, fromVoiceChannel.members.size, amountInEachChannel, fromVoiceChannelName)

    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    const userIdsLength = userIdsToMove.length
    let voiceChannelCounter = 0
    for (let i = 0; i < userIdsLength; i++) {
      if (userIdsToMove.length === 0) break 
      check.ifCatergyHasRoomsAvailable(message, voiceChannelCounter, voiceChannelsInCategory, categoryName)
      check.userAmountInChannel(message, userIdsToMove.length, amountInEachChannel, fromVoiceChannelName)

      const randomUsersTomove = await helper.getRandomUsers(userIdsToMove, amountInEachChannel)
      if (randomUsersTomove.length > 0)
        await helper.moveUsers(
          message,
          randomUsersTomove,
          voiceChannelsInCategory[voiceChannelCounter].id,
          rabbitMqChannel,
          'tgrupper'
        )
      for (let z = 0; z < randomUsersTomove.length; z++) {
        const index = await userIdsToMove.indexOf(randomUsersTomove[z])
        if (index > -1) await userIdsToMove.splice(index, 1)
      }
      voiceChannelCounter++
    }
    CommandMessage.logger(message, 'Flyttede ' + userIdsLength + (userIdsLength === 1 ? ' bruger' : ' brugere'))
    CommandMessage.sendMessage(
      message,
      'Flyttede ' + userIdsLength + (userIdsLength === 1 ? 'bruger' : ' brugere') + ', anmodet af <@' + message.author.id + '>'
    )
    
  } catch (err) {
    if (!err.logMessage) {
      CommandMessage.reportCommandError('Above alert was caused by:\n' + err.stack)
      console.log(err)
    }
    CommandMessage.logger(message, err.logMessage)
    CommandMessage.sendMessage(message, err.sendMessage)
  } 
}

module.exports = {
  move,
}
