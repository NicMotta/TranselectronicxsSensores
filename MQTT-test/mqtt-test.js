// MQTT client details:
let broker = {
    hostname: 'data-nec.cloud.shiftr.io',
    port: 443
  };
  // MQTT client:
  let client;
  // client credentials:
  let creds = {
    clientID: 'Transelectronicxs',
    userName: 'data-nec',
    password: 'ODB7aMesSDvAgsDT'
  }



  // VARIABLES
  let mensaje_inicio, fourierY;
  let dftValuesNic = [];
  let dftValuesAndres = [];
  let inicio = false;

  let botonInicio;
  let botonFinal;
  let time = 0;
  let path = [];

  function setup(){
    createCanvas(1000, 600);
    background(0);

    botonInicio = createButton('Iniciar');
    botonInicio.position(0, 20);
    botonInicio.mousePressed(sendMqttMessage);

    client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
        onSuccess: onConnect,       // callback function for when you connect
        userName: creds.userName,   // username
        password: creds.password,   // password
        useSSL: true                // use SSL
      }
    );
  }
      // called when the client connects
  function onConnect() {
    console.log('client is connected');
    client.subscribe("BPM-promedio/Nic");
    client.subscribe("BPM-promedio/Andres");
  }
  
  // called when the client loses its connection
  function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        console.log('onConnectionLost:' + response.errorMessage);
    }
  }
  
  // called when a message arrives
  function onMessageArrived(message) {
    if(message.destinationName === 'BPM-promedio/Nic') {
      let mensajeNic = message.payloadString;
      dftValuesNic.push(mensajeNic);
    }
    if(message.destinationName === 'BPM-promedio/Andres') {
      let mensajeAndres = message.payloadString;
      dftValuesAndres.push(mensajeAndres);
    }
    
    if(dftValuesAndres.length === dftValuesNic.length) {
      fourierX = dft(dftValuesNic);
      fourierY = dft(dftValuesAndres);

      let vx = epiCycles(width - 100, 100, 0, fourierX);
      let vy = epiCycles(100, height-100, HALF_PI, fourierY);
      let v = createVector(vx.x, vy.y);
      path.unshift(v);
      if(dftValuesAndres[0] === dftValuesNic[0]) {
        stroke(255, 55, 0);
      } else {
        stroke(255);
      }
      line(vx.x, vx.y, v.x, v.y);
      line(vy.x, vy.y, v.x, v.y);

      beginShape();
      noFill();
      for (let i = 0; i < path.length; i++) {
        vertex(path[i].x, path[i].y);
      }
      endShape();

      const dt = TWO_PI / fourierY.length;
      time += dt;

      if (time > TWO_PI) {
        time = 0;
        path = [];
      }
    }
  }

  function dft(x) {
    const X = [];
    const newVector = x.map(i => i*random(-1, 1));
    const N = newVector.length;
    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      for (let n = 0; n < N; n++) {
        const phi = (TWO_PI * k * n) / N;
        re += newVector[n] * cos(phi);
        im -= newVector[n] * sin(phi);
      }
      re = re / N;
      im = im / N;
  
      let freq = k;
      let amp = sqrt(re * re + im * im);
      let phase = atan2(im, re);
      X[k] = { re, im, freq, amp, phase };
    }
    return X;
  }

  function epiCycles(x, y, rotation, fourier) {
    for (let i = 0; i < fourier?.length; i++) {
      let prevx = x;
      let prevy = y;
      let freq = fourier[i].freq;
      let radius = fourier[i].amp;
      let phase = fourier[i].phase;
      x += radius * cos(freq * time + phase + rotation);
      y += radius * sin(freq * time + phase + rotation);
      stroke(255, 100);
      noFill();
      ellipse(prevx, prevy, radius * 2);
      stroke(255);
      line(prevx, prevy, x, y);
    }
    return createVector(x, y);
  }

  function draw() {
  }
  
  function sendMqttMessage() {

    inicio = !inicio;    
    if (inicio == false) {
      botonInicio.html('Iniciar');
    }

    if (inicio == true) {
      botonInicio.html('Finalizar');
    }
    
    if (client.isConnected()) {
      mensaje_inicio = new Paho.MQTT.Message(String(inicio));
      mensaje_inicio.destinationName = "Transelectronicxs/valor_test";
      client.send(mensaje_inicio);
    }
  }
