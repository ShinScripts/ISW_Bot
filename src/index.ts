import { Client } from './DiscordClient';
import { Server } from './server';

new Server();
new Client({
	intents: ['GUILDS', 'GUILD_MESSAGES'],
	partials: ['MESSAGE'],
}).init();
