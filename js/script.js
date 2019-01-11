(function(){

  var urlApi = 'http://157.230.17.132:4009/sales';
  var $ctxSales = $('.chart-sales-man');
  var $ctxMonth = $('.chart-sales-month');
  var $ctxQuarter = $('.chart-sales-quarter');
  var tmpOptionSelect = $('#template--option').html();
  var tmpOptionTable = $('#template--table').html();
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
  var chartBar = false;
  var tables = {
    chartLine: $('.table-sales-month'),
    chartPie: $('.table-sales-man'),
    chartBar: $('.table-sales-quarter')
  };

  $(document).ready(function(){

    //prendo i dati da Api e avvio creazione grafico Torta
    getDataApi(urlApi);

    //creo la select mesi
    createOption($selectMonth, tmpOptionSelect, MONTH);

    //popolo la select dei giorni
    var days = createArray(31);
    createOption($selectDay, tmpOptionSelect, days);

    $selectMonth.change(function(){
      var selectedMonth = $(this).val();
      var selectedYear = $selectYear.val();
      var momentString = selectedYear + '-' + selectedMonth;
      var daysInMonth = moment(momentString, 'YYYY-MMMM').daysInMonth();
      var days = createArray(daysInMonth);
      createOption($selectDay, tmpOptionSelect, days);
    });

    //al click sul bottone faccio check dati e invio chiamata post
    $buttonInsertSale.click(function(){
      var $salesMan = $selectMan.val();
      var $salesMonth = $selectMonth.val();
      //converto il mese nel formato MM
      $salesMonth = moment($salesMonth, 'MMMM').format('MM');

      var $salesDay = $selectDay.val();
      var $salesYear = $selectYear.val();
      var $salesAmount = parseFloat($inputAmount.val());
      var date = $salesDay + '-' + $salesMonth + '-' + $salesYear;

      //controllo che i dati siano validi
      var isDate = checkIsValid(date, 'isDate');
      var isNumber = checkIsValid($salesAmount, 'isNumber');
      //prendo i venditori dall'oggetto chart gia' creato
      var arraySalesman = chartPie.config.data.labels;
      var isSalesMan = checkIsValid($salesMan, 'isInArray', arraySalesman);

      if(isDate && isNumber && isSalesMan){
        var dataSale = {
          'salesman': $salesMan,
          'date': date,
          'amount': $salesAmount
        };

        //se esiste chartPie
        if(chartPie){
          // salvo i colori attuali della pieChart
          var colors = chartPie.config.data.datasets[0].backgroundColor;
        }

        //creo la vendita
        createSale(dataSale, colors);
      }
      else{
        alert('non hai inserito corretamente i dati');
      }

    });

  });


  //funzione che chiama api
  function getDataApi(urlApi, colors) {
    var thisColors = colors || false;

    $.ajax({
      url: urlApi,
      method: 'GET',
      success: function(data) {
        //preparo i dati vendite per agente
        var sales = createDataChartSalesPerMan(data, thisColors);
        //creo la select agenti utilizzando le labels create per il grafico
        createOption($selectMan, tmpOptionSelect, sales.data.labels);

        //preparo i dati vendite per mese
        var salesPerMonthData = createDataChartSalesPerMonth(data);
        var salesPerQuarter = createDataChartSalesPerQuarter(data);

        //creo il grafici e li inserisco nelle variabili globali
        chartPie = createChart($ctxSales, chartPie, 'chartPie', sales);
        chartLine = createChart($ctxMonth, chartLine, 'chartLine', salesPerMonthData);
        chartBar = createChart($ctxQuarter, chartBar, 'chartBar', salesPerQuarter);

      },
      error: function(err) {
        console.log(err);
      }
    });

  }

  //Funzione che formatta i dati per il grafico venditori
  function createDataChartSalesPerMan (json, colors){
    //variabile che contiene i colori creati al primo avvio
    var thisColors = colors || [];

    var jsonNew = {
      labels: [],
      colors: thisColors,
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

        if (jsonNew.colors[indexOfThisSalesman] == undefined){
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

    //inserisco i nuovi dati
    jsonNew.dataPerc = salesPerc;

    //creo l'oggetto da passare a chartjs
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
          label: 'Vendite per Agente',
        }]
      }
    };

    //ritorno l'oggetto da passare a chartjs
    return dataForChart;
  }

  //Funzione che formatta i data per il grafico vendite
  function createDataChartSalesPerMonth (json){

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
      //trasformo il mese da numero a nome
      var thisMonth = moment(thisObj.date, 'DD, MM, YYYY').format('MMMM');
      //salvo l'indice del mese
      var indexOfThisMonth = jsonNew.labels.indexOf(thisMonth);

      //se non esiste creo il data
      if(!jsonNew.data[indexOfThisMonth]){
        jsonNew.data[indexOfThisMonth] = 0;
      }

      //sommmo l'amount a quello precedente nello stesso index del venditore
      jsonNew.data[indexOfThisMonth] += parseFloat(thisObj.amount);
    }

    //creo l'oggetto tutti i dati da passare a chartjs
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

    //ritorno l'oggetto da passare a chartjs
    return dataForChart;
  }

  //Funzione che formatta i data per il grafico vendite per quarter
  function createDataChartSalesPerQuarter (json){
    var thisColors = ['red', 'coral', 'blue', 'lightblue'];

    var jsonNew = {
      'labels': [
        'Q1',
        'Q2',
        'Q3',
        'Q4',
      ],
      'month': [
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
      'colors': thisColors,
      'data': [0, 0, 0, 0],
      'total_sales': 0
    };

    for (var i = 0; i < json.length; i++) {
      var thisObj = json[i];
      var thisMonth = moment(thisObj.date, 'DD, MM, YYYY').format('MMMM');
      var indexOfThisMonth = jsonNew.month.indexOf(thisMonth);
      var indexOfThisQuarter;

      //se la posizione del mese nell'array mesi e' inferiore o uguale a 2 ovvero 0 1 2
      if(indexOfThisMonth <=2){
        indexOfThisQuarter = 0;
      }
      //se la posizione del mese nell'array mesi e' maggiore di 2 e inferiore o uguale a 5 ovvero 3 4 5
      else if(indexOfThisMonth > 2 && indexOfThisMonth <= 5){
        indexOfThisQuarter = 1;
      }
      //se la posizione del mese nell'array mesi e' maggiore di 5 e inferiore o uguale a 8 ovvero 6 7 8
      else if(indexOfThisMonth > 5 && indexOfThisMonth <= 8){
        indexOfThisQuarter = 2;
      }
      //se la posizione del mese nell'array mesi e' maggiore di 8 e inferiore o uguale a 11 ovvero 9 10 11
      else if(indexOfThisMonth > 8 && indexOfThisMonth <= 11){
        indexOfThisQuarter = 3;
      }

      //salvo il numero totale di vendite
      jsonNew.total_sales += 1;

      //aggiungo alla vendita 1
      jsonNew.data[indexOfThisQuarter] += 1;
    }

    //preparo l'oggetto da passare a chartjs
    var dataForChart = {
      type: 'horizontalBar',
      options: {
        legend: {
          display: true,
          position : 'top',
          labels: {
            fontSize: 18
          }
        },
        tooltips: {
          callbacks: {
            label:function(tooltipItem, data){
              var amount = data.datasets[0].data[tooltipItem.index];
              return amount + ' vendite';
            }
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      },
      // The data for our dataset
      data: {
        labels: jsonNew.labels,
        datasets: [{
          backgroundColor: jsonNew.colors,
          label: 'Vendite per Quarter',
          data: jsonNew.data,
        }]
      }
    };

    //ritorno l'oggetto per chartjs
    return dataForChart;
  }

  //funzione che crea grafico
  function createChart(canvasElement, chartObject, nameChart, obj){
    if(!chartObject){
      //creo il grafico e lo conservo in una variabile globale
      //[chartObject] e' il nome della variabile
      chartObject = new Chart(canvasElement, obj);
      console.log(tables[nameChart]);
      createTable(tables[nameChart], tmpOptionTable, obj);
    } else {
      //aggiorno il grafico
      chartObject.config.data = obj.data;
      chartObject.update();
      createTable(tables[chartObject], tmpOptionTable, obj);
    }
    //ritorno l'oggetto
    return chartObject;
  }

  //Funzione che aggiunge una vendita
  function createSale(obj, colors){
    var thisColors = colors || false;

    $.ajax({
      url: urlApi,
      method: 'POST',
      data: obj,
      success: function(data){
        //richiamo la funzione che genera i grafici e passo i colori gia' usati
        getDataApi(urlApi, thisColors);
      },
      error: function(err){
        console.log(err);
      }
    });

  }

  //funzione per il controllo di inserimento data venditore vendita
  function checkIsValid(value, type, array){

    if(type === 'isDate'){
      return isDate(value);
    }

    if(type === 'isNumber'){
      return isNumber(value);
    }

    if(type === 'isInArray' && array != 'undefined'){
      return isInArray(value, array);
    }
    else {
      console.log('Non hai inserito un array');
    }

  }

})();
