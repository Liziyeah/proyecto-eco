export default function renderWaitingScreen() {
    const html = `
        <div id="playerInfo" style="display: none">
            <h3>You are Player <span id="playerNumber">-</span></h3>
        </div>
        <div id="controlArea" style="display: none">
            <h3>Waiting for game to start...</h3>
            <div id="controlButtons">
                <button id="leftButton" style="width: 45%; height: 150px; margin: 10px; font-size: 24px;" data-column="0">
                    LEFT LANE
                </button>
                <button id="rightButton" style="width: 45%; height: 150px; margin: 10px; font-size: 24px;" data-column="1">
                    RIGHT LANE
                </button>
            </div>
        </div>
    `;
    document.getElementById('app').innerHTML = html;
}
