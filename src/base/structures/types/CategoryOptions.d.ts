import { PermissionsString } from 'Root';

export declare global {

  interface CategoryOptions {

    emoji?: string;

    ownerOnly?: boolean;
    permissions?: { executor: PermissionsString[] | false; client: PermissionsString[] | false; } | false;

    enabled?: boolean;
  };
};