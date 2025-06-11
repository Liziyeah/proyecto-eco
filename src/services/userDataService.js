import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const validateUserData = (userData) => {
    const { username, email, age, nationality } = userData;

    if (!username || !email || !age || !nationality) {
        return {
            isValid: false,
            message: 'Todos los campos son requeridos',
        };
    }

    return {
        isValid: true,
        message: 'Datos válidos',
    };
};

export const saveUserData = async (userData) => {
    try {
        const { username, email, age, nationality } = userData;

        // Insertar datos en Supabase
        const { data, error } = await supabase
            .from('game_results')
            .insert({
                username,
                email,
                age: parseInt(age),
                nationality,
            })
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return {
                success: false,
                message: 'Error al guardar los datos en la base de datos',
                error: error,
            };
        }

        console.log('User data saved successfully:', data);

        return {
            success: true,
            message: 'Datos guardados correctamente',
            data: data[0],
        };
    } catch (error) {
        console.error('Error saving user data:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: error,
        };
    }
};
