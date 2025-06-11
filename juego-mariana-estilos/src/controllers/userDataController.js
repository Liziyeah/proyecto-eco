import { validateUserData, saveUserData } from '../services/userDataService.js';

export const submitUserData = async (req, res) => {
    try {
        const userData = req.body;

        // Validar datos usando el servicio
        const validation = validateUserData(userData);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        // Guardar datos usando el servicio
        const result = await saveUserData(userData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message,
            });
        }

        res.json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error('Error in submitUserData controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
