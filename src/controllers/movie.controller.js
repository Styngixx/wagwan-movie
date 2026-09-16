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

// Obtener el detalle de una película junto con sus enlaces
const getPeliculaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // El join con la tabla 'enlaces' tal cual tu diagrama
        const { data, error } = await supabase
            .from('peliculas')
            .select(`
                *,
                enlaces (
                    id,
                    servidor,
                    url,
                    idioma,
                    calidad
                )
            `)
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