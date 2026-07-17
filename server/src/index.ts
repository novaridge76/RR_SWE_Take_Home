import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const PORT = Number(process.env.PORT ?? 4000);

const typeDefs = `#graphql
  type Query {
    health: String!
  }
`;

const resolvers = {
  Query: {
    health: () => "DayMark API is running",
  },
};

async function main() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`DayMark GraphQL API ready at ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
