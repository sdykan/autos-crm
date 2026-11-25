/**
 * In-browser stand-in for the Supabase client, used when no Supabase keys are configured.
 * Supports the subset of the query builder and auth API this app uses.
 * Data lives in localStorage, so changes survive a page reload.
 */
import { createDemoDb, type DemoDb, type DemoRow } from './demoData';

const STORAGE_KEY = 'autos-crm-demo-db-v1';
const SESSION_KEY = 'autos-crm-demo-session';

type Table = keyof DemoDb;
type Result = { data: unknown; error: { message: string } | null; count?: number | null };
type Filter = (row: DemoRow) => boolean;

function loadDb(): DemoDb {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as DemoDb;
    } catch {
        /* storage unavailable or corrupted: start fresh */
    }
    const db = createDemoDb();
    saveDb(db);
    return db;
}

function saveDb(db: DemoDb): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
        /* storage unavailable: keep data in memory only */
    }
}

let db: DemoDb | null = null;
const getDb = (): DemoDb => (db ??= loadDb());

/** Restore the original demo data */
export function resetDemoData(): void {
    db = createDemoDb();
    saveDb(db);
}

/** Relations in selects like `car:cars ( nr, fahrzeug )` → attach row from `cars` by `car_id` */
function parseRelations(columns: string): { alias: string; table: Table }[] {
    const relations: { alias: string; table: Table }[] = [];
    const re = /(\w+)\s*:\s*(\w+)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(columns)) !== null) {
        relations.push({ alias: match[1], table: match[2] as Table });
    }
    return relations;
}

class QueryBuilder implements PromiseLike<Result> {
    private filters: Filter[] = [];
    private orderBy: { column: string; ascending: boolean } | null = null;
    private columns = '*';
    private countOnly = false;
    private returnSingle = false;
    private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private payload: Record<string, unknown>[] = [];
    private patch: Record<string, unknown> = {};
    private returning = false;

    private readonly table: Table;

    constructor(table: Table) {
        this.table = table;
    }

    select(columns = '*', options?: { count?: string; head?: boolean }): this {
        this.columns = columns;
        if (this.mode !== 'select') this.returning = true;
        if (options?.head) this.countOnly = true;
        return this;
    }

    insert(values: Record<string, unknown> | Record<string, unknown>[]): this {
        this.mode = 'insert';
        this.payload = Array.isArray(values) ? values : [values];
        return this;
    }

    update(patch: Record<string, unknown>): this {
        this.mode = 'update';
        this.patch = patch;
        return this;
    }

    delete(): this {
        this.mode = 'delete';
        return this;
    }

    eq(column: string, value: unknown): this {
        this.filters.push((row) => row[column] === value);
        return this;
    }

    neq(column: string, value: unknown): this {
        this.filters.push((row) => row[column] !== value);
        return this;
    }

    not(column: string, operator: string, value: unknown): this {
        if (operator === 'is' && value === null) {
            this.filters.push((row) => row[column] !== null && row[column] !== undefined);
        }
        return this;
    }

    order(column: string, options?: { ascending?: boolean }): this {
        this.orderBy = { column, ascending: options?.ascending ?? true };
        return this;
    }

    single(): this {
        this.returnSingle = true;
        return this;
    }

    then<TResult1 = Result, TResult2 = never>(
        onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        return Promise.resolve().then(() => this.execute()).then(onfulfilled, onrejected);
    }

    private execute(): Result {
        const database = getDb();
        const rows = database[this.table];
        const matches = (row: DemoRow) => this.filters.every((f) => f(row));

        if (this.mode === 'insert') {
            const nextNr = rows.reduce((max, r) => Math.max(max, Number(r.nr) || 0), 0) + 1;
            const inserted = this.payload.map((values, i) => ({
                id: `${this.table}-${crypto.randomUUID()}`,
                nr: nextNr + i,
                created_at: new Date().toISOString(),
                ...values,
            })) as DemoRow[];
            rows.push(...inserted);
            saveDb(database);
            return this.respond(this.returning ? inserted : null);
        }

        if (this.mode === 'update') {
            const updated = rows.filter(matches);
            updated.forEach((row) => Object.assign(row, this.patch));
            saveDb(database);
            return this.respond(this.returning ? updated : null);
        }

        if (this.mode === 'delete') {
            database[this.table] = rows.filter((row) => !matches(row));
            saveDb(database);
            return { data: null, error: null };
        }

        let result = rows.filter(matches);
        if (this.countOnly) return { data: null, error: null, count: result.length };

        if (this.orderBy) {
            const { column, ascending } = this.orderBy;
            result = [...result].sort((a, b) => {
                const av = a[column] as number | string;
                const bv = b[column] as number | string;
                if (av === bv) return 0;
                return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
            });
        }

        const relations = parseRelations(this.columns);
        const data = result.map((row) => {
            const copy: Record<string, unknown> = { ...row };
            for (const { alias, table } of relations) {
                copy[alias] = database[table]?.find((r) => r.id === row[`${alias}_id`]) ?? null;
            }
            return copy;
        });

        return this.respond(data, result.length);
    }

    private respond(data: unknown[] | null, count?: number): Result {
        if (this.returnSingle) {
            const first = data?.[0] ?? null;
            return first ? { data: first, error: null } : { data: null, error: { message: 'Row not found' } };
        }
        return { data, error: null, count: count ?? null };
    }
}

type AuthListener = (event: string, session: unknown) => void;
const listeners = new Set<AuthListener>();

function readSession(): unknown {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeSession(session: unknown): void {
    try {
        if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        else localStorage.removeItem(SESSION_KEY);
    } catch {
        /* ignore */
    }
    listeners.forEach((listener) => listener(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}

const demoAuth = {
    async getSession() {
        return { data: { session: readSession() }, error: null };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
        const session = { user: { id: 'demo-user', email }, access_token: 'demo' };
        writeSession(session);
        return { data: { session, user: session.user }, error: null };
    },
    async signUp({ email }: { email: string; password: string }) {
        return { data: { user: { id: 'demo-user', email }, session: null }, error: null };
    },
    async signOut() {
        writeSession(null);
        return { error: null };
    },
    onAuthStateChange(listener: AuthListener) {
        listeners.add(listener);
        return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
    },
};

export const demoClient = {
    from: (table: string) => new QueryBuilder(table as Table),
    auth: demoAuth,
};
