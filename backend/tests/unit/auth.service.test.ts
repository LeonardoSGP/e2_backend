/**
 * Tests UNITARIOS — AuthService
 *
 * Estrategia: Se instancia AuthService inyectando un AuthRepository
 * mockeado + se mockea bcrypt y jwt donde sea necesario.
 * No se toca Prisma ni la red.
 *
 * Cobertura:
 *    login — lanza AppError 401 si usuario no existe
 *    login — lanza AppError 401 si la contraseña es incorrecta
 *    login — devuelve token y refreshToken si las credenciales son válidas
 *    refreshAccessToken — lanza AppError 401 si el refreshToken es inválido
 *    getMe — lanza AppError 404 si el usuario no existe
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { AppError } from '../../src/errors';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function buildFakeUser(role: 'ADMIN' | 'JUEZ' | 'PARTICIPANTE' = 'PARTICIPANTE') {
  return {
    id: BigInt(1),
    name: 'Usuario Prueba',
    email: 'prueba@example.com',
    password: await bcrypt.hash('Password123!', 12),
    role,
    carrera: null,
    no_control: null,
    telefono: null,
    avatar: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

function buildMockRepo(overrides: Partial<AuthRepository> = {}): jest.Mocked<AuthRepository> {
  return {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    assignRole: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<AuthRepository>;
}

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('AuthService — tests unitarios', () => {
  // ── TEST 1: login — usuario no encontrado → AppError 401 ────────────────────
  it('login: lanza AppError(401) si el usuario no existe en la BD', async () => {
    const mockRepo = buildMockRepo({
      findUserByEmail: jest.fn().mockResolvedValue(null),
    });
    const service = new AuthService(mockRepo);

    await expect(
      service.login({ email: 'noexiste@example.com', password: 'cualquier' })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Credenciales inválidas',
    });
  });

  // ── TEST 2: login — contraseña incorrecta → AppError 401 ────────────────────
  it('login: lanza AppError(401) si la contraseña es incorrecta', async () => {
    const fakeUser = await buildFakeUser();
    const mockRepo = buildMockRepo({
      findUserByEmail: jest.fn().mockResolvedValue(fakeUser),
    });
    const service = new AuthService(mockRepo);

    await expect(
      service.login({ email: fakeUser.email, password: 'password-INCORRECTA' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  // ── TEST 3: login — credenciales válidas → token + refreshToken ─────────────
  it('login: devuelve token y refreshToken cuando las credenciales son correctas', async () => {
    const plainPassword = 'Password123!';
    const fakeUser = await buildFakeUser('ADMIN');
    const mockRepo = buildMockRepo({
      findUserByEmail: jest.fn().mockResolvedValue(fakeUser),
      findUserById:    jest.fn().mockResolvedValue(fakeUser),
    });
    const service = new AuthService(mockRepo);

    const result = await service.login({ email: fakeUser.email, password: plainPassword });

    expect(result.success).toBe(true);
    expect(result.data?.token).toBeDefined();
    expect(typeof result.data?.token).toBe('string');
    expect(result.data?.refreshToken).toBeDefined();
    expect(typeof result.data?.refreshToken).toBe('string');
    // Verificar que el token sea un JWT válido
    const decoded = jwt.decode(result.data!.token!) as any;
    expect(decoded.id).toBe(1);
  });

  // ── TEST 4: refreshAccessToken — refreshToken inválido → AppError 401 ───────
  it('refreshAccessToken: lanza AppError(401) si el refreshToken es inválido o malformado', async () => {
    const mockRepo = buildMockRepo();
    const service = new AuthService(mockRepo);

    await expect(
      service.refreshAccessToken('token-completamente-invalido')
    ).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('Refresh token inválido'),
    });
  });

  // ── TEST 5: getMe — usuario no encontrado → AppError 404 ────────────────────
  it('getMe: lanza AppError(404) si el userId no corresponde a ningún usuario', async () => {
    const mockRepo = buildMockRepo({
      findUserById: jest.fn().mockResolvedValue(null),
    });
    const service = new AuthService(mockRepo);

    await expect(service.getMe(9999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Usuario no encontrado',
    });
  });
});
