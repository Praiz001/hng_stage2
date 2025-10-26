import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('countries', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('capital').nullable();
        table.string('region').notNullable();
        table.bigInteger('population').notNullable();
        table.string('currency_code').nullable();
        table.decimal('exchange_rate', 10, 2).nullable();
        table.decimal('estimated_gdp', 15, 2).nullable();
        table.string('flag_url').notNullable();
        table.string('last_refreshed_at').notNullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('countries');
}

