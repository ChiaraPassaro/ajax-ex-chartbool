var urlApi = 'http://157.230.17.132:4009/sales';
var $ctxSales = $('.chart-sales-man');
var $ctxMonth = $('.chart-sales-month');
var $selectMan = $('#agente');
var $selectMonth = $('#mese');
var $selectDay = $('#giorno');
var $selectYear = $('#anno');
var $inputAmount = $('#valore');

var $buttonInsertSale = $('#button-inserisci');

var MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

//setto variabile oggetti chart
var chartLine = false;
var chartPie = false;

$(document).ready(function(){

  //prendo i dati da Api e avvio creazione grafico Torta
  getDataApi(urlApi);

  //creo la select mesi
  createOption($selectMonth, MONTH);

  //popolo la select dei giorni
  var days = createArray(31);
  createOption($selectDay, days);

  $selectMonth.change(function(){
    var selectedMonth = $(this).val();
    var selectedYear = $selectYear.val();
    var momentString = selectedYear + '-' + selectedMonth;
    var daysInMonth = moment(momentString, 'YYYY-MMMM').daysInMonth();
    var days = createArray(daysInMonth);
    createOption($selectDay, days);
  });

  $buttonInsertSale.click(function(){
    var $salesMan = $selectMan.val();
    var $salesMonth = $selectMonth.val();
    $salesMonth = moment($salesMonth, 'MMMM').format('MM');
    var $salesDay = $selectDay.val();
    var $salesYear = $selectYear.val();
    var $salesAmount = parseFloat($inputAmount.val());
    //console.log($salesAmount);
    var date = $salesDay + '-' + $salesMonth + '-' + $salesYear;
    var dataSale = {
      'salesman': $salesMan,
      'date': date,
      'amount': $salesAmount
    };

    //se esiste chartPie
    if(chartPie){
      // salvo i colori attuali della pieChart
      var colors = chartPie['config']['data']['datasets'][0]['backgroundColor'];
    }

    //creo la vendita
    createSale(dataSale, colors);

  });

});


//funzione che chiama api
function getDataApi(urlApi, colors) {
  var colors = colors || false;

  $.ajax({
    url: urlApi,
    method: 'GET',
    success: function(data) {
      //preparo i dati vendite per agente
      var sales = createDataChartSalesPerMan(data, colors);
      //console.log(sales);
      //creo la select agenti
      createOption($selectMan, sales.data.labels);

      //preparo i dati vendite per mese
      var salesPerMonthData = createDataChartSalesPerMonth(data);

      //creo il grafici
      chartPie = createChart($ctxSales, chartPie, sales);
      chartLine = createChart($ctxMonth, chartLine, salesPerMonthData);

    },
    error: function(err) {
      console.log(err);
    }
  });
}

//funzione che crea grafico line
function createChart(canvasElement, chartObject, obj){
  if(!chartObject){
    console.log('oggetto non esistente');
    //creo il grafico
    chartObject = new Chart(canvasElement, obj);
  } else {
    console.log('oggetto esistente');
    chartObject['config']['data'] = obj['data'];
    chartObject.update();
  }
  return chartObject;
}


//funzione che genera colori casuali
function createColorRandom(){
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  return '#' + randomColor;
}

//Funzione che formatta i datca per il grafico venditori
function createDataChartSalesPerMan (json, colors){
  var colors = colors || [];
  console.log(colors);

  //array finale da ritornare
  var jsonNew = {
    labels: [],
    colors: colors,
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

      console.log(jsonNew.colors[indexOfThisSalesman]);

      if (jsonNew.colors[indexOfThisSalesman] == undefined){
        //console.log(colors[indexOfThisSalesman]);
        var newColor = createColorRandom();
        var isColor = jsonNew.colors.includes(newColor);

        //se il colore esiste ne genera uno nuovo
        do {
          var otherColor = createColorRandom();
          jsonNew.colors[indexOfThisSalesman] = otherColor;
        } while (isColor);
      }
    }

    //cerco l'index del venditore corrente
    indexOfThisSalesman = jsonNew.labels.indexOf(thisObj.salesman);

    //sommmo l'amount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisSalesman] += parseFloat(thisObj.amount);

    //sommo l'amount alla somma totale
    jsonNew.totalSales +=  parseFloat(thisObj.amount);
  }

  // creo la percentuale di vendita
  var salesPerc = jsonNew.data.map(function(value) {
    return parseFloat((value/jsonNew.totalSales * 100).toFixed(2));
  });

  // console.log(salesPerc);
  // controllo che la somma sia 100%
  // console.log(
  //   salesPerc.reduce(
  //     function(sum, value){
  //      return sum += value;
  //     }
  //   )
  // );

  //inserisco i nuovi dati
  jsonNew.dataPerc = salesPerc;

  var dataForChart = {
    type: 'pie',
    options: {
      legend: {
          display: true,
          position : 'left',
          labels: {
            fontSize: 18
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
      labels: jsonNew.labels,
      datasets: [{
        backgroundColor: jsonNew.colors,
        borderColor: '#bc12bc',
        data: jsonNew.dataPerc,
      }]
    }
  };
  console.log(jsonNew);
  return dataForChart;
}

//Funzione che formatta i data per il grafico vendite
function createDataChartSalesPerMonth (json){
  //array finale da ritornare
  var jsonNew = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    data: []
  };
  for (var i = 0; i < json.length; i++) {
    var thisObj = json[i];
    var thisMonth = moment(thisObj.date, 'DD, MM, YYYY').format('MMMM');
    var indexOfThisMonth = jsonNew.labels.indexOf(thisMonth);

    //se non esiste creo il data
    if(!jsonNew.data[indexOfThisMonth]){
      jsonNew.data[indexOfThisMonth] = 0;
    }

    //sommmo l'amnount a quello precedente nello stesso index del venditore
    jsonNew.data[indexOfThisMonth] += parseFloat(thisObj.amount);
  }


  var dataForChart = {
    type: 'line',
    options: {
      legend: {
          display: true,
          position : 'left',
          labels: {
            fontSize: 18
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
      labels: jsonNew.labels,
      datasets: [{
        label: 'Fatturato mensile',
        borderColor: '#bc12bc',
        data: jsonNew.data,
      }]
    }
  };

  return dataForChart;
}


function createOption(select, option){
  select.html('');
  for (var i = 0; i < option.length; i++) {
    select.append('<option value="' + option[i] + '">' + option[i] + '</option>');
  }
}

function createArray(number){
  array = [];
  for (var i = 0; i < number; i++) {
    array.push(i + 1);
  }
  return array;
}

function createSale(obj, colors){
  var colors = colors || false;

  //console.log(obj);
  $.ajax({
    url: urlApi,
    method: 'POST',
    data: obj,
    success: function(data){
      getDataApi(urlApi, colors);
    },
    error: function(err){
      console.log(err);
    }
  });
}
