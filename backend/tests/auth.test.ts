import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Mocks — se declaran ANTES de cualquier import que use Prisma.
// Jest los eleva (hoists) automáticamente al tope del archivo.
// ---------------------------------------------------------------------------

/** Almacén mutable que los tests pueden reemplazar por test */
const db = {
  user: null as any,
};

/**
 * Mock del cliente Prisma singleton.
 * Intercepta todas las llamadas a prisma.users.findUnique / findFirst / $queryRaw
 * que realizan AuthRepository y authMiddleware.
 */
jest.mock('../src/prisma.config', () => {
  return {
    __esModule: true,
    default: {
      users: {
        findUnique: jest.fn(async () => db.user),
        findFirst: jest.fn(async () => db.user),
        create: jest.fn(async (args: any) => ({ id: BigInt(99), ...args.data })),
        update: jest.fn(async (args: any) => ({ id: BigInt(99), ...args.data })),
      },
      $queryRaw: jest.fn(async () =>
        db.user ? [{ role: db.user.role }] : []
      ),
      $disconnect: jest.fn(),
    },
  };
});

// ---------------------------------------------------------------------------
// Importaciones DESPUÉS de los mocks
// ---------------------------------------------------------------------------
import app from '../src/app';

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------
const PLAIN_PASSWORD = 'Password123!';
const JWT_SECRET = process.env.JWT_SECRET!;

/** Genera un usuario fake completo con password hasheada */
async function buildFakeUser(
  role: 'ADMIN' | 'JUEZ' | 'PARTICIPANTE' = 'ADMIN',
  id = 1
) {
  return {
    id: BigInt(id),
    name: 'Test User',
    email: 'test@example.com',
    password: await bcrypt.hash(PLAIN_PASSWORD, 12),
    role,
    carrera: null,
    no_control: null,
    telefono: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/** Genera un token JWT válido firmado con el secret de test */
function makeToken(userId = 1) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------
describe('Auth endpoints', () => {
  beforeEach(() => {
    // Resetear BD fake antes de cada test
    db.user = null;
  });

  // ─── TEST 1: Login exitoso ────────────────────────────────────────────────
  it('login exitoso → 200 y devuelve token', async () => {
    // Arrange: simular usuario ADMIN en BD
    db.user = await buildFakeUser('ADMIN');

    // Act
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: PLAIN_PASSWORD,
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
  });

  // ─── TEST 2: Sin token → 401 ──────────────────────────────────────────────
  it('acceso a endpoint protegido sin token → 401', async () => {
    // No se envía Authorization header
    const res = await request(app).get('/api/admin/proyectos');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ─── TEST 3: Rol incorrecto → 403 ─────────────────────────────────────────
  it('usuario con rol PARTICIPANTE accediendo a ruta de ADMIN → 403', async () => {
    // Arrange: authMiddleware recupera el usuario de BD por el id del token.
    // Simulamos que ese usuario tiene rol PARTICIPANTE.
    db.user = await buildFakeUser('PARTICIPANTE');

    const token = makeToken(1);

    // Act
    const res = await request(app)
      .get('/api/admin/proyectos')
      .set('Authorization', `Bearer ${token}`);

    // Assert: role.middleware detecta que PARTICIPANTE no puede acceder a ADMIN
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // ─── TEST 4 & 5: Parametrizado — casos de login fallido ───────────────────
  /**
   * Prueba múltiples combinaciones de email/password.
   * - email vacío    → 400 (Zod rechaza la solicitud antes de llegar al servicio)
   * - password wrong → 401 (bcrypt.compare falla)
   */
  it.each([
    // [descripción, email, password, statusCode esperado]
    ['email vacío', '', PLAIN_PASSWORD, 400],
    ['password incorrecta', 'test@example.com', 'wrong-password', 401],
  ])(
    'login con %s → %d',
    async (_description, email, password, expectedStatus) => {
      // Para el caso de password incorrecta, necesitamos que la BD devuelva el usuario
      if (email !== '') {
        db.user = await buildFakeUser('PARTICIPANTE');
      }

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(res.statusCode).toBe(expectedStatus);
    }
  );
});
