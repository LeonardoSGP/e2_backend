import type { Prisma } from '@prisma/client';

// --------------------------------------------------------------------------
// Tipo preciso de Prisma para el payload de findById (con relaciones reales)
// --------------------------------------------------------------------------
type ProyectoConRelaciones = Prisma.proyectosGetPayload<{
  include: {
    equipos: {
      include: { equipo_miembros: true };
    };
    eventos: true;
    evaluaciones: {
      include: { evaluacion_criterios: true };
    };
  };
}>;

// Tipo más ligero usado por findAllPaginated (sin evaluaciones ni miembros)
type ProyectoResumen = Prisma.proyectosGetPayload<{
  include: {
    equipos: true;
    eventos: true;
  };
}>;

// --------------------------------------------------------------------------
// Mapper de evaluación individual
// --------------------------------------------------------------------------
export function toEvaluacionResponse(
  c: ProyectoConRelaciones['evaluaciones'][number]
) {
  return {
    ...c,
    id: Number(c.id),
    proyecto_id: Number(c.proyecto_id),
    juez_user_id: Number(c.juez_id),
    criterio_id: Number(c.criterio_id),
    puntuacion: Number(c.puntuacion),
    criterio: c.evaluacion_criterios
      ? {
          ...c.evaluacion_criterios,
          id: Number(c.evaluacion_criterios.id),
          evento_id: Number(c.evaluacion_criterios.evento_id),
          ponderacion: Number(c.evaluacion_criterios.ponderacion),
        }
      : null,
  };
}

// --------------------------------------------------------------------------
// Mapper completo de proyecto (usado en getProyectoById)
// --------------------------------------------------------------------------
export function toProyectoResponse(proyecto: ProyectoConRelaciones) {
  return {
    ...proyecto,
    id: Number(proyecto.id),
    equipo_id: Number(proyecto.equipo_id),
    evento_id: Number(proyecto.evento_id),
    equipo: proyecto.equipos
      ? {
          ...proyecto.equipos,
          id: Number(proyecto.equipos.id),
        }
      : null,
    evento: proyecto.eventos
      ? {
          ...proyecto.eventos,
          id: Number(proyecto.eventos.id),
        }
      : null,
    evaluaciones: proyecto.evaluaciones
      ? proyecto.evaluaciones.map(toEvaluacionResponse)
      : [],
    // Keep calificaciones alias for frontend compatibility
    // TODO: eliminar cuando el frontend use "evaluaciones" directamente
    calificaciones: proyecto.evaluaciones
      ? proyecto.evaluaciones.map(toEvaluacionResponse)
      : [],
  };
}

// --------------------------------------------------------------------------
// Mapper de resumen de proyecto (usado en getAllProyectos)
// --------------------------------------------------------------------------
export function toProyectoResumen(proyecto: ProyectoResumen) {
  return {
    ...proyecto,
    id: Number(proyecto.id),
    equipo_id: Number(proyecto.equipo_id),
    evento_id: Number(proyecto.evento_id),
    equipo: proyecto.equipos
      ? {
          ...proyecto.equipos,
          id: Number(proyecto.equipos.id),
        }
      : null,
    evento: proyecto.eventos
      ? {
          ...proyecto.eventos,
          id: Number(proyecto.eventos.id),
        }
      : null,
  };
}
