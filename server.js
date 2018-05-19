'use strict';

const express   = require('express');
const WebSocket = require('ws');
const path      = require('path');

const PORT  = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res)  => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new WebSocket.Server({ server });

// WS EVENTS
const CREATE_QUESTION_EVENT = "CREATE_QUESTION"
const ANSWER_EVENT          = "ANSWER"

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(data) {
    console.log('Incoming data: ' + data);
    const parsed = JSON.parse(data);

    if(parsed.event_type == CREATE_QUESTION_EVENT) {
      handleCreateQuestionEvent(parsed, wss, ws);
    }
    else if(parsed.event_type == ANSWER_EVENT) {
      handleAnswerEvent(parsed, wss, ws);
    }
    else {
      ws.send(JSON.stringify({"error": "Unknown event_type: " + parsed.event_type}))
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

function handleAnswerEvent(parsed, wss, ws) {
  console.log("Got answer " + JSON.stringify(parsed));
}

function handleCreateQuestionEvent(parsed, wss, ws) {
  const payload = {
    "partner_title" : parsed.partner_title,
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
      "mutation"         : "WINNER_SELECTION",
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

    wss.broadcast(body)

  }, parsed.question.duration * 1000);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
