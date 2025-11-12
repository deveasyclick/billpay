# Logging Setup Overview

This document explains how logging is configured and integrated throughout the application.

## 1. Winston Logger Configuration

* The main logger configuration is defined in **`winston-logger.ts`**.
* It sets up multiple **transports**, including:

  * **Console** output for real-time logs.
  * **Rotating file(s)** for persistent storage.
* The setup uses **`winston-daily-rotate-file`** to:

  * Rotate logs on a daily basis.
  * Limit the size of individual log files.
  * Automatically delete expired log files after a configured retention period.

## 2. Request Context Management

* The **`RequestContextMiddleware`** uses **`cls-hooked`** to create a **per-request context namespace**.
* This context allows storing and retrieving request-specific metadata, such as:

  * `requestId`
  * HTTP method
  * URL
  * Other contextual information

This enables correlation of log entries with individual requests across the application lifecycle.

## 3. Logging Interceptor

* The **`LoggingInterceptor`** wraps around each incoming HTTP request.
* On response (or error), it logs:

  * HTTP method
  * Request URL
  * Response status code
  * Request duration
  * The associated `requestId` (retrieved from the context)

This ensures all log entries for a request share the same identifier, making it easier to trace logs end-to-end.

## 4. Integration with NestJS

* In **`main.ts`**, the application configures **NestJS** to use Winston as the logger via:

  ```typescript
  WinstonModule.createLogger(...)
  ```
* The **middleware** and **interceptor** are registered **globally**, ensuring that every route benefits from consistent logging behavior.
