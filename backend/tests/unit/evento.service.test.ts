/**
 * Tests UNITARIOS — EventoService
 *
 * Estrategia: Se instancia EventoService inyectando un repositorio
 * totalmente mockeado. No se toca Prisma ni la red.
 *
 * Cobertura:
 *    getEventoById — lanza AppError 404 si no existe
 *    createEvento  — lanza AppError 400 si fecha_inicio es en el pasado
 *    createEvento  — lanza AppError 400 si fecha_fin <= fecha_inicio
 *    deleteEvento  — lanza AppError 404 si no existe
 *    deleteEvento  — lanza AppError 400 si el evento ya comenzó
 */

import { EventoService } from '../../src/modules/eventos/evento.service';
import { EventoRepository } from '../../src/modules/eventos/evento.repository';
import { AppError } from '../../src/errors';

// ─── Helpers de datos de prueba ────────────────────────────────────────────────
function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function fakeEvento(overrides: Partial<any> = {}): any {
  return {
    id: BigInt(1),
    nombre: 'Hackathon 2026',
    descripcion: 'Descripción',
    fecha_inicio: futureDate(5),
    fecha_fin: futureDate(10),
    max_jueces: 3,
    created_at: new Date(),
    updated_at: new Date(),
    evento_jueces: [],
    evaluacion_criterios: [],
    proyectos: [],
    certificados: [],
    ...overrides,
  };
}

// ─── Mock del repositorio ──────────────────────────────────────────────────────
function buildMockRepo(overrides: Partial<EventoRepository> = {}): jest.Mocked<EventoRepository> {
  return {
    findAllPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setJueces: jest.fn(),
    addJuez: jest.fn(),
    removeJuez: jest.fn(),
    getAvailableJueces: jest.fn(),
    addCriterio: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<EventoRepository>;
}

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('EventoService — tests unitarios', () => {
  // ── TEST 1: getEventoById — no encontrado → AppError 404 ───────────────────
  it('getEventoById: lanza AppError(404) cuando el evento no existe', async () => {
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new EventoService(mockRepo);

    await expect(service.getEventoById(999)).rejects.toThrow(AppError);
    await expect(service.getEventoById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Evento no encontrado',
    });
  });

  // ── TEST 2: createEvento — fecha_inicio en el pasado → AppError 400 ─────────
  it('createEvento: lanza AppError(400) si la fecha de inicio es anterior a hoy', async () => {
    const mockRepo = buildMockRepo();
    const service = new EventoService(mockRepo);

    await expect(
      service.createEvento({
        nombre: 'Evento Pasado',
        fecha_inicio: '2020-01-01',
        fecha_fin: '2026-12-31',
        max_jueces: 2,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('anterior a hoy'),
    });

    // El repositorio NO debe haber sido llamado (falla antes de persistir)
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  // ── TEST 3: createEvento — fecha_fin <= fecha_inicio → AppError 400 ─────────
  it('createEvento: lanza AppError(400) si fecha_fin es anterior o igual a fecha_inicio', async () => {
    const mockRepo = buildMockRepo();
    const service = new EventoService(mockRepo);

    const inicio = futureDate(10).toISOString();
    const fin    = futureDate(5).toISOString();   // fin ANTES que inicio → error

    await expect(
      service.createEvento({
        nombre: 'Evento Inválido',
        fecha_inicio: inicio,
        fecha_fin: fin,
        max_jueces: 2,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('posterior a la fecha de inicio'),
    });

    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  // ── TEST 4: deleteEvento — no encontrado → AppError 404 ─────────────────────
  it('deleteEvento: lanza AppError(404) cuando el evento no existe', async () => {
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new EventoService(mockRepo);

    await expect(service.deleteEvento(99)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  // ── TEST 5: deleteEvento — evento ya comenzó → AppError 400 ─────────────────
  it('deleteEvento: lanza AppError(400) si el evento ya comenzó', async () => {
    const eventoYaIniciado = fakeEvento({
      // Fecha de inicio en el pasado (ya empezó)
      fecha_inicio: futureDate(-2),
      fecha_fin:    futureDate(5),
    });
    const mockRepo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(eventoYaIniciado),
    });
    const service = new EventoService(mockRepo);

    await expect(service.deleteEvento(1)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('ya ha comenzado'),
    });
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
