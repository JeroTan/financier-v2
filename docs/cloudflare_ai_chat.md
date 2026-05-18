//On endpoint route in src/pages/api/\*\*
const messageTrail = aiChatController({messageTrail, astroCookies, urlData}); //Since we will store the message trail of cloudflare message in localStorage to save context window! But what matters is we have data in database

//Controller layout
export function aiChatController(){
const llm = "Please use Kimi2.6 in cloudflare" here: "@cf/moonshotai/kimi-k2.6"
const streamOfText = await chatService({messageTrail});

return new Response(streamText, {
headers: {
"Content-Type": "text/event-stream",
"Cache-Control": "no-cache",
Connection: "keep-alive",
},
}

//Service layout
import {env} from "cloudflare:workers" // This is the new way to get the env bindings like env.AI;

export function chatService(){
const toolCalling = toolCallingList(); // This will be for our ai to connect with our database and do something with it;
const system = getSystemMessage(); //This is our instruction fetch from /assets/chat_instruction.md

const messages = [
{ role: "system", content: systemMessage },
...messageTrail,
];
rawResponse = await env.AI.run(model, { // model here is the one you choose in controller
// @ts-expect-error — max_tokens is supported by the API but not in CF types
// Use a small limit for tool rounds — the model only outputs tool call JSON here,
// not prose. Keeping this small leaves room for the large system prompt + tool schemas.
max_tokens: 4096,
messages,
tools,
});
return withFallbackContent(
streamResponse as ReadableStream,
"It seems service is not yet available",
);

}
