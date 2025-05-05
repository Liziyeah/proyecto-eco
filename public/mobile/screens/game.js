export function updateGameStart() {
    const controlAreaTitle = document.querySelector('#controlArea h3');
    if (controlAreaTitle) {
        controlAreaTitle.textContent = 'Game Running - Hit the buttons!';
    }
}
