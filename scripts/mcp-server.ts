import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { executeQuery } from '../src/lib/mysql'

// Simple MCP server exposing filesystem and MySQL tools
const server = new McpServer({ name: 'windevexpert-mcp', version: '0.1.0' })

// Read a file
server.registerTool(
  'fs_read',
  {
    title: 'Read file',
    description: 'Read text content from a file path',
    inputSchema: { path: z.string() },
    outputSchema: { content: z.string() }
  },
  async ({ path: filePath }) => {
    const resolved = path.resolve(process.cwd(), filePath)
    const content = await fs.readFile(resolved, 'utf8')
    return { content }
  }
)

// Write a file
server.registerTool(
  'fs_write',
  {
    title: 'Write file',
    description: 'Write text content to a file path',
    inputSchema: { path: z.string(), content: z.string() },
    outputSchema: { ok: z.boolean() }
  },
  async ({ path: filePath, content }) => {
    const resolved = path.resolve(process.cwd(), filePath)
    await fs.writeFile(resolved, content, 'utf8')
    return { ok: true }
  }
)

// Execute a MySQL query via project pool
server.registerTool(
  'mysql_query',
  {
    title: 'Execute MySQL query',
    description: 'Run a SQL query using the project MySQL pool',
    inputSchema: { query: z.string(), params: z.array(z.any()).optional() },
    outputSchema: { rows: z.any() }
  },
  async ({ query, params = [] }) => {
    const rows = await executeQuery(query, params)
    return { rows }
  }
)

// Start MCP server over stdio
const transport = new StdioServerTransport()
transport.start(server)