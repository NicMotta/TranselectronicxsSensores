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
  let mensaje_inicio;
  let inicio = false;

  let botonInicio;
  let botonFinal;

  function setup(){
    createCanvas(300, 300);
    background(0);

    botonInicio = createButton('Inicio');
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

  function draw() {}


      // called when the client connects
  function onConnect() {
    console.log('client is connected');
    client.subscribe("BPM-promedio/Sara");
  }
  
  // called when the client loses its connection
  function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        console.log('onConnectionLost:' + response.errorMessage);
    }
  }
  
  // called when a message arrives
  function onMessageArrived(message) {
    let mensaje = message.payloadString;
    console.log(mensaje, 'este es el mensaje');
    //let llegaMensaje = split(message.payloadString, ',');
    //MQTTValorX = parseFloat(llegaMensaje[0]);
    //MQTTValorY = parseFloat(llegaMensaje[1]);
    //MQTTValorZ = parseFloat(llegaMensaje[2]);
    //console.log(MQTTx.length);
  
  }
  
  
  // called when you want to send a message:
  function sendMqttMessage() {

    inicio = !inicio;
    console.log(inicio);
    
    if (inicio == false) {
      botonInicio.html('Inicio');
    }

    if (inicio == true) {
      botonInicio.html('Final');
    }
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
      mensaje_inicio = new Paho.MQTT.Message(String(inicio));
      mensaje_inicio.destinationName = "Transelectronicxs/valor_test";
      client.send(mensaje_inicio);
    }
  }
