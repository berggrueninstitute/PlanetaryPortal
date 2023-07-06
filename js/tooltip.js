/*
 * Creates tooltip with provided id that
 * floats on top of visualization.
 * Most styling is expected to come from CSS
 * so check out bubble_chart.css for more details.
 */
function floatingTooltip(tooltipId, width, xPosOffset) {
    // Local variable to hold tooltip div for
    // manipulation in other functions.
    var tt = d3.select('.tooltip')
      .attr('id', tooltipId);

    // Set a width if it is provided.
    if (width) {
      tt.style('width', width);
    }

    // Initially it is hidden.
    hideTooltip();

    /*
     * Display tooltip with provided content.
     *
     * content is expected to be HTML string.
     *
     * event is d3.event for positioning.
     */
    function showTooltip(isSmallScreen, content, event) {

      console.log(isSmallScreen)
      console.log(content)
      console.log(event)

      if(isSmallScreen){

        tt.style('opacity', 1.0)
        .style('display', 'inherit')
        .style("top","50px")
        .style("bottom","auto")
        .style("left",0)
        .style("right",0)
        .style("margin-left","auto")
        .style("margin-right","auto")
        .html(content);


      }else{
        tt.style('opacity', 1)
        .style('display', 'inherit')
        .html(content);

        updatePosition(event);


      }


    }

    /*
     * Hide the tooltip div.
     */
    function hideTooltip() {
      tt.style('opacity', 0);
      tt.style('display', 'none');
    }

    /*
     * Figure out where to place the tooltip
     * based on d3 mouse event.
     */
    function updatePosition(event) {
      var xOffset = xPosOffset;
      var yOffset = 10;

      var ttw = tt.style('width');
      var tth = tt.style('height');

      var wscrY = window.scrollY;
      var wscrX = window.scrollX;

      var curX = (document.all) ? event.clientX + wscrX : event.pageX;
      var curY = (document.all) ? event.clientY + wscrY : event.pageY;
      var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                   curX - ttw - xOffset * 2 : curX + xOffset;

      if (ttleft < wscrX + xOffset) {
        ttleft = wscrX + xOffset;
      }

      var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                  curY - tth - yOffset * 2 : curY + yOffset;

      if (tttop < wscrY + yOffset) {
        tttop = curY + yOffset;
      }

      console.log(event.clientY + wscrY)

      if(event.clientY + wscrY >300 && event.clientY + wscrY <500){
        tttop = tttop-300;
      }

      if(event.clientY + wscrY >=500){
        tttop = tttop-450;
      }

      if(event.clientX + wscrX >520){
        ttleft = ttleft-500;
      }



      tt
        .style('top', tttop + 'px')
        .style('left', ttleft + 'px');
    }

    return {
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      updatePosition: updatePosition
    };
  }