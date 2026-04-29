/**
 * jest.setup.ts
 *
 * Se ejecuta antes de cualquier test (configurado en jest.config via setupFiles).
 * Define variables de entorno en memoria para que los tests no necesiten
 * leer un archivo .env real ni conectarse a la base de datos.
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-secret-super-seguro-para-jest-12345';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'mysql://root:test@127.0.0.1:3306/gestor_test';
