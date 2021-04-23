const ymove = require('./commands/ymove.js')
const zmove = require('./commands/zmove.js')
const moveerMessage = require('./moveerMessage.js')

const handleCommand = (command, message, args, rabbitMqChannel) => {
  //if (command === 'say') message.channel.send(args.join(' '))
  if (command === 'changema')
    message.channel.send(
      'This command has moved, it is now !addma <#channel>.\nReason for this is that we now allow multiple renamed moveeradmin channels.'
    )
  if (command === 'ymove') ymove.move(args, message, rabbitMqChannel)
  if (command === 'zmove') zmove.move(args, message, rabbitMqChannel)
  if ((command === 'help' || command === 'commands') && !message.author.bot) {
    const gotEmbedPerms = message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
    args.length < 1
      ? moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_MESSAGE : moveerMessage.FALLBACK_HELP_MESSAGE)
      : moveerMessage.sendMessage(message, moveerMessage.handleHelpCommand(args[0], gotEmbedPerms))
  }
  
}

module.exports = {
  handleCommand,
}
