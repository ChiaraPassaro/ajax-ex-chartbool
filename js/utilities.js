//Funzioni Utilita'

//Funzione che crea una option
function createOption(select, option){
  select.html('');
  for (var i = 0; i < option.length; i++) {
    select.append('<option value="' + option[i] + '">' + option[i] + '</option>');
  }
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
