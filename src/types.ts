import { objectType, mutationType, stringArg, makeSchema, fieldAuthorizePlugin, queryType } from '@nexus/schema';
import { nexusPrismaPlugin } from 'nexus-prisma';
import path from 'path';

import newGame from './utils/newGame';
import { IContext } from '.';

const Initialize = objectType({
    name: 'Initialize',
    definition(t) {
        t.field('game', { type: Game });
    },
});

const Reset = objectType({
    name: 'Reset',
    definition(t) {
        t.field('board', { type: Board });
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
        t.model.score();
        
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
        t.model.squares({ordering: true});
    },
});

const Square = objectType({
    name: 'Square',
    definition(t) {
        t.model.id();
        t.model.value();
        t.model.position();
        // t.model.xPosition();
        // t.model.yPosition();
        t.model.createdAt();
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
        t.crud.updateOneGame();
        t.crud.updateOneSquare();
        t.crud.updateOneScore();
        t.field('initialize', {
            type: Initialize,
            args: {
                username1: stringArg(),
                username2: stringArg(),
            },
            async resolve (parent, args, ctx: IContext) {
                const squares = newGame();

                const user1 = await ctx.prisma.user.create({
                    data: {
                        name: args.username1,
                        symbol: "X",
                        score: {
                            create: {
                                value: 0,
                            }
                        }
                    }
                })

                const game = await ctx.prisma.game.create({
                    data: {
                        whosTurn: {
                            connect: {
                                id: user1.id,
                            }
                        },
                        users: {
                            connect: [{
                                id: user1.id,
                            }],
                            create: [
                                {
                                    name: args.username2,
                                    symbol: "O",
                                    score: {
                                        create: {
                                            value: 0,
                                        }
                                    }
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
        });
        t.field('reset', {
            type: Reset,
            args: {
                boardId: stringArg(),
            },
            async resolve (parent, args, ctx: IContext) {
                const squares = await ctx.prisma.board.findOne({where: { id: args.boardId }}).squares();
                const squaresId = squares.map(({id}) => id);
                await ctx.prisma.square.updateMany({ where: { id: { in: squaresId }} , data: { value: "" } });
                
                const board = await ctx.prisma.board.findOne({ where: { id: args.boardId } });
                return  {
                    board,
                }
            }
        })
    },
});

const generateArtifacts = Boolean(process.env.GENERATE_ARTIFACTS);

export const schemaDef = makeSchema({
    types: [Query, Mutation, User, Game, Score, Board, Square, Initialize, Reset],
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
