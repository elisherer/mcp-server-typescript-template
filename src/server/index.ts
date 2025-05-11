import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import calculateBmi from "./tools/calculate-bmi";
import fetchWeather from "./tools/fetch-weather";

export default function getServer() {

  const server = new McpServer(
    {
      name: "my-tools",
      version: "0.0.1",
    },
  )

  calculateBmi(server);
  fetchWeather(server);

  return server;
}