//Funzioni Utilita'

//Funzione che crea una option da template handlebars
function createOption(select, sourceTemplate, values){

  var oContext = {
    'values': []
  };

  for (var i = 0; i < values.length; i++) {
    oContext.values.push({'value': values[i]});
  }

  select.html('');
  var template = Handlebars.compile(sourceTemplate);
  var html = template(oContext);
  select.html(html);

}

//Funzione che crea una tabella da template handlebars
function createTable(table, sourceTemplate, obj){
  var labels = obj.data.labels;
  var data = obj.data.datasets[0].data;
  var title = obj.data.datasets[0].label || false;

  var oContext = {
    'title': title,
    'labels': [],
    'rows':[],

  };

  for (var i = 0; i < labels.length; i++) {
    oContext.labels.push({'label': labels[i]});
  }

  for (var i = 0; i < data.length; i++) {
    oContext.rows.push({'value': data[i]});
  }
  table.html('');
  var template = Handlebars.compile(sourceTemplate);
  var html = template(oContext);
  table.html(html);

}



//Funzione che crea un array di numeri passando il numero massimo a cui arrivare
function createArray(number){
  array = [];
  for (var i = 0; i < number; i++) {
    array.push(i + 1);
  }
  return array;
}

//Funzione che controlla se il valore dato e' una data valida per Momentjs
function isDate(value){
  var thisIsDate = moment(value, 'DD-MM-YYYY').format();

  if(thisIsDate != 'Invalid date'){
    return true;
  }
  else {
    return false;
  }

}

//funzione che controlla se il valore e' un numero
function isNumber(value){
  if(!isNaN(value)){
    return true;
  }
  else {
    return false;
  }
}

//Funzione che controlla se un valore e' in un array
function isInArray(value, array){
  if(array.includes(value)){
    return true;
  }
  else {
    return false;
  }
}


//funzione che genera colori casuali
function createColorRandom(){
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  return '#' + randomColor;
}
