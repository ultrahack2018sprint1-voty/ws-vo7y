# Voty WebSocket server

Backbone for Voty project.

## Development

Install all the dependencies:

    npm install

Run (inside the project directory):

    npm start

Then your server should start working under this address:

	ws://YOUR-LOCAL-IP:3000


## Production

Open [https://ws-vo7y.herokuapp.com/](https://ws-vo7y.herokuapp.com/) to view it in the browser.

Subscription:

	ws://ws-vo7y.herokuapp.com
	
e.g. using `wsc` terminal websocket client:

	wsc -er ws://ws-vo7y.herokuapp.com
	

### Deployment

1. clone repository - `git clone https://github.com/ultrahack2018sprint1-voty/ws-vo7y.git` 
2. make some brilliant commit (we don't accept others)
3. push it to heroku origin - `git push heroku master`

