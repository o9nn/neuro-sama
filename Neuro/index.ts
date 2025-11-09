import express from "express";
import {json} from "body-parser";
import {WebSocket, WebSocketServer} from "ws";
import {JSONSchemaFaker} from "json-schema-faker";
import util from "util";
import { NeuroCognitiveEngine } from "./cognitive-engine";
import type { Message, Action, GameState } from "./types";

const app = express();
app.use(json());
app.listen(1337);

app.post("/", (req, res) => {
    send(req.body);
    res.sendStatus(200);
});

const wss = new WebSocketServer({port: 8000});

// Initialize Neuro's cognitive engine
const cognitiveEngine = new NeuroCognitiveEngine();

let actionId: number = 0;
let connections: WebSocket[] = [];
let actions: Action[] = [];
let pendingResult: { id: string; actionName: string } | null = null;
let actionForceQueue: string[] = [];
let currentGameState: GameState = { availableActions: [] };

wss.on("connection", function connection(ws) {
    console.log("+ Connection opened");
    connections.push(ws);
    ws.on("message", data => {
		try {
			onMessageReceived(JSON.parse(data.toString()) as Message);
		} catch {
			console.error("Caught exception trying to parse message: ");
			console.error(data.toString());
		}
	});
    ws.on("close", () => {
        console.log("- Connection closed");
        connections = connections.filter(c => c != ws);
    });

    send({command: "actions/reregister_all"});
});

function sendAction(actionName: string, fromForce: boolean = false) {
    const id = actionId.toString();
	actionId++;

    // Update game state for cognitive processing
    if (fromForce) {
        currentGameState.availableActions = actions.filter(a => 
            currentGameState.forcedActionNames?.includes(a.name)
        );
        cognitiveEngine.processGameState(currentGameState);
    }

    let action = actions.find(a => a.name === actionName);
    
    // If no specific action but we have a force, let cognitive engine decide
    if (!action && fromForce && currentGameState.availableActions.length > 0) {
        const selectedAction = cognitiveEngine.selectAction(currentGameState.availableActions, currentGameState);
        if (selectedAction) {
            action = selectedAction;
            console.log(`🎯 ${cognitiveEngine.getPersonalityCommentary(selectedAction)}`);
        }
    }

    if (!action) return;

    // Generate action data using cognitive engine
    let responseData: string | undefined;
    const generatedData = cognitiveEngine.generateActionData(action);
    
    if (generatedData) {
        responseData = JSON.stringify(generatedData);
    } else if (action.schema) {
        // Fallback to schema faker if cognitive engine doesn't generate data
        responseData = JSON.stringify(JSONSchemaFaker.generate(action.schema));
    }

    send({command: "action", data: {id, name: action.name, data: responseData}});
}

async function onMessageReceived(message: Message) {
    console.log("<---", util.inspect(message, false, null, true));

    switch (message.command) {
        case "actions/register": {
            actions.push(...(message.data.actions as Action[]));
            currentGameState.availableActions = actions;
            console.log(`📝 Registered ${message.data.actions.length} actions. Total: ${actions.length}`);
            break;
        }

        case "actions/unregister": {
            actions = actions.filter(a => !message.data.action_names.includes(a.name));
            currentGameState.availableActions = actions;
            console.log(`🗑️  Unregistered ${message.data.action_names.length} actions. Remaining: ${actions.length}`);
            break;
        }

        case "actions/force": {
            // Store force context in game state
            currentGameState.state = message.data.state;
            currentGameState.query = message.data.query;
            currentGameState.forcedActionNames = message.data.action_names;

            console.log(`⚡ Force received: "${message.data.query}"`);
            console.log(`   Available actions: ${message.data.action_names.join(', ')}`);

            if (pendingResult === null) {
                // Let cognitive engine decide which action to take
                setTimeout(() => sendAction('', true), 500);
            } else {
                console.warn("! Received new actions/force while waiting for result; sent to queue");
                actionForceQueue.push('__force__'); // Special marker for force
            }
            break;
        }

        case "action/result": {
            if (pendingResult === null) {
                console.warn(`! Received unexpected action/result: '${message.data.id}'`);
                break;
            }

            if (message.data.id === pendingResult.id) {
                const actionName = pendingResult.actionName;
                pendingResult = null;

                if (!message.data.success) {
                    console.warn(`❌ Action failed: ${actionName}. Retrying...`);
                    setTimeout(() => sendAction(actionName, false), 500);
                } else {
                    console.log(`✅ Action succeeded: ${actionName}`);
                    if (message.data.message) {
                        console.log(`   Message: ${message.data.message}`);
                    }
                    
                    if (actionForceQueue.length > 0) {
                        const next = actionForceQueue.shift();
                        if (next === '__force__') {
                            setTimeout(() => sendAction('', true), 500);
                        } else {
                            setTimeout(() => sendAction(next, false), 500);
                        }
                    }
                }
            } else {
                console.warn(`! Received unknown action/result '${message.data.id}' while waiting for '${pendingResult.id}'`);
            }
            break;
        }
    }
}

export function send(msg: Message) {
	if (msg.command === "action") {
		pendingResult = {id: msg.data.id, actionName: msg.data.name};
	}
	
    console.log("--->", util.inspect(msg, false, null, true));

    const msgStr = JSON.stringify(msg);
    for (const connection of connections) {
        connection.send(msgStr);
    }
}
