import { integer, pgTable, pgEnum, serial, text, timestamp, uuid, json, real, index } from 'drizzle-orm/pg-core';

export const actionEnum = pgEnum('action', ['APPROVE', 'REJECT', 'RETRY']);

export const usersTable = pgTable('users_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const auditLogTable = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  durationMs: integer('duration_ms'),
  input_question: text('input_question'),
  input_answer: text('input_answer'),
  result_action: actionEnum('result_action'),
  result_score: real('result_score'),
  result_details: json('result_details')
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  timestampIdx: index('timestamp_idx').on(table.timestamp),
}));