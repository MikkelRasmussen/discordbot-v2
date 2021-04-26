const tgrupper = require('./commands/tgrupper.js')
const sgrupper = require('./commands/sgrupper.js')
const CommandMessage = require('./CommandMessage.js')


const handleCommand = (command, message, args, rabbitMqChannel) => {
 
  if (command === 'tgrupper') tgrupper.move(args, message, rabbitMqChannel)
  if (command === 'sgrupper') sgrupper.move(args, message, rabbitMqChannel)
  
  if ((command === 'help' || command === 'guide') && !message.author.bot) {
    const gotEmbedPerms = message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
    args.length < 1
      ? CommandMessage.sendMessage(message, gotEmbedPerms ? CommandMessage.HELP_MESSAGE : CommandMessage.FALLBACK_HELP_MESSAGE)
      : CommandMessage.sendMessage(message, CommandMessage.handleHelpCommand(args[0], gotEmbedPerms))
  }
}
module.exports = {
  handleCommand,
}
