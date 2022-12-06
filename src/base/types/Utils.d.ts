import { Document, Types } from 'mongoose';

// Numbers
type PrependNextNum<A extends unknown[]> = A['length'] extends infer T ? ((t: T, ...a: A) => void) extends ((...x: infer X) => void) ? X : never : never;
type EnumerateInternal<A extends unknown[], N extends number> = { 0: A; 1: EnumerateInternal<PrependNextNum<A>, N>; }[N extends A['length'] ? 0 : 1];
type Enumerate<N extends number> = EnumerateInternal<[], N> extends Array<infer E> ? E : never;

// AsyncReturnType
type PromiseValue<PromiseType> = PromiseType extends PromiseLike<infer Value> ? PromiseValue<Value> : PromiseType;
type AsyncFunction = (...args: any[]) => Promise<unknown>;

export declare global {

  type Numbers<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;
  type AsyncReturnType<Target extends AsyncFunction> = PromiseValue<ReturnType<Target>>;

  type SchemaType<Schema extends unknown> = Document<unknown, any, Schema> & Schema & { _id: Types.ObjectId; };
};