$(document).ready(function() {

  $('#assignUnknown').click(function() {
    $('#test-btn-assignUnknown').html('bum puc')
  })

  $('#defaultDisplay').click(function() {
    $('#test-btn-defaultDisplay').html('BUM Puc!');
    console.log("puc");
  })


$('#geo-menu').on('menuUpdate', function(e) {
  // console.log("Jsem v menuUpdate event", e.detail);

  switch(e.detail) {
    case 'radioDisplay':
      $('#test-div-radio-display').html( "Hu" );
      console.log("Jsem v radioDisplay event");
      break;

    // case 'assignUnknown':
    //   $('#test-btn-assignUnknown').html( Menu.getMinDataVolume() )
    //   break;

    // case 'defaultDisplay':
    //   $('#test-btn-defaultDisplay').html( Menu.getNodeSize() )
    //   break;

    case 'attackType':
      $('#test-div-checkbox-attackType').html( "Ha" );
      console.log("Jsem v attackType event");
      break;

    case 'showLabel':
      $('#test-div-checkbox-showLabel').html( document.getElementById('check-show-label').checked )
      console.log("Jsem v showLabel event");
      break;

    case 'init':
      break;
  }    

})

  // INICIALIZACE TEST MENU
  // var evt = new CustomEvent('menuUpdate', { detail: 'init'});
  // document.getElementById("menu").dispatchEvent(evt);

})

