import {
  InteractionResponse,
} from 'Root';

export declare global {

  type Execute = Promise<InteractionResponse | void>;
};