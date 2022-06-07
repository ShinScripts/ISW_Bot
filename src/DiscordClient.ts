import { Client as BaseClient, ClientOptions, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { snipeStruct } from './interfaces';
import consola from 'consola';
import 'dotenv/config';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, any>;
		messageCache: Collection<string, string>;
		snipes: Collection<string, snipeStruct>;
	}
}

export class Client extends BaseClient {
	constructor(options: ClientOptions) {
		super(options);
	}

	public async init() {
		this.commands = new Collection();
		this.messageCache = new Collection();
		this.snipes = new Collection();

		this.on('messageCreate', async function (message) {
			if (message.author.bot) return;

			const prefix = process.env.PREFIX;
			const args = message.content.slice(prefix.length).trim().split(/ +/);
			const cmd = args.shift().toLowerCase();

			const command = this.commands.get(cmd);
			if (command) {
				command.run(this, message, args);
			} else {
				const avatarHash = message.author.avatar;

				this.messageCache.set(message.channel.id, {
					author: message.author.tag,
					authorAvatarURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${avatarHash}${
						avatarHash.startsWith('_a') ? '.gif' : '.png'
					}?size=4096`,
					content: message.content,
				});
			}
		});

		this.on('messageDelete', function (message) {
			const channelID = message.channel.id;
			this.snipes.set(channelID, this.messageCache.get(channelID));
		});

		this.once('ready', async function () {
			const path = `${__dirname}/commands/`;
			for (const command of readdirSync(path)) {
				const file = await import(`${path}/${command}`);
				this.commands.set(file.default.name, file.default);

				const aliases = file.default.aliases;
				if (aliases) {
					for (const alias of aliases) {
						this.commands.set(alias, file.default);
					}
				}
			}
			consola.success('Commands loaded!');

			this.user.setPresence({ activities: [{ name: 'with sweaty balls 😏😩' }] });
			consola.success(`Client is online!`);
		});

		consola.success('Events loaded!');
		this.login(process.env.TOKEN);
	}
}
