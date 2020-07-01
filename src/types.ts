import { objectType, mutationType, stringArg, makeSchema, fieldAuthorizePlugin, queryType } from '@nexus/schema';
import { nexusPrismaPlugin } from 'nexus-prisma';
import path from 'path';

import { IContext } from '.';

const Initialize = objectType({
    name: 'Initialize',
    definition(t) {
        t.field('game', { type: Game });
    },
});

const Game = objectType({
    name: 'Game',
    definition(t) {
        t.model.id();
                
        // relations
        t.model.whosTurn();
        t.model.users();
        t.model.board();
    },
});

const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.symbol();
        
        // relations
        t.model.game();
    },
});

const Score = objectType({
    name: 'Score',
    definition(t) {
        t.model.id();
        t.model.value();

        // relations
        t.model.user();
    },
});

const Board = objectType({
    name: 'Board',
    definition(t) {
        t.model.id();
        t.model.squares();
    },
});

const Square = objectType({
    name: 'Square',
    definition(t) {
        t.model.id();
        t.model.value();
        t.model.xPosition();
        t.model.yPosition();
    },
});

const Query = queryType({
    definition(t) {
        t.crud.user();
        t.crud.users({ ordering: true });
        t.crud.game();
        t.crud.board();
    },
});

const Mutation = mutationType({
    definition(t) {
        t.crud.createOneGame();
        t.crud.updateOneSquare();
        t.crud.updateOneScore();
        t.field('initialize', {
            type: Initialize,
            args: {
                username1: stringArg(),
                username2: stringArg(),
            },
            async resolve (parent, args, ctx: IContext) {
                let squares = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        squares.push({xPosition: j, yPosition: i});
                    }
                }
                // squaresMap = squares.mapctx.prisma.game.create()
                const game = await ctx.prisma.game.create({
                    data: {
                        users: {
                            create: [
                                {
                                    name: args.username1,
                                    symbol: "X",
                                },
                                {
                                    name: args.username2,
                                    symbol: "O",
                                }
                            ]
                        },
                        board: {
                            create: {
                                squares: {
                                    create: squares
                                }
                            }
                        }
                    }
                })
                return {
                    game,
                };
            },
        })
    },
});

const generateArtifacts = Boolean(process.env.GENERATE_ARTIFACTS);

export const schemaDef = makeSchema({
    types: [Query, Mutation, User, Game, Score, Board, Square],
    typegenAutoConfig: {
        sources: [
            {
                source: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
    plugins: [
        nexusPrismaPlugin({
            shouldGenerateArtifacts: generateArtifacts,
        }),
        fieldAuthorizePlugin(),
    ],
    outputs: {
        schema: path.join(__dirname, './schema.graphql'),
        typegen: path.join(
            __dirname,
            '../node_modules/@types/nexus-typegen/index.d.ts'
        ),
    },
});
