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

  let valor_test;
  let valor_send = 0;

  function setup(){
    createCanvas(300, 300);
    background(0);

    setInterval(mandarValor, 1000);

      ///////////////////
    // MQTT  
    ///////////////////

    client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
    // set callback handlers for the client:
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: onConnect,       // callback function for when you connect
            userName: creds.userName,   // username
            password: creds.password,   // password
            useSSL: true                // use SSL
        }
    );
  }

  function draw(){

  }

  function mandarValor() {
    //console.log(valor_send);
    sendMqttMessage();
    valor_send++;
  }

      // called when the client connects
function onConnect() {
    console.log('client is connected');
    client.subscribe("Transelectronicxs/valor_test");
  
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
    console.log(mensaje);
  
    //let llegaMensaje = split(message.payloadString, ',');
  
    //MQTTValorX = parseFloat(llegaMensaje[0]);
    //MQTTValorY = parseFloat(llegaMensaje[1]);
    //MQTTValorZ = parseFloat(llegaMensaje[2]);
  
  
    //console.log(MQTTx.length);
  
  }
  
  
  // called when you want to send a message:
  function sendMqttMessage() {
  
    
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
        valor_test = new Paho.MQTT.Message(String(valor_send));
        valor_test.destinationName = "Transelectronicxs/valor_test";
        client.send(valor_test);
  
    }
    
  }