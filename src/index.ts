/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	photos_URL: KVNamespace;
}

// 处理存储数据的模块
async function handlePost(request: Request, env: Env) {
	const requestBody = await request.text();

	if (!requestBody) {
		return new Response('Request body is required.', {status: 400});
	}

	const photoData = JSON.parse(requestBody);

	for (const key in photoData) {
		if (Object.prototype.hasOwnProperty.call(photoData, key)) {
			const photoUrl = photoData[key];
			await env.photos_URL.put(key, photoUrl);
		}
	}

	return new Response('Photo data successfully stored in KV.');
}

// 处理读取数据的模块
async function handleGet(request: Request, env: Env) {
	const params = new URL(request.url).searchParams;
	const photoKey = params.get('key');

	if (photoKey) {
		const storedValue = await env.photos_URL.get(photoKey);

		if (storedValue === null) {
			return new Response('Value not found', {status: 404});
		}

		return new Response(storedValue);
	} else {
		return new Response('Parameter "key" is required for GET requests.', {status: 400});
	}
}


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		try {
			if (request.method === 'POST') {
				return await handlePost(request, env);
			} else if (request.method === 'GET') {
				return await handleGet(request, env);
			} else {
				return new Response('Only POST and GET requests are allowed.', {status: 405});
			}
		} catch (err) {
			console.error(`Error processing request: ${err}`);
			return new Response('Internal Server Error', {status: 500});
		}
		
	},
};
