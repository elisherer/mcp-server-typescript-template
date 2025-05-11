# Getting Started

- Checkout the repository
- Run in shell 
  - `npm i` (or your other node package manager of choice)
  - `npm run dev` (this will listen to changes on the file-system)

# Local Testing

- Install [Ollama](https://ollama.com/) (macOs: install shell during installation)

- `ollama pull llama3.2`

- `ollama serve` (should listen on port `11434`)

- Download and run [Dive](https://github.com/OpenAgentPlatform/Dive/releases)

- In **Model Settings** choose **+ Add Provider**, choose `ollama` and `http://localhost:11434`

- In **Tool Management (MCP)** put the MCP server config (make sure MCP server is running). Example

```json
{
  "mcpServers": {
    "my-tools": {
      "transport": "sse",
      "enabled": true,
      "url": "http://localhost:3001/sse"
    }
  }
}
```

- If MCP server installed correctly, it should show all the tasks it supports  

- Now you can chat and it will run tools based on the prompt
