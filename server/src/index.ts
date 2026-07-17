import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers, typeDefs } from "./schema.js";
import { initStore, seedIfEmpty } from "./store.js";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  initStore();
  seedIfEmpty();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`API ready at ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
