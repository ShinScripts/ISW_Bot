import consola from 'consola';
import express from 'express';
import http from 'http';

export class Server {
	constructor() {
		const app = express();

		app.get('', (req, res) => res.sendStatus(200));

		const PORT = process.env.PORT || 8080;

		http.createServer(app).listen(PORT, () => consola.success('Server is online!'));
	}
}
