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

const MISSING_ARGS_IN_MESSAGE = 'Mangler information i kommandoen. Brug !hjælp <kommando>'

const NO_USER_FOUND_BY_SEARCH = (userId, username) =>
  convertUserIdToTaggedUser(userId) + ' Kan ikke finde brugeren med navnet:' + username

const MIGHT_BE_MISSING_FNUTTS_WARNING =
  'Hvis din talekanal indeholder mellemrum, hver venlig og bruge "" rundt om navnet. Eksempel: "KanalNavn". '

const USER_NOT_IN_ANY_VOICE_CHANNEL = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - Du skal deltage i en talekanal, før du kan flytte med personer med denne kommando'

const SERVER_HAS_TWO_Command_VOICE_CHANNELS = ' - Du har to kanaler der hedder lærekommandoer. Fjern venligst den ene'

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
// -----------------------------------------------------------------------------------------------------
const MESSAGES_NOW_ALLOWED_IN_CHANNEL = (userId, textChannelId) =>
  convertUserIdToTaggedUser(userId) +
  ' - Admin commands now allowed to be sent inside <#' +
  textChannelId +
  '>\nCan be removed with `!removema <#channelName>`'

const MESSAGES_NOT_ALLOWED_IN_CHANNEL = (userId, textChannelId) =>
  convertUserIdToTaggedUser(userId) + ' - Admin not allowed inside <#' + textChannelId + '> anymore'

const MESSAGE_MISSING_ROOM_IDENTIFER = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - You need to write a number to identify a gCommand room!'

const MOVE_MESSAGE_CONTAINS_MENTIONS = (userId) =>
  convertUserIdToTaggedUser(userId) + " - You're not supposed to @mention members with this command."

const NO_VOICE_CHANNEL_NAMED_X = (channelName, userId) =>
  convertUserIdToTaggedUser(userId) + " - There's no voice channel with the name or ID: " + channelName

const NO_USERS_INSIDE_ROOM = (fromVoiceChannelName, userId) =>
  convertUserIdToTaggedUser(userId) + " - There's no users inside the voice channel: " + fromVoiceChannelName

const ADMINCOMMAND_OUTSIDE_admin = (userId) =>
  convertUserIdToTaggedUser(userId) +
  ' - This is an admin command, please use it inside a text channel with admin permissions. Default admin channel is `#admin` or add your own with `!addma #textchannel`.'

const USER_MENTION_NOT_IN_ANY_CHANNEL = (userId) => convertUserIdToTaggedUser(userId) + ' is not inside any voice channel!'

const USER_ALREADY_IN_CHANNEL = (taggedUserId) =>
  (taggedUserId === 'Everyone' ? 'Everyone' : convertUserIdToTaggedUser(taggedUserId) + ' - ') +
  ' is already inside that voice channel.'

const DB_DOWN_WARNING =
  "Command cannot communicate with it's database. Since this is a admin command please create a text channel named admin and use that until my developer fixes this! He has been alerted but please poke him inside the support server! https://discord.gg/dTdH3gD"

const VOICE_CHANNEL_NAMES_THE_SAME = (userId) =>
  convertUserIdToTaggedUser(userId) + " - Please specify one channel to move from and one to move to. It can't be the same."

const MISSING_FNUTTS_IN_ARGS = (userId) =>
  convertUserIdToTaggedUser(userId) +
  ' - There is either too many or too few quotation marks (") or you forgot a space between the names.'

const USER_MOVED_WITH_TEXT_CHANNEL = (textChannelId) =>
  '<#' + textChannelId + '> seems to be a text channel. I can only move people inside voice channels!'

const HELP_MESSAGE = {
  embed: {
    footer: {
      text: 'For mere hjælp, spørg en ven',
    },
    fields: [
      {
        name: 'tgrupper',
        value: 'Spreads x user from one channel to different voice channels inside a category',
      },
      {
        name: 'sgrupper',
        value: "Moves all users inside a category's voice channels to a specific channel",
      },
    ],
  },
}

// tgrupper

const HELP_tgrupper = {
  embed: {
    color: 2387002,
    footer: {
      text: 'For mere hjælp, spørg en ven',
    },
    fields: [
      {
        name: '!tgrupper',
        value:
          '1. Tell users you want to move to join voice channel "before games"\n2. Create a couple of voice channels under a category named "games"\n3. Write `!tgrupper "before games" "games" 5`\n4. Now Command should spread users from the voice channel "beforegames" across the different voice channels inside the category "games". 5 users in each channel.  \nThis command requires to be sent from the text channel \'admin\'',
      },
    ],
  },
}

const HELP_sgrupper = {
  embed: {
    color: 2387002,
    footer: {
      text: 'For mere hjælp, spørg en ven',
    },
    fields: [
      {
        name: 'move',
        value:
          'Best used to move everyone back to a single channel after !tgrupper is used\n1. Create a couple of voice channels under a category named "games"\n3. Write `!sgrupper "games" "after games"`\n4. Command should now move all users from all the voice channels inside the category "games" to the "after games" voice channel. \nThis command requires to be sent from the text channel \'admin\'',
      },
    ],
  },
}

const FALLBACK_HELP_MESSAGE =
  'move - Moves @mentions to you\ncmove  Moves @mentions to a specific channel\nfmove' +
  '- Moves users inside one channel to another channel\ngmove - Moves everyone inside a channel to you. \n\n' +
  'For more information, use !help <command>'


const FALLBACK_HELP_tgrupper = HELP_tgrupper.embed.fields[0].value
const FALLBACK_HELP_sgrupper = HELP_sgrupper.embed.fields[0].value



const handleHelpCommand = (helpCommand, gotEmbedPerms) => {
  switch (helpCommand) {
    case 'tgrupper':
      return gotEmbedPerms ? HELP_tgrupper : FALLBACK_HELP_tgrupper
    case 'sgrupper':
      return gotEmbedPerms ? HELP_sgrupper : FALLBACK_HELP_sgrupper
    default:
      return 'notFound'
  }
}

function sendMessage(message, sendMessage) {
  if (sendMessage === 'notFound') return 
  if (sendMessage == null) {
    reportCommandError('I was about to send a NULL message - Probably errors in code.. @everyone')
    return
  }

  message.channel.send(sendMessage).catch((e) => {
    logger(message, e)
    if (
      config.discordBotListToken !== 'x' &&
      message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES') === true
    ) {
      console.log(e)
    }
  })
}

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
  MESSAGE_MISSING_ROOM_IDENTIFER,
  MOVE_MESSAGE_CONTAINS_MENTIONS,
  NO_VOICE_CHANNEL_NAMED_X,
  NO_USERS_INSIDE_ROOM,
  ADMINCOMMAND_OUTSIDE_admin,
  USER_MENTION_NOT_IN_ANY_CHANNEL,
  logger,
  sendMessage,
  USER_ALREADY_IN_CHANNEL,
  VOICE_CHANNEL_NAMES_THE_SAME,
  MISSING_FNUTTS_IN_ARGS,
  USER_MOVED_WITH_TEXT_CHANNEL,
  reportCommandError,
  NOT_ENOUGH_USERS_IN_CHANNEL,
  NOT_ENOUGH_USERS_IN_CATEGORY,
  NOT_ENOUGH_VCHANNELS_IN_CATEGORY,
  NO_EMTPY_VOICECHANNELS_IN_CATEGORY,
  MESSAGES_NOW_ALLOWED_IN_CHANNEL,
  MESSAGES_NOT_ALLOWED_IN_CHANNEL,
  handleHelpCommand,
  NO_USER_FOUND_BY_SEARCH,

}
