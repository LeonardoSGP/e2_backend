import { ProyectoRepository } from './proyecto.repository';
import { toProyectoResponse, toProyectoResumen } from './proyecto.mapper';
import { CreateProyectoDto, UpdateProyectoDto, ProyectoQueryOptions } from './proyecto.types';
import { AppError } from '../../errors';

export class ProyectoService {
  // Genera acoplamiento. En producción debería inyectarse desde fuera
  // (ej. via framework DI o pasado explícitamente en el constructor del router).
  constructor(
    private readonly proyectoRepository: ProyectoRepository = new ProyectoRepository()
  ) {}

  async getAllProyectos(options: ProyectoQueryOptions) {
    const { count, rows } = await this.proyectoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    return {
      success: true,
      data: {
        proyectos: rows.map(toProyectoResumen),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };
  }

  async getProyectoById(id: number) {
    const proyecto = await this.proyectoRepository.findById(id);
    if (!proyecto) {
      throw new AppError(404, 'Proyecto no encontrado');
    }

    // Calculate despuntaje here or let frontend do it. Frontend has the data now.
    return { success: true, data: toProyectoResponse(proyecto) };
  }

  async createProyecto(data: CreateProyectoDto) {
    const proyecto = await this.proyectoRepository.create(data);
    return {
      success: true,
      message: 'Proyecto creado.',
      data: {
        ...proyecto,
        id: Number(proyecto.id),
        equipo_id: Number(proyecto.equipo_id),
        evento_id: Number(proyecto.evento_id),
      },
    };
  }

  async updateProyecto(id: number, data: UpdateProyectoDto) {
    const proyecto = await this.proyectoRepository.findById(id);
    if (!proyecto) {
      throw new AppError(404, 'Proyecto no encontrado');
    }

    await this.proyectoRepository.update(id, data);
    return { success: true, message: 'Proyecto actualizado.' };
  }

  async deleteProyecto(id: number) {
    const proyecto = await this.proyectoRepository.findById(id);
    if (!proyecto) {
      throw new AppError(404, 'Proyecto no encontrado');
    }

    await this.proyectoRepository.delete(id);
    return { success: true, message: 'Proyecto eliminado.' };
  }
}
