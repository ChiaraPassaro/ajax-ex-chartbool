var urlApi = 'http://157.230.17.132:4009/sales';
var ctx = $('.chart-sales');

// apiObject = [
//   {
//       "id": 1,
//       "salesman": "Marco",
//       "amount": 9000,
//       "date": "12/02/2017"
//   },
//   {
//       "id": 2,
//       "salesman": "Marco",
//       "amount": 1000,
//       "date": "12/04/2017"
//   },
//   {
//       "id": 3,
//       "salesman": "roberto",
//       "amount": 1000,
//       "date": "12/04/2017"
//   },
//   {
//       "id": 5,
//       "salesman": "michele",
//       "amount": 2000,
//       "date": "12/04/2017"
//   }
// ];

// var risultatoFinaleDaOttenere = {
    //labels: {'marco', 'Roberto', 'michele'},
    //data:  [10000, 1000, 50]
// };
// createDataChart (apiObject);

//prendo i dati da Api e avvio creazione grafico
initDataChart(urlApi);

//Funzione che formatta i data per il grafico
function createDataChart (json){

  //array finale da ritornare
  var jsonNew = {
    labels: [],
    data: []
  };

  for (var i = 0; i < json.length; i++) {
    var thisObj = json[i];

    //se jsonNew non contiene in label il nome del venditore
    if(!jsonNew.labels.includes(thisObj.salesman)){

      //inserisco in labels il nome
      jsonNew.labels.push(thisObj.salesman);
      //mi salvo la posizione nell'array
      var indexOfThisSalesman = jsonNew.labels.indexOf(thisObj.salesman);

      //inserisco in data allo stesso index amount = 0
      jsonNew.data[indexOfThisSalesman] = 0;
    }

    //sommmo l'amnount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisSalesman] += thisObj.amount;
  }

  return jsonNew;
}

//funzione che chiama api
function initDataChart(urlApi){
  $.ajax({
    url: urlApi,
    method: 'GET',
    success: function(data){
      //preparo i dati dati
      var sales = createDataChart(data);
      //creo il grafico
      createChart(sales);
    },
    error: function(err){
      console.log(err);
    }
  });
}

//funzione che crea grafico
function createChart(obj){
  var lineChart = new Chart(ctx, {
    type: 'line',
    // The data for our dataset
    data: {
      labels: obj.labels,
      datasets: [{
        label: "Sales",
        backgroundColor: '#ff00ff',
        borderColor: '#bc12bc',
        data: obj.data,
      }]
    }
  });

}
