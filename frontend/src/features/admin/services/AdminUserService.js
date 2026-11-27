import api from "../../../axios/axios";

export const getUsers = async (
    search = "",
    page = 1,
    limit = 10
) => {

    const response = await api.get("/admin/users", {
        params: {
            search,
            page,
            limit
        }
    });

    return response.data;
};


export const updateUserStatus = async (userId, isActive) => {

    const response = await api.patch(
        `/admin/users/${userId}/status`,
        {
            isActive
        }
    );

    return response.data;
};