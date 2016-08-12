/*
    REFACTOR
    * div-radio-button / change name of radio1 and radio2 to color-radio1, color-radio2
    * both radiobuttons / change their name (radio, radio2) to something more meaningful

    TODO
    * zkontrolovat checked u radiobuttonu v js
    * zkontrolovat na co potrebuji checkbox-mapto id
 */

var GeoMenu = {
  displayIP : "source",
  displayCountryNames : false,
  showAttacks : ["type1", "type3"],

  //div-radio-display -- display IP addresses
  setDisplayIP: function(newValue) {
    displayIP = newValue; // is it ok? Do I have to use object namespace?
    // console.log("setDisplayIP");

    if (newValue == "source") {
      document.getElementById("radio-display-source").checked = true;
    } else {
      document.getElementById("radio-display-target").checked = true;
    }

    var evt = new CustomEvent('geomenuUpdate', { detail: 'displayIP'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getDisplayIP: function() {
    return displayIP;
  }, 

  setDisplayCountryNames: function(newValue) {
    displayCountryNames = newValue;
    // console.log("setDisplayCountryNames");

    document.getElementById('check-show-label').checked = newValue;

    var evt = new CustomEvent('geomenuUpdate', { detail: 'showNames'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getDisplayCountryNames: function() {
    // console.log("getDisplayCountryNames: " + displayCountryNames);
    return displayCountryNames;
  },

  setShowAttacks: function(newValue) {
    showAttacks = newValue;
    // console.log("setShowAttacks");

    // TO FINISH
     
    var evt = new CustomEvent('geomenuUpdate', { detail: 'showAttacks'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getShowAttacks: function() {
    return showAttacks;
  }


};

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
      'id':'radio-display-source',
      'value': 0,
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'radio-display-source' }).html("Zdrojové"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'radio',
      'name':'radio-display',
      'id':'radio-display-target',
      'value': 1
    }))
    .append($('<label/>', { 'for':'radio-display-target' }).html("Cílové"))

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
      'name':'check-attacks',
      'checked':'checked'
    }))
    .append($('<label/>', { 'for':'check-attack-1'}).html("Utok 1"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check-attack-2',
      'name':'check-attacks'
    }))
    .append($('<label/>', { 'for':'check-attack-2'}).html("Utok 2"))
    .append($('<br>'))
    .append($('<input/>', {
      'type':'checkbox',
      'id':'check-attack-3',
      'name':'check-attacks',
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
  // console.log(rad);

  for (var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {

      if (this.value == 0) {
        GeoMenu.setDisplayIP("source");
      }
      if (this.value == 1) {
        GeoMenu.setDisplayIP("target");
      }
    }
  }

  // ********* C H E C K / Display Country names **********
  var showNames = document.getElementById("check-show-label");
  showNames.onclick = function() {
    // console.log(showNames.checked);
    GeoMenu.setDisplayCountryNames(showNames.checked);
    
  }

  // ********* C H E C K / Attack types **********
  var checkAttacks = document.getElementsByName("check-attacks");
  // console.log(checkAttacks);

  for (var i = 0; i < checkAttacks.length; i++) {
    checkAttacks[i].onclick = function() {
      var attacks = [];
      attacks.push("type1");
      // TO FINISH
      
      GeoMenu.setShowAttacks(attacks);
    }
  }
})
