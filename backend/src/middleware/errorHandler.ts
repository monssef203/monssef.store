import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

/**
 * Global error handler middleware.
 * Catches AppError for structured responses and logs unexpected errors.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof Error) {
    console.error("Unhandled error:", err.message);

    // Prisma known errors
    if (err.name === "PrismaClientKnownRequestError") {
      const prismaErr = err as import("@prisma/client/runtime/library").PrismaClientKnownRequestError;
      // E.g. unique constraint violation
      if (prismaErr.code === "P2002") {
        return res.status(409).json({ error: "A record with this value already exists.", code: "CONFLICT" });
      }
      if (prismaErr.code === "P2025") {
        return res.status(404).json({ error: "Record not found or already deleted.", code: "NOT_FOUND" });
      }
      return res.status(400).json({ error: "Database operation failed.", code: "DATABASE_ERROR" });
    }

    return res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }

  return res.status(500).json({
    error: "An unexpected error occurred.",
    code: "INTERNAL_ERROR",
  });
}

/**
 * Not-found handler for any unmatched route.
 */
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Endpoint not found.", code: "NOT_FOUND" });
}
