// SQL 쿼리 로깅 유틸리티 (서버 터미널 출력용)
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 쿼리 로그 포맷
 */
interface QueryLog {
    timestamp: string;
    table: string;
    operation: string;
    query: string;
    duration?: number;
}

/**
 * 서버 터미널에 쿼리 로그 출력
 * (브라우저 및 운영환경에서는 무시)
 */
const logQuery = (log: QueryLog) => {
    // 클라이언트(F12) 또는 운영환경(production)에서는 출력하지 않음
    if (typeof window !== "undefined" || process.env.NODE_ENV !== "development") return;

    const { timestamp, table, operation, query, duration } = log;

    // Node.js 터미널 컬러 출력
    console.log("\n" + "\x1b[36m" + "=".repeat(80) + "\x1b[0m");
    console.log(`🔍 [Supabase Query] ${timestamp}`);
    console.log(`📊 Table: ${table} | Operation: ${operation}`);
    console.log(`📝 Query:\n${query}`);
    if (duration !== undefined) {
        console.log(`⏱️  Duration: ${duration}ms`);
    }
    console.log("\x1b[36m" + "=".repeat(80) + "\x1b[0m" + "\n");
};

/**
 * PostgrestQueryBuilder를 래핑하여 쿼리 로깅 추가
 */
export const wrapQueryWithLogging = (
    originalQuery: unknown,
    tableName: string,
    queryParts: string[] = []
) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    const wrappedQuery = new Proxy(originalQuery as object, {
        get(target, prop: string) {
            const originalMethod = (target as Record<string, unknown>)[prop];

            if (typeof originalMethod === "function") {
                return function (...args: unknown[]) {
                    const result = originalMethod.apply(target, args);
                    const newQueryParts = [...queryParts];

                    if (prop === "insert") {
                        newQueryParts.push(`INSERT INTO ${tableName}`);
                        newQueryParts.push(`VALUES (${JSON.stringify(args[0], null, 2)})`);
                    } else if (prop === "update") {
                        newQueryParts.push(`UPDATE ${tableName}`);
                        newQueryParts.push(`SET ${JSON.stringify(args[0], null, 2)}`);
                    } else if (prop === "delete") {
                        newQueryParts.push(`DELETE FROM ${tableName}`);
                    } else if (prop === "select") {
                        const columns = args[0] || "*";
                        newQueryParts.push(`SELECT ${columns}`);
                        newQueryParts.push(`FROM ${tableName}`);
                    } else if (prop === "eq") {
                        newQueryParts.push(`WHERE ${args[0]} = '${args[1]}'`);
                    } else if (prop === "neq") {
                        newQueryParts.push(`WHERE ${args[0]} != '${args[1]}'`);
                    } else if (prop === "gt") {
                        newQueryParts.push(`WHERE ${args[0]} > '${args[1]}'`);
                    } else if (prop === "gte") {
                        newQueryParts.push(`WHERE ${args[0]} >= '${args[1]}'`);
                    } else if (prop === "lt") {
                        newQueryParts.push(`WHERE ${args[0]} < '${args[1]}'`);
                    } else if (prop === "lte") {
                        newQueryParts.push(`WHERE ${args[0]} <= '${args[1]}'`);
                    } else if (prop === "in") {
                        newQueryParts.push(`WHERE ${args[0]} IN (${(args[1] as unknown[]).join(", ")})`);
                    } else if (prop === "order") {
                        const direction = (args[1] as { ascending?: boolean })?.ascending ? "ASC" : "DESC";
                        newQueryParts.push(`ORDER BY ${args[0]} ${direction}`);
                    } else if (prop === "limit") {
                        newQueryParts.push(`LIMIT ${args[0]}`);
                    } else if (prop === "single") {
                        newQueryParts.push(`LIMIT 1`);
                    }

                    // 쿼리 실행 완료 시 로그 출력
                    if (prop === "then") {
                        const duration = Date.now() - startTime;
                        const operation = newQueryParts[0]?.split(" ")[0] || "SELECT";
                        const queryStr = newQueryParts.join("\n");

                        logQuery({
                            timestamp,
                            table: tableName,
                            operation,
                            query: queryStr,
                            duration,
                        });
                    }

                    // 체이닝 가능하게 래핑 유지
                    if (result && typeof result === "object" && result !== target) {
                        return wrapQueryWithLogging(result, tableName, newQueryParts);
                    }

                    return result;
                };
            }

            return originalMethod;
        },
    });

    return wrappedQuery;
};

/**
 * Supabase 클라이언트 전체 래핑
 */
export const createLoggedSupabaseClient = (client: SupabaseClient) => {
    return new Proxy(client, {
        get(target, prop: string) {
            const originalMethod = target[prop as keyof SupabaseClient];

            if (prop === "from" && typeof originalMethod === "function") {
                return function (tableName: string) {
                    const query = (originalMethod as (tableName: string) => unknown).call(target, tableName);
                    return wrapQueryWithLogging(query, tableName);
                };
            }

            return originalMethod;
        },
    });
};
