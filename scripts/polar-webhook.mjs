#!/usr/bin/env node
// Manage the Polar AccessLink webhook (one per client app).
//
//   node scripts/polar-webhook.mjs list
//   node scripts/polar-webhook.mjs create https://app.w3runn3rs.com/api/integrations/polar/webhook
//   node scripts/polar-webhook.mjs activate
//   node scripts/polar-webhook.mjs delete <webhook-id>
//
// Reads POLAR_CLIENT_ID / POLAR_CLIENT_SECRET from the environment or .env.local.
// `create` prints signature_secret_key ONCE — put it in Vercel as POLAR_WEBHOOK_SECRET
// and redeploy. Polar pings the URL on create: the endpoint must already be deployed.
import { readFileSync } from "node:fs"

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=["']?(.*?)["']?\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {
    // no .env.local
  }
}
loadEnv()

const { POLAR_CLIENT_ID: id, POLAR_CLIENT_SECRET: secret } = process.env
if (!id || !secret) {
  console.error("POLAR_CLIENT_ID and POLAR_CLIENT_SECRET are required")
  process.exit(1)
}
const auth = `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`
const API = "https://www.polaraccesslink.com/v3/webhooks"

async function call(method, path = "", body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: auth, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  console.log(`${method} ${API}${path} → ${res.status}`)
  if (text) console.log(text)
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === "list") await call("GET")
else if (cmd === "create" && arg) await call("POST", "", { events: ["EXERCISE"], url: arg })
else if (cmd === "activate") await call("POST", "/activate")
else if (cmd === "delete" && arg) await call("DELETE", `/${encodeURIComponent(arg)}`)
else {
  console.log("usage: node scripts/polar-webhook.mjs list | create <url> | activate | delete <id>")
  process.exit(1)
}
