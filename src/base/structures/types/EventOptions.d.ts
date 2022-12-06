export declare global {

  interface EventOptions {

    type: keyof ClientEvents;
    enabled?: boolean;
  };
};