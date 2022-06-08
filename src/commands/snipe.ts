import { Client, Message, MessageEmbed } from 'discord.js';

export default {
	name: 'snipe',
	aliases: 's',
	run: function (client: Client, message: Message, args: string[]) {
		const snipe = client.snipes.get(message.channel.id);

		if (!snipe) {
			message.reply('No snipe available in this channel!');
			return;
		}

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setAuthor({
						name: `Message deleted by ${snipe.author}`,
						iconURL: snipe.authorAvatarURL,
					})
					.setColor('RANDOM')
					.addFields([{ name: 'Message content: ', value: snipe.content }])
					.setFooter({
						text: `Sniped by ${message.author.username}`,
					})
					.setTimestamp(),
			],
		});
	},
};
