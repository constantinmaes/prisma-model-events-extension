# Prisma Model Events Extension

## Disclaimer

This Prisma client extension is heavily inspired by the [AvantaR/prisma-event-dispatcher](https://github.com/AvantaR/prisma-event-dispatcher). Since middlewares are deprecated since version 4.16.0., this replaces it with a [query extension](https://www.prisma.io/docs/orm/prisma-client/client-extensions/query).

## Installation

```
npm i prisma-model-events-extension
```

## Usage

```js
const client = new PrismaClient().$extends(
    PrismaModelExtension.setup(config).getExtension(),
);
```

### Configuration

To use the extension, you have to pass an **array** of configuration objects per model of the following form:

```ts
interface ModelEventsConfig {
    model: string; // your model name
    actions: PrismaAction[]; // an array of supported Prisma operations;
    when: When[]; // 'before', 'after'
}
```

#### Supported Prisma operations

```ts
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
| 'count'
```

## Behaviour

Ths extension uses the [eventemitter2](https://www.npmjs.com/package/eventemitter2) package and emits events named as such (all lowercase):

```ts
when.model.operation; // e.g. before.user.findmany or after.user.create
```

Feel free to listen to them elsewhere in your code.
