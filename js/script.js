var urlApi = 'http://157.230.17.132:4009/sales';
var ctx = $('.chart-sales');

apiObject = [
  {
      "id": 1,
      "salesman": "Marco",
      "amount": 9000,
      "date": "12/02/2017"
  },
  {
      "id": 2,
      "salesman": "Marco",
      "amount": 1000,
      "date": "12/04/2017"
  },
  {
      "id": 3,
      "salesman": "roberto",
      "amount": 1000,
      "date": "12/04/2017"
  },
  {
      "id": 5,
      "salesman": "michele",
      "amount": 2000,
      "date": "12/04/2017"
  }
];

// var risultatoFinaleDaOttenere = {
    //labels: {'marco', 'Roberto', 'michele'},
    //data:  [10000, 1000, 50]
// };

createDataChart (apiObject);
var sales = createDataChart(apiObject);


//creo i data per il grafico
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

var lineChart = new Chart(ctx, {
    type: 'line',
    // The data for our dataset
    data: {
        labels: sales.labels,
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: sales.data,
        }]
    }
});
