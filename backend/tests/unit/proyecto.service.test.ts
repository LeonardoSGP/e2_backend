/**
 * Tests UNITARIOS — ProyectoService
 *
 * Estrategia: Se instancia ProyectoService inyectando un repositorio
 * totalmente mockeado. No se toca Prisma ni la red.
 *
 * Cobertura:
 *   ✅ getAllProyectos  — paginación correcta
 *   ✅ getProyectoById — lanza AppError 404 si no existe
 *   ✅ createProyecto  — delega al repositorio y retorna el proyecto creado
 *   ✅ updateProyecto  — lanza AppError 404 si no existe
 *   ✅ deleteProyecto  — lanza AppError 404 si no existe
 */

import { ProyectoService } from '../../src/modules/proyectos/proyecto.service';
import { ProyectoRepository } from '../../src/modules/proyectos/proyecto.repository';
import { AppError } from '../../src/errors';

// ─── Helpers de datos de prueba ────────────────────────────────────────────────
function fakeProyecto(overrides: Partial<any> = {}): any {
  return {
    id: BigInt(1),
    equipo_id: BigInt(10),
    evento_id: BigInt(20),
    nombre: 'Proyecto Alpha',
    descripcion: 'Descripción de prueba',
    repositorio_url: 'https://github.com/example/repo',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
    equipos: { id: BigInt(10), nombre: 'Equipo Alpha' },
    eventos: { id: BigInt(20), nombre: 'Hackathon 2026' },
    equipo_miembros: [],
    evaluaciones: [],
    ...overrides,
  };
}

// ─── Mock del repositorio ──────────────────────────────────────────────────────
function buildMockRepo(overrides: Partial<ProyectoRepository> = {}): jest.Mocked<ProyectoRepository> {
  return {
    findAllPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<ProyectoRepository>;
}

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProyectoService — tests unitarios', () => {
  // ── TEST 1: getAllProyectos — paginación ─────────────────────────────────────
  it('getAllProyectos: devuelve lista paginada con totalPages correcto', async () => {
    const proyecto = fakeProyecto();
    const mockRepo = buildMockRepo({
      findAllPaginated: jest.fn().mockResolvedValue({ count: 25, rows: [proyecto] }),
    });
    const service = new ProyectoService(mockRepo);

    const result = await service.getAllProyectos({ page: 2, limit: 10 });

    expect(result.success).toBe(true);
    expect(result.data.pagination.total).toBe(25);
    expect(result.data.pagination.totalPages).toBe(3);   // ceil(25/10) = 3
    expect(result.data.pagination.page).toBe(2);
    expect(result.data.proyectos).toHaveLength(1);
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });

  // ── TEST 2: getProyectoById — no encontrado → AppError 404 ──────────────────
  it('getProyectoById: lanza AppError(404) cuando el proyecto no existe', async () => {
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new ProyectoService(mockRepo);

    await expect(service.getProyectoById(999)).rejects.toThrow(AppError);
    await expect(service.getProyectoById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Proyecto no encontrado',
    });
  });

  // ── TEST 3: createProyecto — delega correctamente al repositorio ─────────────
  it('createProyecto: devuelve success=true con los datos del proyecto creado', async () => {
    const created = {
      id: BigInt(42),
      equipo_id: BigInt(10),
      evento_id: BigInt(20),
      nombre: 'Nuevo Proyecto',
      descripcion: 'Descripción',
      repositorio_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockRepo = buildMockRepo({
      create: jest.fn().mockResolvedValue(created),
    });
    const service = new ProyectoService(mockRepo);

    const result = await service.createProyecto({
      equipo_id: 10,
      evento_id: 20,
      nombre: 'Nuevo Proyecto',
      descripcion: 'Descripción',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Proyecto creado.');
    expect(result.data.id).toBe(42);          // BigInt → number en el mapper
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  // ── TEST 4: updateProyecto — no encontrado → AppError 404 ───────────────────
  it('updateProyecto: lanza AppError(404) cuando el proyecto no existe', async () => {
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new ProyectoService(mockRepo);

    await expect(service.updateProyecto(99, { nombre: 'Cambio' })).rejects.toThrow(AppError);
    await expect(service.updateProyecto(99, { nombre: 'Cambio' })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  // ── TEST 5: deleteProyecto — no encontrado → AppError 404 ───────────────────
  it('deleteProyecto: lanza AppError(404) cuando el proyecto no existe', async () => {
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new ProyectoService(mockRepo);

    await expect(service.deleteProyecto(99)).rejects.toThrow(AppError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
