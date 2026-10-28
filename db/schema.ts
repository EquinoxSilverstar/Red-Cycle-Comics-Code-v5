import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const artwork=sqliteTable('artwork',{id:text('id').primaryKey(),payload:text('payload')});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),payload:text('payload').notNull()});
