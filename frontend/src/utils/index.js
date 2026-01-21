export const getRandomBG = () => {
    const colors = [
        "#ff6b6b",
        "#f06595",
        "#cc5de8",
        "#845ef7",
        "#5c7cfa",
        "#339af0",
        "#22b8cf",
        "#20c997",
        "#51cf66",
        "#94d82d",
        "#fcc419",
        "#ff922b"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}