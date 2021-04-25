const tgrupper = require('./commands/tgrupper.js')
const sgrupper = require('./commands/sgrupper.js')
const CommandMessage = require('./CommandMessage.js')


const handleCommand = (command, message, args, rabbitMqChannel) => {
 
  if (command === 'tgrupper') tgrupper.move(args, message, rabbitMqChannel)
  if (command === 'sgrupper') sgrupper.move(args, message, rabbitMqChannel)
  }

module.exports = {
  handleCommand,
}
