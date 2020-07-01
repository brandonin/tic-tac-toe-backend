const newGame = () => {
    let squares = [];
    // for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //         squares.push({xPosition: j, yPosition: i});
    //     }
    // }
    for (let i = 0; i < 9; i++) {
        squares.push({ position: i });
    }
    return squares;
}

export default newGame;
