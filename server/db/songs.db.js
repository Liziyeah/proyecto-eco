const supabase = require('../services/supabase.service');

const getSongs = async () => {
    const { data: songs, error } = await supabase.from('songs').select('*');

    if (error) {
        console.error('Error fetching songs:', error);
        return null;
    }

    return songs;
};

module.exports = {
    getSongs,
};