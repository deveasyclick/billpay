# TEAM_002: Exception Filters

## Goal
Add a global catch-all exception filter to ensure consistent error responses across all API endpoints.

## Implementation Details
- Create `AllExceptionsFilter` in `src/common/filters`.
- Register filter in `main.ts`.
- Refactor `BillsController` and `PaymentController` to remove redundant try-catch blocks.

## Status
- [x] Planning approved
- [x] Implementation complete
- [x] Verification complete

## Verification Details
- Backend builds successfully via `npm run build`.
- Unit tests for `AllExceptionsFilter` passed (standardizes `HttpException`, generic `Error`, and `ValidationPipe` errors).
- Frontend updated to use consistent error parsing utility.
