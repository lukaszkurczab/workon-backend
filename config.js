const config = {};

config.host = process.env.HOST || "https://localhost:8081";
config.authKey =
  process.env.AUTH_KEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
config.databaseId = "ToDoList";
config.containerId = "Items";

if (config.host.includes("https://localhost:")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log(`App is running on http://localhost:${process.env.PORT || '3000'}`);
}

module.exports = config;