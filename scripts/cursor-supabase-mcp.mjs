#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const cursorMcpConfigPath = '/Users/tommy/.cursor/mcp.json'
const defaultProjectRef = readProjectRef()

function readProjectRef() {
  const projectDocPath = path.join(repoRoot, '.codex/supabase-project.md')
  if (fs.existsSync(projectDocPath)) {
    const text = fs.readFileSync(projectDocPath, 'utf8')
    const match = text.match(/Project ref:\s*([a-z0-9]+)/i)
    if (match) return match[1]
  }

  const configPath = path.join(repoRoot, 'supabase/config.toml')
  if (fs.existsSync(configPath)) {
    const text = fs.readFileSync(configPath, 'utf8')
    const match = text.match(/^id\s*=\s*"([^"]+)"/m)
    if (match) return match[1]
  }

  return null
}

function readCursorSupabaseServer() {
  if (!fs.existsSync(cursorMcpConfigPath)) {
    throw new Error(`Cursor MCP config not found at ${cursorMcpConfigPath}`)
  }

  const config = JSON.parse(fs.readFileSync(cursorMcpConfigPath, 'utf8'))
  const server = config.mcpServers?.supabase
  if (!server?.url || !server?.headers?.Authorization) {
    throw new Error('Cursor Supabase MCP config is missing url or Authorization header')
  }

  return server
}

function parseMcpResponse(text) {
  if (!text.trim()) return null
  if (text.startsWith('event:')) {
    const dataLine = text.split('\n').find((line) => line.startsWith('data:'))
    return dataLine ? JSON.parse(dataLine.slice(5).trim()) : null
  }
  return JSON.parse(text)
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function postMcp(server, payload, sessionId = null) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(server.url, {
        method: 'POST',
        headers: {
          ...server.headers,
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
        },
        body: JSON.stringify(payload),
      })
      const text = await response.text()
      return {
        ok: response.ok,
        status: response.status,
        sessionId: response.headers.get('mcp-session-id') || sessionId,
        json: parseMcpResponse(text),
        text,
      }
    } catch (error) {
      lastError = error
      await sleep(500 * (attempt + 1))
    }
  }
  throw lastError
}

async function connect(server) {
  const init = await postMcp(server, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'scoremax-cursor-supabase-mcp', version: '1.0.0' },
    },
  })

  if (!init.ok || init.json?.error) {
    throw new Error(`Supabase MCP initialize failed (${init.status}): ${init.text.slice(0, 500)}`)
  }

  await postMcp(server, { jsonrpc: '2.0', method: 'notifications/initialized' }, init.sessionId)
  return init.sessionId
}

async function callTool(server, sessionId, name, args) {
  const response = await postMcp(server, {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1e9),
    method: 'tools/call',
    params: { name, arguments: args },
  }, sessionId)

  if (!response.ok || response.json?.error) {
    throw new Error(`${name} failed (${response.status}): ${JSON.stringify(response.json?.error ?? response.text.slice(0, 500))}`)
  }

  return response.json?.result
}

function resultText(result) {
  return (result?.content || []).map((item) => item.text || '').join('\n')
}

function requireProjectRef(value) {
  const projectRef = value || defaultProjectRef
  if (!projectRef) {
    throw new Error('Missing project ref. Pass one explicitly or add .codex/supabase-project.md.')
  }
  return projectRef
}

function usage() {
  return [
    'Usage:',
    '  node scripts/cursor-supabase-mcp.mjs list-projects',
    '  node scripts/cursor-supabase-mcp.mjs tables [project-ref]',
    '  node scripts/cursor-supabase-mcp.mjs advisors <security|performance> [project-ref]',
    '  node scripts/cursor-supabase-mcp.mjs sql [project-ref] <query>',
    '  node scripts/cursor-supabase-mcp.mjs tool <tool-name> <json-args>',
  ].join('\n')
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || command === '--help' || command === '-h') {
    console.log(usage())
    return
  }

  const server = readCursorSupabaseServer()
  const sessionId = await connect(server)

  let result
  if (command === 'list-projects') {
    result = await callTool(server, sessionId, 'list_projects', {})
  } else if (command === 'tables') {
    result = await callTool(server, sessionId, 'list_tables', {
      project_id: requireProjectRef(args[0]),
      schemas: ['public'],
      verbose: false,
    })
  } else if (command === 'advisors') {
    const type = args[0]
    if (type !== 'security' && type !== 'performance') {
      throw new Error('advisors requires type: security or performance')
    }
    result = await callTool(server, sessionId, 'get_advisors', {
      project_id: requireProjectRef(args[1]),
      type,
    })
  } else if (command === 'sql') {
    const first = args[0]
    const projectRef = /^[a-z0-9]{20}$/.test(first || '') ? first : requireProjectRef(null)
    const query = projectRef === first ? args.slice(1).join(' ') : args.join(' ')
    if (!query.trim()) throw new Error('sql requires a query')
    result = await callTool(server, sessionId, 'execute_sql', {
      project_id: projectRef,
      query,
    })
  } else if (command === 'tool') {
    const [toolName, jsonArgs] = args
    if (!toolName || !jsonArgs) throw new Error('tool requires tool-name and json-args')
    result = await callTool(server, sessionId, toolName, JSON.parse(jsonArgs))
  } else {
    throw new Error(`Unknown command: ${command}\n${usage()}`)
  }

  const text = resultText(result)
  console.log(text || JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
