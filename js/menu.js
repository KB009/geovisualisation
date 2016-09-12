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
  allAttacks : [],
  showAttacks : ["INSTMSG", "COUNTRY"],
  assignCountry : null,

  //div-radio-display -- display IP addresses
  setDisplayIP: function(newValue) {
    GeoMenu.displayIP = newValue;
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
    return GeoMenu.displayIP;
  }, 

  setDisplayCountryNames: function(newValue) {
    GeoMenu.displayCountryNames = newValue;
    // console.log("setDisplayCountryNames");

    document.getElementById('check-show-label').checked = newValue;

    var evt = new CustomEvent('geomenuUpdate', { detail: 'showNames'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getDisplayCountryNames: function() {
    // console.log("getDisplayCountryNames: " + displayCountryNames);
    return GeoMenu.displayCountryNames;
  },

  setAllAttacks: function(newValue) {
    GeoMenu.allAttacks = newValue;
    
    for (var i = 0; i < newValue.length; i++) {
        var checkbox, label;
        
        if (GeoMenu.showAttacks.indexOf(newValue[i]) === -1)
            checkbox = '<td><input type="checkbox" id="checkbox-' + i + '" name="' + newValue[i] + '"></td>';
        else
            checkbox = '<td><input type="checkbox" id="checkbox-' + i + '" name="' + newValue[i] + '" checked></td>';
            
        label = "<td><label for='checkbox-" + i + "'>" + newValue[i] + "</label></td>";
    
        $(".check-attacks").append('<tr>' + checkbox + label + '</tr>');
    }
         
    var evt = new CustomEvent('geomenuUpdate', { detail: 'showAttacks'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getAllAttacks: function() {
    return GeoMenu.allAttacks;
  },
  setShowAttacks: function(newValue) {  
    var checkboxes = $(".check-attacks tr input"); 

    for (var i = 0; i < checkboxes.length; i++) {
        // if the checkbox is found in new values and isn't checked
        if (newValue.indexOf(checkboxes[i].name) !== -1 && checkboxes[i].checked === false) {
            $(checkboxes[i]).prop('checked', true);
        }
        // if the checkbox isn't found in new values and is checked
        else if (newValue.indexOf(checkboxes[i].name) === -1 && checkboxes[i].checked === true) {
            $(checkboxes[i]).prop('checked', false);
        }            
    } 
    
    GeoMenu.showAttacks = newValue;
    
    var evt = new CustomEvent('geomenuUpdate', { detail: 'showAttacks'});
    document.getElementById("geo-menu").dispatchEvent(evt);
    
  },
  getShowAttacks: function() {
    return GeoMenu.showAttacks;
  },
  initAttacksSelection: function() {
    // ********* C H E C K / Attack types **********
    var checkAttacks = document.getElementsByClassName("check-attacks")[0].rows;

    for (var i = 0; i < checkAttacks.length; i++) {
        var ch = document.getElementById('checkbox-' + i);
        ch.onclick = function() {
          var index = GeoMenu.getShowAttacks().indexOf(this.name);
        if (this.checked && index === -1) 
            GeoMenu.showAttacks.push(this.name);
        else if (this.checked === false && index !== -1)
            GeoMenu.showAttacks.splice(index, 1);

        var evt = new CustomEvent('geomenuUpdate', { detail: 'showAttacks'});
        document.getElementById("geo-menu").dispatchEvent(evt);
    
      };
    }
  },
  getAssignedCountry: function() {
    return GeoMenu.assignCountry;
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
    .append("<table class='check-attacks'></table>");

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
  $('body').append('<div id="country-dialog"><div class="content"><table></table></div></div>')
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
  
  // ********* C H E C K / Assign unknown **********
  $('#assignUnknown').click(function() {

    var options = {
        autoOpen: false,
        height: 250,
        width: 200,
        resizable: false,
        modal: true,
        dialogClass: 'country-selector',
        position: { at: "left bottom", my: "left top", of: "#assignUnknown"},
        buttons: [{
            text: "zrušit",
            class: 'cancel',
            click: function() {
              $( this ).dialog( "close" );
            }
            },{
            text: "použít",
            class: 'assign-country',
            click: function() {
              var selected = $("input[type='radio'][name='assign-country']:checked").attr('id');
              
              if (selected !== undefined) {
                    GeoMenu.assignCountry = selected;
                    var evt = new CustomEvent('geomenuUpdate', { detail: 'assignCountry'});
                    document.getElementById("geo-menu").dispatchEvent(evt);
              }
              $( this ).dialog( "close" );
            }
        }]
    };   

    $( "#country-dialog" ).dialog(options).dialog( "open" );
        
    var countries;    
    $.each(window.countryNames, function(code,name) {
        countries += '<tr><td><input type="radio" id="' + code + '" name="assign-country"></td>';
        countries += '<td><label for="' + code + '">' + name + '</label></td></tr>';
    })
    
    $('#country-dialog .content table').append(countries);    
  
  });
})
