const supabase = require('../config/supabase');

// Obtener todas las películas para el catálogo principal
const getPeliculas = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('peliculas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Error al traer películas:", error);
        res.status(500).json({ error: error.message });
    }
};

const getPeliculaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // El select ahora trae solo los datos de la película, sin buscar la tabla 'enlaces'
        const { data, error } = await supabase
            .from('peliculas')
            .select('*') 
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Película no encontrada' });
        
        res.status(200).json(data);
    } catch (error) {
        console.error("Error al buscar la película:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPeliculas,
    getPeliculaById
};