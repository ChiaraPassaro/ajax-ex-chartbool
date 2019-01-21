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
  var $wrapperCtxSales = $('.chart__peragente');
  var $wrapperCtxMonth = $('.chart__mensile');
  var $wrapperCtxQuarter = $('.chart__perquarter');

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

  //setto variabile oggetti charts
  var charts = {
    chartLine: {
      chart: undefined,
      table: $('.table-sales-month')
    },
    chartPie:{
      chart: undefined,
      table: $('.table-sales-man')
    },
    chartBar: {
      chart: undefined,
      table: $('.table-sales-quarter')
    }
  };

  var animations = [];

  $(document).ready(function(){

    //prendo i dati da Api e avvio creazione grafico Torta
    getDataApi(urlApi);

    //creo la select mesi
    createOption($selectMonth, tmpOptionSelect, MONTH);

    //popolo la select dei giorni
    var days = createArray(31);
    createOption($selectDay, tmpOptionSelect, days);

    //se cambio la select creo i nuovi giorni
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
      var arraySalesman = charts.chartPie.chart.config.data.labels;
      var isSalesMan = checkIsValid($salesMan, 'isInArray', arraySalesman);

      if(isDate && isNumber && isSalesMan){
        var dataSale = {
          'salesman': $salesMan,
          'date': date,
          'amount': $salesAmount
        };

        //se esiste l'oggetto chart
        if(charts){
          //per ognuna delle sue chiavi
          for (var chart in charts) {
            //se e' stata popolata
            if(chart != undefined){
              //prendo i colori
              charts[chart].chart.colors = charts[chart].chart.config.data.datasets[0].backgroundColor;
            }
          }
        } else {
          alert('Si è verificato un errore nella costruzione dei grafici');
        }

        //creo la vendita
        createSale(dataSale);
      }
      else{
        alert('non hai inserito corretamente i dati');
      }

    });

    //add animation
    $('.chart__closed').on('click',function(){
      addClickAnimation(this);
      }
    );

  });

  //funzione che aggiunge click
  function addClickAnimation(thisElement){
      alert('click');
      $(thisElement).removeClass('chart__closed');
      $(thisElement).off('click');
      var $insertSale = $('.inserisci-vendita');
      animDash(thisElement, $insertSale);
  }

  //funzione animazione
  function animDash(thisElement, $insertSale) {
    $(thisElement).removeClass('closed');

    var topHeight = $('.page__title').outerHeight();
    var heightWindow = $(window).height();

    //salvo posizione dell'elemento
    animations.position = $(thisElement).position();

    //salvo posizioni degli elementi vicini
    var siblings = $(thisElement).siblings('div');
    animations.siblingsPosition = [];
    siblings.each(
      function(){
        animations.siblingsPosition.push($(this).position());
    });
    animations.siblingsMargin = [];
    siblings.each(
      function(){
        animations.siblingsMargin.push($(this).css('margin'));
    });
    animations.siblingsPadding = [];
    siblings.each(
      function(){
        animations.siblingsPadding.push($(this).css('padding'));
    });
    animations.siblingsWidth = [];
    siblings.each(
      function(){
        animations.siblingsWidth.push($(this).outerWidth());
    });

    //nascondo i div fratelli
    animations.siblings = new TweenMax.fromTo(siblings, 0, {
      position: 'relative',
      zIndex: 0,
      top: function(index, target) {
        return animations.siblingsPosition[index].top
      },
      left: function(index, target) {
        return animations.siblingsPosition[index].left
      },
      margin: function(index, target){
        return animations.siblingsMargin[index];
      },
      padding: function(index, target){
        return animations.siblingsPadding[index];
      },
      width: function(index, target){
        return animations.siblingsWidth[index];
      }
    }, {
      position: 'absolute',
      zIndex: 0,
      top: function(index, target) {
        return animations.siblingsPosition[index].top;
      },
      left: function(index, target) {
        return animations.siblingsPosition[index].left;
      },
      margin: function(index, target){
        return animations.siblingsMargin[index];
      },
      padding: function(index, target){
        return animations.siblingsPadding[index];
      },
      width: function(index, target){
        return animations.siblingsWidth[index];
      },
      onComplete: function() {
        //avvio animazione su elemento click
        animations.element = new TweenMax.fromTo(thisElement, 1, {
          zIndex: 0,
          top: animations.position.top,
          left: animations.position.left
        }, {
          zIndex: 3,
          top: topHeight,
          left: 0,
          width: '100%',
          height: heightWindow - topHeight,
          margin: '0',
          padding: '20px',
          position: 'fixed',
          onStart: function (){
            //conservo grandezza chart
            animations.element.chartHeight = $(this.target).find('canvas').height();

            //nascondo div inserimento
            animations.insert = new TweenMax.to($insertSale, 1, {
              overflow: 'hidden',
              height: 0,
              padding: 0
            });
          },
          onComplete: function() {
            console.log(animations);
            closeElement(thisElement, this);
          },
          onReverseComplete: function(){
            animations.siblings.reverse();
            $(animations.element.target).find('canvas').css('height', animations.element.chartHeight);
            $(animations.element.target).attr('style', ' ').addClass('closed').on('click',function(){
              addClickAnimation(this);
            });
          }
        });

      },
    });


  }

  //funzione icona chiusura
  function closeElement(thisElement, thisTween) {
    var $closeBtn = $(thisElement).find('.chart__close');
    $closeBtn.addClass('active');
    $closeBtn.click(function(thisElement) {
      $closeBtn.removeClass('active');
      $(thisElement).addClass('closed');

      animations.element.reverse();
      animations.insert.reverse();


    });
  }

  //funzione che chiama api
  function getDataApi(urlApi) {
    $.ajax({
      url: urlApi,
      method: 'GET',
      success: function(data) {
        //preparo i dati vendite per agente
        if(charts.chartPie.chart != undefined){
          var salesColors = charts.chartPie.chart.colors;
        }
        var sales = createDataChartSalesPerMan(data, salesColors);
        //creo la select agenti utilizzando le labels create per il grafico
        createOption($selectMan, tmpOptionSelect, sales.data.labels);

        //preparo i dati vendite per mese
        var salesPerMonthData = createDataChartSalesPerMonth(data);

        //preparo i dati vendite per quarter
        if(charts.chartBar.chart != undefined){
          var quarterColors = charts.chartBar.chart.colors;
        }
        var salesPerQuarter = createDataChartSalesPerQuarter(data, quarterColors);

        //creo il grafici e li inserisco nelle variabili globali
        charts.chartPie.chart = createChart($ctxSales, charts.chartPie.chart, 'chartPie', sales);
        charts.chartLine.chart = createChart($ctxMonth, charts.chartLine.chart, 'chartLine', salesPerMonthData);
        charts.chartBar.chart = createChart($ctxQuarter, charts.chartBar.chart, 'chartBar', salesPerQuarter);

      },
      error: function(err) {
        console.log(err);
      }
    });

  }

  //Funzione che formatta i dati per il grafico venditori
  function createDataChartSalesPerMan (json, colors){
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
          var newColor;
          //se il colore esiste ne genera uno nuovo
          do {
            newColor = createColorRandom('0.7');
          } while (isInArray(newColor, jsonNew.colors));

          jsonNew.colors[indexOfThisSalesman] = newColor;
          //console.log(jsonNew.colors[indexOfThisSalesman]);
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
          },
        },
        responsive: true,
        maintainAspectRatio: false,
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
          borderColor: '#fff',
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
      //da inserire check dati
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
          position : 'top',
          labels: {
            fontSize: 18
          }
        },
        responsive: true,
        maintainAspectRatio: false,
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
          label: 'Fatturato Mensile',
          borderColor: '#bc12bc',
          data: jsonNew.data,
        }]
      }
    };

    //ritorno l'oggetto da passare a chartjs
    return dataForChart;
  }

  //Funzione che formatta i data per il grafico vendite per quarter
  function createDataChartSalesPerQuarter (json, colors){
    var thisColors = colors || [];

    if(!colors){
      for (var k = 0; k < 4; k++) {
        var newColor;
        do{
          newColor = createColorRandom('0.7');
        } while (isInArray(newColor,thisColors));
        thisColors.push(newColor);
      }
    }

    //console.log(thisColors);
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
        responsive: true,
        maintainAspectRatio: false,
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
      chartObject.height = 100;
      //console.log(chartObject.height);
      createTable(charts[nameChart].table, tmpOptionTable, obj);
    } else {
      //aggiorno il grafico
      chartObject.config.data = obj.data;
      chartObject.update();
      createTable(charts[nameChart].table, tmpOptionTable, obj);
    }
    //ritorno l'oggetto
    return chartObject;
  }

  //Funzione che aggiunge una vendita
  function createSale(obj){

    $.ajax({
      url: urlApi,
      method: 'POST',
      data: obj,
      success: function(data){
        //richiamo la funzione che genera i grafici e passo i colori gia' usati
        getDataApi(urlApi);
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
