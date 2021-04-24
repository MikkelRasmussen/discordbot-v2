/* eslint-disable no-throw-literal */
const CommandMessage = require('../CommandMessage.js')
const check = require('../helpers/check.js')
const database = require('../helpers/database.js')

async function admin(type, message) {
  try {
    if (message.mentions.channels.size === 0) {
      CommandMessage.logger(message, 'Missing channel mention')
      CommandMessage.sendMessage(message, CommandMessage.MESSAGE_MENTION_IS_NOT_TEXT(message.author.id))
      return
    }
    check.ifChannelTextExpectText(message)
    await check.ifTextChannelIsadmin(message)

    let searchForGuild = await database.getGuildObject(message, message.guild.id)
    if (searchForGuild.rowCount === 0) {
      await database.insertGuildAfterWelcome(message.guild.id)
      searchForGuild = await database.getGuildObject(message, message.guild.id)
    }

    const alreadyAddedChannels = searchForGuild.rows[0].adminChannelId.split(',')
    const channelId = message.mentions.channels.first().id

    if (type === 'remove' && !alreadyAddedChannels.includes(channelId.toString())) {
      CommandMessage.sendMessage(message, '<#' + channelId + '> is not admin channel.')
      CommandMessage.logger(message, '<#' + channelId + '> is not admin channel.')
      return
    }

    const resultedadminToAdd =
      type === 'add'
        ? [...new Set([...alreadyAddedChannels, ...[channelId]])].join(',')
        : alreadyAddedChannels.filter((c) => c.toString() !== channelId.toString()).join(',')

    searchForGuild.rowCount > 0
      ? await database.updateadminChannel(message, message.guild.id, resultedadminToAdd)
      : await database.insertGuildadminChannel(message, message.guild.id, channelId)

    CommandMessage.logger(
      message,
      (type === 'add' ? 'Added' : 'Removed') + ' admin channel with name: ' + message.mentions.channels.first().name
    )
    CommandMessage.sendMessage(
      message,
      type === 'add'
        ? CommandMessage.MESSAGES_NOW_ALLOWED_IN_CHANNEL(message.author.id, message.mentions.channels.first().id)
        : CommandMessage.MESSAGES_NOT_ALLOWED_IN_CHANNEL(message.author.id, message.mentions.channels.first().id)
    )
  } catch (err) {
    if (!err.logMessage) {
      console.log(err)
      CommandMessage.reportCommandError('@everyone Unable to update, insert or delete admin text channel to DB')
      CommandMessage.reportCommandError('Above alert was caused by:\n' + err.stack)
      CommandMessage.logger(message, CommandMessage.DB_DOWN_WARNING)
      CommandMessage.sendMessage(message, CommandMessage.DB_DOWN_WARNING)
    } else {
      const searchForGuild = await database.getGuildObject(message, message.guild.id)
      CommandMessage.logger(message, err.logMessage)
      CommandMessage.sendMessage(
        message,
        err.sendMessage +
          (searchForGuild.rows[0].adminChannelId === '106679489135706112' || searchForGuild.rows[0].adminChannelId === ''
            ? '\n\nThe first time you use `!addma #textchannel` you have to do it inside the default admin channel `#admin`.'
            : '')
      )
    }
  }
}

module.exports = {
  admin,
}
