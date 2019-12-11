export function signalRres(func){
  // Proxy created on the fly
  let url = 'http://consolwebapi.pay4it.dk'
  $.connection.hub.url = url + "/signalr/hubs";
  let hub = $.connection.device;

  $.connection.hub.error(function(error) {
    console.log('SignalR error: ' + error)
  });


  // Start the connection
  $.connection.hub.start()
    .done(() => {
    //  console.log(hub);
    //  console.log('Now connected, connection ID=' + $.connection.hub.id + ', transport=' + $.connection.hub.transport.name);
    })
    .fail(() => {
      console.log('Could not Connect!');
    });

  hub.on("deviceStatus", (data) => {
    //console.log("deviceStatus:");

  });

  hub.on("portStatus", (data) => {
  //  console.log("portStatus:");
  //  console.log(data);
  return func(data)
  });
  }
