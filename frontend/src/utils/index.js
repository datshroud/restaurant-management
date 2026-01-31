export const formatTime = (date) => 
    `${String(date.getHours()).padStart(2, "0")}:
    ${String(date.getMinutes()).padStart(2, "0")}:
    ${String(date.getSeconds()).padStart(2, "0")}`;

export const formatDate = (date) => {
    // const months = [
    //     "January", "February", "March", "April", "May", "June",
    //     "July", "August", "September", "October", "November", "December",
    // ];
    return `${String(date.getDate()).padStart(2, "0")}
            ${"Tháng " + (date.getMonth() + 1)}, 
            ${String(date.getFullYear())}`
}; 

export const getRandomBG = () => {
    const colors = [
        "#ff6b6b",
        "#f06595",
        "#cc5de8",
        "#845ef7",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

export const getAvatarName = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    } else {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].
                                                    charAt(0)).toUpperCase();
    }
}