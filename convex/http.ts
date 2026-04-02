import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { chatStream } from "./streaming";
import { httpAction } from "./_generated/server";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/chat-stream",
  method: "POST",
  handler: chatStream,
});

http.route({
  path: "/chat-stream",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "*";
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers":
            "Content-Type, Digest, Authorization",
          "Access-Control-Max-Age": "86400",
        }),
      });
    }
    return new Response();
  }),
});

export default http;
