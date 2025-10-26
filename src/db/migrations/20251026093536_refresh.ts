import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('refreshes', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.integer('total_countries').notNullable();
        table.string('last_refreshed_at').notNullable();
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('refreshes');
}

