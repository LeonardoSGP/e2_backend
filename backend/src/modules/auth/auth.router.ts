import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema, refreshSchema } from './auth.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req: Request, file, cb) => {
    const userId = (req as AuthRequest).user?.id || 'unknown';
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${userId}${ext}`);
  }
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG o PNG'));
  }
});
const router = Router();
const authService = new AuthService();

// Helper para validar validaciones con Zod en Express
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Error de validación o usuario existente
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso devolviendo Token
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna los datos y perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await authService.getMe(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post('/logout', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Sesión cerrada (eliminar token en cliente)' });
});

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar información personal del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await authService.updateProfile(userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/password:
 *   put:
 *     summary: Actualizar contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const { current_password, password, password_confirmation } = req.body;
    const result = await authService.updatePassword(userId, { current_password, password, password_confirmation });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/avatar:
 *   post:
 *     summary: Subir o actualizar foto de perfil
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }
    const userId = Number(req.user.id);
    const avatarUrl = `/uploads/avatars/${req.file.filename}?v=${Date.now()}`;
    
    res.status(200).json({
      success: true,
      message: 'Avatar actualizado correctamente',
      path: avatarUrl
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar el access token usando un refresh token válido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token recibido al hacer login o register
 *     responses:
 *       200:
 *         description: Nuevo access token y refresh token generados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Nuevo access token (15 min)
 *                     refreshToken:
 *                       type: string
 *                       description: Nuevo refresh token (7 días)
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
