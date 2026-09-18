// @ts-nocheck
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";

   export default defineCloudflareConfig({
     default: {
       override: {
         wrapper: "cloudflare-node",
         converter: "edge",
         proxyExternalRequest: "fetch",
       },
     },
     edgeExternals: ["node:crypto"],
     middleware: {
       external: true,
       override: {
         wrapper: "cloudflare-edge",
         converter: "edge",
         proxyExternalRequest: "fetch",
       },
     },
   });
