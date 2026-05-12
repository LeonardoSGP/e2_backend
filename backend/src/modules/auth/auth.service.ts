import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { config } from '../../config';
import prisma from '../../prisma.config';
import { AppError } from '../../errors';




// Get user roles from the users.role enum field OR legacy junction tables
async function getUserRoles(user: any): Promise<string[]> {
  const roles: string[] = [];

  // 1. Check new users.role enum field directly
  // 2. Check new users.role enum field if no legacy roles found or to complement
  if (user.role) {
    const role = user.role.toString().toUpperCase();
    if (role === 'ADMIN' && !roles.includes('Admin')) roles.push('Admin');
    else if (role === 'JUEZ' && !roles.includes('Juez')) roles.push('Juez');
    else if (role === 'PARTICIPANTE' && !roles.includes('Participante')) roles.push('Participante');
  }

  // Fallback: raw SQL in case the Prisma client has stale types and user.role was undefined in object
  if (roles.length === 0) {
    try {
      const rows = await prisma.$queryRaw<Array<{ role: string }>>`
        SELECT role FROM users WHERE id = ${user.id}
      `;
      if (rows.length > 0 && rows[0].role) {
        const role = rows[0].role.toUpperCase();
        if (role === 'ADMIN') roles.push('Admin');
        else if (role === 'JUEZ') roles.push('Juez');
        else if (role === 'PARTICIPANTE') roles.push('Participante');
      }
    } catch (err) {
      console.error('[getUserRoles] Error:', err);
    }
  }

  return roles.length > 0 ? roles : ['Participante'];
}

// Map role name to dashboard route
function getDashboardRoute(roles: string[]): string {
  if (roles.includes('Admin')) return '/admin/dashboard';
  if (roles.includes('Juez')) return '/juez/dashboard';
  if (roles.includes('Participante')) return '/participante/dashboard';
  return '/login';
}

// ---- Token helpers -------------------------------------------------------
function generateAccessToken(userId: number): string {
  return jwt.sign(
    { id: userId },
    config.jwtSecret as jwt.Secret,
    { expiresIn: config.jwtExpiresIn as any }
  );
}

function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { id: userId },
    config.jwtRefreshSecret as jwt.Secret,
    { expiresIn: config.jwtRefreshExpiresIn as any }
  );
}
// --------------------------------------------------------------------------

export class AuthService {
  constructor(private readonly authRepository: AuthRepository = new AuthRepository()) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError(400, 'El email ya está registrado');
    }

    const existingName = await prisma.users.findFirst({ where: { name: data.name } });
    if (existingName) {
      throw new AppError(400, 'El nombre ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'PARTICIPANTE',
    });

    const token        = generateAccessToken(Number(user.id));
    const refreshToken = generateRefreshToken(Number(user.id));
    
    // No legacy table integration needed anymore

    const roles = await getUserRoles(user);
    const dashboardRoute = getDashboardRoute(roles);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          roles,
          carrera: (user as any).carrera || null,
          no_control: (user as any).no_control || null,
          telefono: (user as any).telefono || null,
        },
        token,
        refreshToken,
        dashboardRoute,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new AppError(401, 'Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Credenciales inválidas');
    }

    const token        = generateAccessToken(Number(user.id));
    const refreshToken = generateRefreshToken(Number(user.id));
    const roles = await getUserRoles(user);
    const dashboardRoute = getDashboardRoute(roles);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          roles,
          carrera: (user as any).carrera || null,
          no_control: (user as any).no_control || null,
          telefono: (user as any).telefono || null,
        },
        token,
        refreshToken,
        dashboardRoute,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    const roles = await getUserRoles(user);

    return {
      success: true,
      data: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        roles,
        carrera: (user as any).carrera || null,
        no_control: (user as any).no_control || null,
        telefono: (user as any).telefono || null,
        created_at: user.created_at,
      },
    };
  }

  async updateProfile(userId: number, data: { name: string; email: string }) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Uniqueness checks
    if (data.email && data.email !== user.email) {
      const existing = await this.authRepository.findUserByEmail(data.email);
      if (existing && Number(existing.id) !== userId) {
        throw new AppError(400, 'El email ya está en uso por otro usuario');
      }
    }

    if (data.name && data.name !== user.name) {
      const existingName = await prisma.users.findFirst({ where: { name: data.name } });
      if (existingName && Number(existingName.id) !== userId) {
        throw new AppError(400, 'El nombre ya está en uso por otro usuario');
      }
    }

    const telefono = (data as any).telefono;
    if (telefono && telefono !== user.telefono) {
      const existingPhone = await prisma.users.findFirst({ where: { telefono } });
      if (existingPhone && Number(existingPhone.id) !== userId) {
        throw new AppError(400, 'El número de teléfono ya está en uso por otro usuario');
      }
    }

    const no_control = (data as any).no_control;
    if (no_control && no_control !== user.no_control) {
      const existingControl = await prisma.users.findFirst({ where: { no_control } });
      if (existingControl && Number(existingControl.id) !== userId) {
        throw new AppError(400, 'El número de control ya está en uso por otro usuario');
      }
    }

    const updated = await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        name: data.name || user.name,
        email: data.email || user.email,
        no_control: (data as any).no_control ?? (user as any).no_control,
        carrera: (data as any).carrera ?? (user as any).carrera,
        telefono: (data as any).telefono ?? (user as any).telefono,
        updated_at: new Date(),
      },
    });

    const roles = await getUserRoles(updated);

    return {
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        id: Number(updated.id),
        name: updated.name,
        email: updated.email,
        roles,
      },
    };
  }

  async updatePassword(userId: number, data: { current_password: string; password: string; password_confirmation: string }) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Validate current password
    const isValid = await bcrypt.compare(data.current_password, user.password);
    if (!isValid) {
      throw new AppError(400, 'La contraseña actual es incorrecta');
    }

    // Validate confirmation
    if (data.password !== data.password_confirmation) {
      throw new AppError(400, 'Las contraseñas no coinciden');
    }

    if (data.password.length < 8) {
      throw new AppError(400, 'La contraseña debe tener al menos 8 caracteres');
    }

    const hashed = await bcrypt.hash(data.password, 12);

    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        password: hashed,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  // ---------------------------------------------------------------------------
  // Refresh Token: valida el refreshToken y emite un nuevo accessToken
  // ---------------------------------------------------------------------------
  async refreshAccessToken(refreshToken: string) {
    let payload: { id: number };

    try {
      payload = jwt.verify(refreshToken, config.jwtRefreshSecret as jwt.Secret) as { id: number };
    } catch {
      throw new AppError(401, 'Refresh token inválido o expirado. Inicia sesión nuevamente.');
    }

    const user = await this.authRepository.findUserById(payload.id);
    if (!user) {
      throw new AppError(401, 'Usuario no encontrado.');
    }

    const newAccessToken  = generateAccessToken(Number(user.id));
    const newRefreshToken = generateRefreshToken(Number(user.id));

    return {
      success: true,
      message: 'Token renovado correctamente.',
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }
}
