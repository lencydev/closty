export declare global {

  interface HandlerOptions {

    type: keyof ClientEvents;
    enabled?: boolean;
  };
};