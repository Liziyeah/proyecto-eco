const supabase = require('../services/supabase.service');

let users = [
    {
        id: 1,
        username: 'admin',
    },
];

const getAllUsers = async () => {
    let { data: users, error } = await supabase.from('users').select();

    if (error) {
        console.error('Error fetching users:', error);
        return null;
    }
    return users;
};

const createUser = async (user) => {
    const { data, error } = await supabaseClient
        .from('users')
        .insert([user])
        .select();

    if (error) {
        console.error('Error creating user:', error);
        return null;
    }

    return data;
};

const updateUser = async (newData, userId) => {
    const { data, error } = await supabaseClient
        .from('users')
        .update(newData)
        .eq('id', userId)
        .select();

    if (error) {
        console.error('Error updating user:', error);
        return null;
    }

    return data;
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
};
