var urlApi = 'http://157.230.17.132:4009/sales';
var ctxSales = $('.chart-sales-man');
var ctxMonth = $('.chart-sales-month');

//prendo i dati da Api e avvio creazione grafico Torta
initDataChartSales(urlApi);

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

      var newColor = createColorRandom();
      jsonNew.colors[indexOfThisSalesman] = newColor;

      //se il colore esiste ne genera uno nuovo
      while (!jsonNew.colors.includes(newColor)){
        var otherColor = createColorRandom();
        jsonNew.colors[indexOfThisSalesman] = otherColor;
        console.log(jsonNew.colors[indexOfThisSalesman]);
      }

    }


    //sommmo l'amount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisSalesman] += thisObj.amount;

    //sommo l'amount alla somma totale
    jsonNew.totalSales =+ json[i].amount;
    console.log(jsonNew);
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
      //preparo i dati vendite per agente
      var sales = createDataChartSalesPerMan(data);
      //creo il grafico
      createChartPie(sales);

      //preparo i dati vendite per mese
      var salesPerMonthData = createDataChartSalesPerMonth(data);
      //creo il grafico
      createChartLine(salesPerMonthData);
    },
    error: function(err){
      console.log(err);
    }
  });
}

//funzione che crea grafico line
function createChartLine(obj){
  var lineChart = new Chart(ctxMonth, {
    type: 'line',
    options: {
      legend: {
          display: true,
          labels: {
              fontSize: 20
          }
      },
      tooltips: {
        callbacks: {
            label:function(tooltipItem, data){
              var amount = data.datasets[0].data[tooltipItem.index];
              return amount + ' €';
            }
        }
      }
    },
    // The data for our dataset
    data: {
      labels: obj.labels,
      datasets: [{
        label: 'Fatturato mensile',
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
    options: {
      legend: {
          display: true,
          labels: {
              fontSize: 20
          }
      },
      tooltips: {
        callbacks: {
            label:function(tooltipItem, data){
              var label = data.labels[tooltipItem.index];
              var amount = data.datasets[0].data[tooltipItem.index];

              return label + ' - ' + amount + ' %';
            }
        }
      }
    },
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
