'use strict';

const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log('Incoming data: ' + data)

    const parsed = JSON.parse(data)
    const question_duration_sec = parsed.question.duration * 1000
    const payload = {
      "partner_title" : parsed.partner_title,
      "id"            : parsed.id,
      "question"      : {
        "title"   : parsed.question.title,
        "options" : parsed.question.options.map(q => q.body)
      }
    }
    const body = JSON.stringify(payload)
    console.log('Payload: ' + body)

    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(body);
      }
    });

    setTimeout(() => {
      const payload = {
        "winner_access_code" : "vo7y",
        "question"           : parsed.question.title,
        "statistics"         : parsed.question.options.map(q =>
          ({
            "option"         : q.body,
            "correct"        : q.correct,
            "responses_count": getRandomInt(200, 400)
          })
        )
      }
      const body = JSON.stringify(payload)
      console.log('Statistics: ' + body)

      ws.send(body)
    }, question_duration_sec);
  });

  ws.on('close', () => console.log('Client disconnected'));
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 5000);
