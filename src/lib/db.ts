// Re-export database functions from mysql.ts for consistency
// This module provides a unified interface for database operations

export { 
  queryOne, 
  queryMany, 
  executeQuery as execute,
  testConnection,
  pool 
} from './mysql'

// Default export for backward compatibility
export { default } from './mysql'