import { Client as BaseClient, ClientOptions, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { snipeStruct } from './interfaces';
import consola from 'consola';
import 'dotenv/config';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, any>;
		messageCache: Map<string, snipeStruct[]>;
		snipes: Map<string, snipeStruct>;
	}
}

export class Client extends BaseClient {
	private readonly prefix = process.env.PREFIX;

	constructor(options: ClientOptions) {
		super(options);
	}

	public async init() {
		const prefix = this.prefix;

		this.commands = new Collection();
		this.messageCache = new Map();
		this.snipes = new Map();

		this.on('messageCreate', async function (message) {
			if (message.author.bot) return;

			const args = message.content.slice(prefix.length).trim().split(/ +/);
			const cmd = args.shift().toLowerCase();

			const command = this.commands.get(cmd);
			if (command && message.content.toLowerCase().startsWith(prefix)) {
				command.run(this, message, args);
			} else {
				const arr = [];
				const avatarHash = message.author.avatar;

				const messageCache = this.messageCache.get(message.channel.id) as snipeStruct[];
				if (messageCache != undefined) {
					if (messageCache.length < 200) {
						messageCache.forEach((value) => {
							arr.push(value);
						});
					}
				}

				arr.push({
					author: message.author.tag,
					ID: message.id,
					authorAvatarURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${avatarHash}${
						avatarHash.startsWith('_a') ? '.gif' : '.png'
					}?size=4096`,
					content: message.content,
				});

				this.messageCache.set(message.channel.id, arr);
			}
		});

		this.on('messageDelete', function (message) {
			const channelID = message.channel.id;
			try {
				this.snipes.set(
					channelID,
					this.messageCache.get(channelID).find((snipe: snipeStruct) => snipe.ID === message.id)
				);
			} catch (e) {
				consola.error(e);
			}
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
