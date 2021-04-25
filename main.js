const Discord = require('discord.js')
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"],})

const log = require('./helpers/logger')
const amqp = require('amqplib/callback_api')

// TOKEN
const config = require('./config.js')
const token = config.discordToken
const CommandMessage = require('./CommandMessage.js')
const { handleCommand } = require('./commandHandler.js')

// rabbitMQ
const rabbitMQConnection = config.rabbitMQConnection
let rabbitMqChannel


client.commands = new Discord.Collection();
const reactionRole = require('./commands/reactionrole.js')

client.on('ready', async () => {
  log.info('Startup successful.')

  amqp.connect(rabbitMQConnection, (error0, connection) => {
    if (error0) {
      CommandMessage.reportCommandError('Kan ikke forbinde til rabbitMQ')
      throw error0
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1
      }
      rabbitMqChannel = channel

      log.info("connected to rabbitmq")
      const queue = "ServerQueue";
      rabbitMqChannel.assertQueue(queue, {
        durable: false,
      })
      rabbitMqChannel.consume(
        queue,
         async (msg) => {
         
          const jsonMsg = JSON.parse(msg.content.toString())
          
         try {
              await client.guilds.cache
              .get(jsonMsg.guildId)
              .member(jsonMsg.userId)
              .voice.setChannel(jsonMsg.voiceChannelId)

          } 
          catch (err) {
            console.log(err)
            CommandMessage.reportCommandError('Fejl:\n' + err.stack)
            await rabbitMqChannel.ack(msg) 
          }
        },{noAck : true}
      )
    })
  })
})

// Listen for messages
client.on('message', async (message) => {
  if (!message.content.startsWith(config.discordPrefix)) return
  if (message.author.bot) return
  if (message.channel.type !== 'text') return
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  handleCommand(command, message, args, rabbitMqChannel)
  if (command === "reactionrole") {
    reactionRole.execute(message, args, Discord, client);
  }
});

client.login(token);
