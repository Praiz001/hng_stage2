import { getDBTable } from "./connection";

export class Repository<T> {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    /**
     * Use this method when you want to run a query that is not supported by one of the methods in this class
     * Example:
     * const repo = new Repository("tableName")
     * return repo.buildQuery().select('*').where('column', value)
     */
    buildQuery(tableAlias?: string) {
        if (tableAlias) {
            return getDBTable(`${this.tableName} as ${tableAlias}`)
        }
        return getDBTable(this.tableName);
    }

    async delete(options: Partial<T>, orWhere?: Partial<T>): Promise<number> {
        const query = getDBTable(`${this.tableName}`).where((builder) => {
            if (orWhere) {
                builder.where(options).orWhere(orWhere);
            } else {
                builder.where(options);
            }
        }).delete();
        const id = await query;
        return id;
    }

    async findAll(): Promise<T[]> {
        const query = getDBTable(this.tableName).select('*');
        const result = await query;
        return result as T[];
    }

    async findById(id: number): Promise<T> {
        const query = getDBTable(this.tableName).select('*').where('id', id).first();
        const result = await query;
        return result as T;
    }

    async findOneWhere(options: Partial<T>, orWhere?: Partial<T>): Promise<T> {
        const query = getDBTable(this.tableName).select('*').where((builder) => {
            if (orWhere) {
                builder.where(options).orWhere(orWhere);
            } else {
                builder.where(options);
            }
        }).first();
        const results = await query;
        return results as T;
    }

    async findOneWhereNot(whereNot: Partial<T>, andWhere?: Partial<T>): Promise<T> {
        const query = getDBTable(this.tableName).select('*').whereNot((builder) => {
            if (andWhere) {
                builder.andWhere(andWhere).andWhereNot(whereNot).first();
            } else {
                builder.whereNot(whereNot).first();
            }
        });
        const results = await query;
        return results as T;
    }

    async findWhere(options: Partial<T>, orWhere?: Partial<T>): Promise<T[]> {
        const query = getDBTable(this.tableName).select('*').where((builder) => {
            if (orWhere) {
                builder.where(options).orWhere(orWhere);
            } else {
                builder.where(options);
            }
        });
        const results = await query;
        return results as T[];
    }

    async findWhereNot(whereNot: Partial<T>, andWhere?: Partial<T>): Promise<T[]> {
        const query = getDBTable(this.tableName).select('*').whereNot((builder) => {
            if (andWhere) {
                builder.andWhere(andWhere).andWhereNot(whereNot);
            } else {
                builder.whereNot(whereNot);
            }
        });
        const results = await query;
        return results as T[];
    }

    async insert(data: Partial<T>): Promise<number> {
        const query = getDBTable(this.tableName).insert(data);
        const [id] = await query;
        return id;
    }

    async insertMany(data: Partial<T>[]): Promise<number> {
        const query = getDBTable(this.tableName).insert(data);
        const [id] = await query;
        return id;
    }

    /**
     * Only pass a knex.QueryBuilder into this function or else it will misbehave
     * @param query - a knex.QueryBuilder you can await to query the database
     */
    async runQuery(query: any) {
        return await query;
    }

    /**
     *
     * @param data - the data you want to update
     * @param where - the condition under which to update
     */
    async updateDataWhere(data: Partial<T>, where: Partial<T>): Promise<number> {
        const query = getDBTable(this.tableName).where(where).update(data);
        const id = await query;
        return id;
    }
}