import {
  Embed,
  User,
  SelectMenuInteraction,
} from 'Root';

export declare global {

  interface PaginateOptions {
    users?: User[];
    ephemeral?: boolean;
    showPages?: boolean;
    pageSize?: number;
    sorts?: Array<{ emoji?: string; label?: string; description?: string; sort: (first: any, last: any) => number; }>;
    menus: (sort?: (first: any, last: any) => number) => Promise<Array<{ default?: boolean; emoji?: string; label?: string; description?: string; value: Embed[] | string[]; links?: Array<{ emoji?: string; label: string; url: string; disabled?: boolean; }>; errorResponse?: string; }>>;
    embeds?: (data: { value: string[]; first: number; last: number; label: string; emoji: string; page: number; pages: number; }) => Promise<Embed[]>;
  };

  interface PaginateWithTransactionsOptions {
    users?: User[];
    ephemeral?: boolean;
    pageSize?: number;
    showPages?: boolean;
    sorts?: Array<{ emoji?: string; label?: string; description?: string; sort: (first: any, last: any) => number; }>;
    filters?: Array<{ emoji?: string; label?: string; description?: string; filter: (value: any) => boolean; }>;
    menus: (sort?: (first: any, last: any) => number, filters: Array<{ emoji?: string; label?: string; description?: string; filter: (value: any) => boolean; }>) => Promise<Array<{ emoji?: string; label?: string; description?: string; value: Embed[] | string[]; links?: Array<{ label: string; url: string; disabled?: boolean; }>; }>>;
    transactions?: { placeholder: string; get?: (value: string) => Promise<any>; options: (first: number, last: number, sort?: (first: any, last: any) => number, filter?: (value: any) => boolean) => Promise<Array<{ emoji?: string; label?: string; description?: string; value: string; execute: (menu: SelectMenuInteraction, ...items?: any[]) => Promise<void>; }>>; };
    embeds?: (data: { value: string[]; first: number; last: number; label: string; emoji: string; page: number; pages: number; }) => Promise<Embed[]>;
  };
};