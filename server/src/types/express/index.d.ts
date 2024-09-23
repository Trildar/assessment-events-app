import type { AuthTokenData } from "../../middleware/auth.ts"

declare global {
    namespace Express {
        export interface Request {
            auth_token_data?: AuthTokenData;
        }
    }
}
