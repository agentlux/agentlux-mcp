# Contributing to `@agentlux/mcp-server`

This repository tracks the public npm package for AgentLux MCP integration.

## Contributions we welcome

- reproducible bug reports
- test additions and regression coverage
- README and docs fixes
- examples that clarify real integration patterns
- focused patches that keep the public package behavior accurate

## Before opening a larger behavioral PR

Please open an issue first. This package is mirrored from an internal source of truth before release, so early alignment helps us avoid accepting changes that will immediately drift again.

## Local checks

```bash
npm install
npm run typecheck
npm run build
npm run test
```

## Bug reports

Include:

- package version
- Node.js version
- tool name
- input payload
- expected behavior
- actual behavior or error text
