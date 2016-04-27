/*
    REFACTOR
    * div-radio-button / change name of radio1 and radio2 to color-radio1, color-radio2
    * both radiobuttons / change their name (radio, radio2) to something more meaningful

    TODO
    * zkontrolovat checked u radiobuttonu v js
    * zkontrolovat na co potrebuji checkbox-mapto id
 */

var GeoMenu = {};

GeoMenu.render = function() {
  var menuwrapper = $('<div/>', {'id':'topmenu'});

  // RADIOBUTTON / Prepinani mezi zobrazenim zdrojovych/cilovych IP adres
  var radioDisplay = $('<div/>', {
    'id':'div-radio-display', 
    // 'title':'Zobraz IP adresu',  // zdrojovou, cilovou
    'class':'buttonset'
  }).append($('<h2/>').html("Zobraz IP adresy"))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio-display',
      'id':'radio-display-1',
      'value': 0,
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'radio-display-1' }).html("Zdrojové"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio-display',
      'id':'radio-display-2',
      'value': 1
    }))
    .append($('<label/>', { 'for':'radio-display-2' }).html("Cílové"))

  // $(menuwrapper).append(radioDisplay);

    // CHECKBOX / zobrazit ci skryt jmena statu
  var checkboxShowLabel = $('<div/>', {
    // 'class':'buttonset',
    'id':'checkbox-showLabel'
  }).append($('<input/>', {
    'type':'checkbox',
    'id':"check-show-label"
  })).append($('<label/>', { 'for':'check-show-label' }).html("Zobraz jména států"));
  // $(menuwrapper).append(checkboxShowLabel);

  var columnLabels = $('<div/>', { 'id':'column-labels', 'class':'menu-column' }).append(radioDisplay).append(checkboxShowLabel);
  $(menuwrapper).append(columnLabels);




  // CHECKBOX / typy utoku
  var checkboxAttackType = $('<div/>', {
    // 'class':'buttonset',
    'class':'menu-column',
    'id':'column-checkbox-attackType'
  }).append($('<h2/>').html("Typ útoku"))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check-attack-1',
      'name':'check-attack',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'check-attack-1'}).html("Utok 1"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check-attack-2',
      'name':'check-attack'
    }))
    .append($('<label/>', { 'for':'check-attack-2'}).html("Utok 2"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check-attack-3',
      'name':'check-attack',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'check-attack-3'}).html("Utok 3"));
    // .append($('<br>'))
   $(menuwrapper).append(checkboxAttackType);




  // BUTTON / Priradit unknown k urcitemu statu
  var buttonAssignUnknown = $('<button/>', { 'id':'assignUnknown', 'class':'button' })
   .html("Přiřaď unknown");
    // .append($('<br>'));
  // $(menuwrapper).append(buttonAssignUnknown);

  // BUTTON / Prepnuti do univerzalniho zobrazeni (napr. cela mapa)
  var buttonDefaultDisplay = $('<button/>', { 'id':'defaultDisplay', 'class':'button' })
    .html("Univerzální zobrazení");
  // $(menuwrapper).append(buttonDefaultDisplay);

  var columnButtons = $('<div/>', { 'id':'column-buttons', 'class':'menu-column'})
    .append(buttonAssignUnknown)
    .append($('<br>'))
    .append(buttonDefaultDisplay);

  $(menuwrapper).append(columnButtons);


  return menuwrapper;
}

$(document).ready(function() {

  // dynamically create HTML
  $('#geo-menu').append(GeoMenu.render());

  $('#assignUnknown').button();
  $('#defaultDisplay').button();

  // ********* R A D I O / Display IP adresses of **********
  var rad = document.getElementsByName('radio-display');

  for (var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {
      var evt = new CustomEvent('menuUpdate', { detail: 'radioDisplay'});
      document.getElementById("geo-menu").dispatchEvent(evt);
    }
  }

  // ********* C H E C K /  **********
  var checkOpt = document.getElementById('check-show-label');

  checkOpt.onclick = function() {
    var evt = new CustomEvent('menuUpdate', { detail: 'showLabel'});
    document.getElementById("geo-menu").dispatchEvent(evt);
  }


})
