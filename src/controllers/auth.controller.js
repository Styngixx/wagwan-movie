const supabase = require('../config/supabase');

const loginAdmin = async (req, res) => {
    try {
        const { usuario, password } = req.body;
        console.log(`[Backend] Intentando loguear a: ${usuario}`);

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .or(`nombre_usr.eq.${usuario},email.eq.${usuario}`)
            .eq('password', password)
            .eq('rol', 'admin')
            .single();

        if (error) {
            // Si el RLS sigue activo, aquí saldrá el código de error (ej. PGRST116)
            console.log("[Backend] Error de Supabase:", error.message);
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas o sin permisos.' });
        }

        if (!data) {
            console.log("[Backend] Usuario no encontrado en la DB.");
            return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
        }

        console.log(`[Backend] ¡Login exitoso para: ${data.nombre_usr}!`);
        res.status(200).json({ success: true, message: 'Acceso concedido', user: data });
    } catch (error) {
        console.error("[Backend] Error en el servidor:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = { loginAdmin };