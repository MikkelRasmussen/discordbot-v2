module.exports = {
    name: "reactionrole",
    description: "Sets up a reaction role message!",
    async execute(message, args, Discord, client) {
      const channel = "829632207093104701";
      const xTeamRole = message.guild.roles.cache.find(
        (role) => role.name === "x klassen"
      );
      const yTeamRole = message.guild.roles.cache.find(
        (role) => role.name === "y klassen"
      );
      const zTeamRole = message.guild.roles.cache.find(
        (role) => role.name === "z klassen"
      );
  
      const xTeamEmoji = "🔵";
      const yTeamEmoji = "🟡";
      const zTeamEmoji = "🔴";
  
      let embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setAuthor("Midtbyens Gymnasium")
        .setTitle("Vælg den klasse du går i")
        .setThumbnail(
          "https://klcviborg.dk/sites/klcviborg.dk/files/styles/logo/public/logos/mercantec_-_midtbyens_gymnasium_logo_002.jpg?itok=9CP9qJPM"
        )
        .setDescription(
          "Valg af klasse vil tillade dig at deltage i undervisningen!\n\n For at vælge din klasse skal du reagere på denne besked, med den tilhørende farve til klassen."
        )
        .addFields(
          {
            name: "X Klassen",
            value: `Reager med  ${xTeamEmoji}`,
            inline: true,
          },
          {
            name: "Y Klassen",
            value: `Reager med  ${yTeamEmoji}`,
            inline: true,
          },
          {
            name: "Z Klassen",
            value: `Reager med  ${zTeamEmoji}`,
            inline: true,
          }
        );
      let messageEmbed = await message.channel.send(embed);
      messageEmbed.react(xTeamEmoji);
      messageEmbed.react(yTeamEmoji);
      messageEmbed.react(zTeamEmoji);
  
      client.on("messageReactionAdd", async (reaction, user) => {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;
        if (!reaction.message.guild) return;
  
        if (reaction.message.channel.id == channel) {
          if (reaction.emoji.name === xTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.add(xTeamRole);
          }
          if (reaction.emoji.name === yTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.add(yTeamRole);
          }
          if (reaction.emoji.name === zTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.add(zTeamRole);
          }
        } else {
          return;
        }
      });
  
      client.on("messageReactionRemove", async (reaction, user) => {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;
        if (!reaction.message.guild) return;
  
        if (reaction.message.channel.id == channel) {
          if (reaction.emoji.name === xTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.remove(xTeamRole);
          }
          if (reaction.emoji.name === yTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.remove(yTeamRole);
          }
          if (reaction.emoji.name === zTeamEmoji) {
            await reaction.message.guild.members.cache
              .get(user.id)
              .roles.remove(zTeamRole);
          }
        } else {
          return;
        }
      });
    },
  };
  