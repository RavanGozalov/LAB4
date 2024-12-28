let plotData = {
    r: [],
    theta: [],
    mode: 'markers',
    marker: {
        color: [],
        size: 10,
        colorscale: 'Viridis'
    },
    type: 'scatterpolar'
};

const layout = {
    polar: {
        radialaxis: {
            range: [0, 200],
            title: 'Відстань (км)'
        },
        angularaxis: {
            direction: 'clockwise',
            period: 360
        }
    },
    showlegend: false
};

Plotly.newPlot('radarPlot', [plotData], layout);

let socket = new WebSocket('ws://localhost:4000');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const speedOfLight = 299792.458;

    data.echoResponses.forEach(echo => {
        const distance = (echo.time * speedOfLight) / 2;
        
        plotData.r = [distance];
        plotData.theta = [data.scanAngle];
        plotData.marker.color = [echo.power];
    });

    Plotly.update('radarPlot', {
        r: [plotData.r],
        theta: [plotData.theta],
        'marker.color': [plotData.marker.color]
    });
};

function updateConfig() {
    const config = {
        measurementsPerRotation: parseInt(document.getElementById('scanFreq').value),
        rotationSpeed: parseInt(document.getElementById('speed').value),
        targetSpeed: parseInt(document.getElementById('targetSpeed').value)
    };

    fetch('http://localhost:4000/config', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(config)
    });
}

socket.onclose = () => {
    setTimeout(() => {
        socket = new WebSocket('ws://localhost:4000');
    }, 1000);
};