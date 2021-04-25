const log = require('./helpers/logger')
const config = require('./config.js')

const convertUserIdToTaggedUser = (userId) => {
  return '<@' + userId + '>'
}



const NO_EMTPY_VOICECHANNELS_IN_CATEGORY = (userId, categoryName) =>
  convertUserIdToTaggedUser(userId) +
  ' - Katagorien "' +
  categoryName +
  '" Mangler talekanaler til at flytte på brugere. Venligst opret flere talekanaler'

const NOT_ENOUGH_VCHANNELS_IN_CATEGORY = (userId, categoryName) =>
  convertUserIdToTaggedUser(userId) + ' - Talekanalen eksistere ikke, eller er ikke den valgte katagori ' + categoryName

const NO_USER_FOUND_BY_SEARCH = (userId, username) =>
  convertUserIdToTaggedUser(userId) + ' Kan ikke finde brugeren med navnet:' + username

const USER_NOT_IN_ANY_VOICE_CHANNEL = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - Du skal deltage i en talekanal, før du kan flytte med personer med denne kommando'


const NOT_ENOUGH_USERS_IN_CHANNEL = (userId, fromVoiceChannelName, actualAmount, expectedAmount) =>
  convertUserIdToTaggedUser(userId) +
  ' - Mangler personer i kanalen "' +
  fromVoiceChannelName +
  '" skal flyttes. Fandt ' +
  actualAmount +
  (actualAmount === 1 ? ' bruger' : ' brugere') +
  ', forventede ' +
  expectedAmount

const NOT_ENOUGH_USERS_IN_CATEGORY = (userId, fromCategoryName, actualAmount, expectedAmount) =>
  convertUserIdToTaggedUser(userId) +
  ' - Not enough members inside the category | Mangler medlemmer i den katagori"' +
  fromCategoryName +
  '" skal flyttes. Fandt ' +
  actualAmount +
  (actualAmount === 1 ? ' bruger' : ' brugere') +
  ', forventede ' +
  expectedAmount

const Command_MISSING_CONNECT_PERMISSION = (userId, voiceChannelName) =>
  convertUserIdToTaggedUser(userId) +
  " - Har ikke adgang til at 'DELTAGE' i talekanalen med navet: " +
  voiceChannelName +
  '\n\n' +
  SUPPORT_MESSAGE

const Command_MISSING_MOVE_PERMISSION = (userId, voiceChannelName) =>
  convertUserIdToTaggedUser(userId) +
  " - Har ikke adgang til at 'Flytte på brugere' i talekanalen med navet:  " +
  voiceChannelName +
  '\n\n' +
  SUPPORT_MESSAGE

const TAKE_A_WHILE_RL_MESSAGE =
  '\n\n Det her kan godt tage lidt tid'



function logger(message, logMessage) {
  log.info(
    (message.author.bot ? 'BOT - ' : '') +
      '(' +
      message.id +
      ') - ' +
      message.guild.name +
      ' - (' +
      message.channel.name +
      ') - (' +
      message.content +
      ') - ' +
      logMessage
  )
}

function reportCommandError(message) {
  const Discord = require('discord.js')
  const hook = new Discord.WebhookClient(config.discordHookIdentifier, config.discordHookToken)
  log.info('Sending error to DB HOOK')
  hook.send(message)
}

module.exports = {
  USER_NOT_IN_ANY_VOICE_CHANNEL,
  Command_MISSING_CONNECT_PERMISSION,
  Command_MISSING_MOVE_PERMISSION,
  logger,
  reportCommandError,
  NOT_ENOUGH_USERS_IN_CHANNEL,
  NOT_ENOUGH_USERS_IN_CATEGORY,
  NOT_ENOUGH_VCHANNELS_IN_CATEGORY,
  NO_EMTPY_VOICECHANNELS_IN_CATEGORY,
  NO_USER_FOUND_BY_SEARCH,

}
