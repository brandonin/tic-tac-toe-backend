import express from 'express';
import { loadResolversFiles } from 'graphql-toolkit';
import { ApolloServer } from 'apollo-server-express';
import { schemaDef } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

const PORT = process.env.PORT || 4000;

const app = express();

export interface IContext extends ExpressContext {
    prisma: PrismaClient,
};

const server = new ApolloServer({
    schema: schemaDef,
    resolvers: loadResolversFiles(__dirname + '/resolvers/'),
    context: (request): IContext => {
        return {
            ...request,
            prisma,
        }
    },
});

server.applyMiddleware({ app });

app.listen({port: PORT}, () => console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`))
