$(document).ready(function() {

  $('#assignUnknown').click(function() {
    $('#test-btn-assignUnknown').html('bum puc');

    GeoMenu.setDisplayIP("source");
    GeoMenu.setDisplayCountryNames(true);
    GeoMenu.setShowAttacks(["type2", "type4"]);
  })

  $('#defaultDisplay').click(function() {
    $('#test-btn-defaultDisplay').html('BUM Puc!');
    // =console.log("puc");
    
    GeoMenu.setDisplayIP("target");
    GeoMenu.setDisplayCountryNames(false);
    GeoMenu.setShowAttacks(["type1"]);
  })

  $('#geo-menu').on('geomenuUpdate', function(e) {
    // console.log("on geomenuUpdate");
    // console.log(e);
    switch(e.detail) {
      case 'displayIP':
        $('#test-div-radio-display').html(GeoMenu.getDisplayIP());
        console.log("ZOBRAZ IP " + GeoMenu.getDisplayIP());
        break;

      case 'showNames':
        console.log("SHOW NAMES " + GeoMenu.getDisplayCountryNames());
        $('#test-div-checkbox-showLabel').html(GeoMenu.getDisplayCountryNames());
        break;

      case 'showAttacks':
        console.log("ATTACK TYPES " + GeoMenu.getShowAttacks());
        $('#test-div-checkbox-attackType').html(GeoMenu.getShowAttacks());
        break;
    }
  })
})
