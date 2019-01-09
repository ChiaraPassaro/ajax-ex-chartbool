var urlApi = 'http://157.230.17.132:4009/sales';
var ctxSales = $('.chart-sales-man');
var ctxMonth = $('.chart-sales-month');

//prendo i dati da Api e avvio creazione grafico Torta
initDataChartSales(urlApi);
//initDataChartSalesPerMonth(urlApi);

//Funzione che formatta i data per il grafico venditori
function createDataChartSalesPerMan (json){

  //array finale da ritornare
  var jsonNew = {
    labels: [],
    colors: [],
    data: [],
    dataPerc: [],
    totalSales : 0
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
      jsonNew.colors[indexOfThisSalesman] = createColorRandom();
    }

    //sommmo l'amount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisSalesman] += thisObj.amount;

    //sommo l'amount alla somma totale
    jsonNew.totalSales =+ json[i].amount;
  }

  // creo la percentuale di vendita
  var salesPerc = jsonNew.data.map(function(value) {
    return (value/jsonNew.totalSales);
  });

  //inserisco i nuovi dati
  jsonNew.dataPerc = salesPerc;

  return jsonNew;
}

//funzione che chiama api
function initDataChartSales(urlApi){
  $.ajax({
    url: urlApi,
    method: 'GET',
    success: function(data){
      //preparo i dati 
      var sales = createDataChartSalesPerMan(data);
      //creo il grafico
      createChartPie(sales);

      var salesPerMonthData = createDataChartSalesPerMonth(data);
      console.log(salesPerMonthData);
      //creo il grafico
      createChartLine(salesPerMonthData);
    },
    error: function(err){
      console.log(err);
    }
  });
}

// //funzione che chiama api per vendite mensili
// function initDataChartSalesPerMonth(urlApi){
//   $.ajax({
//     url: urlApi,
//     method: 'GET',
//     success: function(data){
//       //preparo i dati dati
//       var salesPerMonthData = createDataChartSalesPerMonth(data);
//       console.log(salesPerMonthData);
//       //creo il grafico
//       createChartLine(salesPerMonthData);
//     },
//     error: function(err){
//       console.log(err);
//     }
//   });
// }

//funzione che crea grafico line
function createChartLine(obj){
  var lineChart = new Chart(ctxMonth, {
    type: 'line',
    // The data for our dataset
    data: {
      labels: obj.labels,
      datasets: [{
        label: 'Vendite per mese',
        borderColor: '#bc12bc',
        data: obj.data,
      }]
    }
  });

}

//funzione che crea grafico pie
function createChartPie(obj){
  var lineChart = new Chart(ctxSales, {
    type: 'pie',
    // The data for our dataset
    data: {
      labels: obj.labels,
      datasets: [{
        backgroundColor: obj.colors,
        borderColor: '#bc12bc',
        data: obj.dataPerc,
      }]
    }
  });

}

//funzione che genera colori casuali
function createColorRandom(){
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  return '#' + randomColor;
}

//Funzione che formatta i data per il grafico vendite
function createDataChartSalesPerMonth (json){

  //array finale da ritornare
  var jsonNew = {
    labels: [],
    data: []
  };

  for (var i = 0; i < json.length; i++) {
    var thisObj = json[i];
    var thisMonth = moment(thisObj.date, 'DD, MM, YYYY').format('MMMM');

    //se jsonNew non contiene in label il nome del venditore
    if(!jsonNew.labels.includes(thisMonth)){

      //inserisco in labels il Mese
      jsonNew.labels.push(thisMonth);
      //mi salvo la posizione nell'array
      var indexOfThisMonth = jsonNew.labels.indexOf(thisMonth);

      //inserisco in data allo stesso index amount = 0
      jsonNew.data[indexOfThisMonth] = 0;
    }

    //sommmo l'amnount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisMonth] += thisObj.amount;
  }

  return jsonNew;
}
