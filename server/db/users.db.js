const { supabase } = require("../services/supabase.service.js");

let users = [
    {
        id: 1,
        username: "admin",
    },
];

const supabaseClient = require("../services/supabase.service");

const getAllUsers = async () => {
    
    let { data: users, error } = await supabase
    .from('users')
    .select('id')

    if (error) {
        console.error("Error fetching users:", error);
        return null;
    }
    return users;
};

const createUser = async (user) => {
    const { data, error } = await supabaseClient
        .from("users")
        .insert([user]);

    if (error) {
        console.error("Error creating user:", error);
        return null;
    }

    return data;
};

const updateUser = async (id, user) => {
    const { data, error } = await supabaseClient
        .from("users")
        .update(user)
        .eq("id", id);

    if (error) {
        console.error("Error updating user:", error);
        return null;
    }

    return data;
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
};