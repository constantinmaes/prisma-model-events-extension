import * as EventEmitter2 from 'eventemitter2';

import { Prisma } from '@prisma/client';

export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count';

export type When = 'before' | 'after';

export interface EventEmitter {
    emit(event: symbol | string, ...values: any[]): boolean;
}

export interface ModelEventsConfig {
    model: string;
    actions: PrismaAction[];
    when: When[];
}

const getEventName = (
    model: string | undefined,
    action: PrismaAction,
    when: When,
) => `${when}.${model?.toLowerCase()}.${action.toLowerCase()}`;

export class PrismaModelEventsExtension {
    private eventEmitter: EventEmitter;

    constructor(
        private config: ModelEventsConfig[],
        eventEmitter: EventEmitter,
    ) {
        this.eventEmitter = eventEmitter;
    }

    static setup(config: ModelEventsConfig[], eventEmitter: EventEmitter) {
        return new PrismaModelEventsExtension(config, eventEmitter);
    }

    getExtension() {
        const config = this.config;
        const emitter = this.eventEmitter;

        return Prisma.defineExtension({
            name: 'prisma-model-events-extension',
            query: {
                async $allOperations({ model, operation, args, query }) {
                    const modelMatch = config.find((c) => c.model === model);
                    const op = operation as PrismaAction;

                    if (!modelMatch || modelMatch.actions.includes(op)) {
                        return query(args);
                    }

                    if (
                        (modelMatch.when &&
                            modelMatch.when.includes('before')) ||
                        modelMatch.actions.includes(op)
                    ) {
                        emitter.emit(
                            getEventName(
                                model,
                                operation as PrismaAction,
                                'before',
                            ),
                            args,
                        );
                    }

                    const results = await query(args);

                    if (
                        (modelMatch.when &&
                            modelMatch.when.includes('after')) ||
                        modelMatch.actions.includes(op)
                    ) {
                        emitter.emit(
                            getEventName(model, op as PrismaAction, 'after'),
                            args,
                            results,
                        );
                    }

                    return results;
                },
            },
        });
    }
}
