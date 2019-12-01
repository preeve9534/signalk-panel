// Initialise page immediately it has loaded.
//
var HOSTS = [ [ location.hostname, location.port ], [ "www.pdjr.eu", 3000 ] ]

function init(localinit) {
    // Stop the browser from displaying the right-click context menu.
    document.addEventListener("contextmenu", (e) => { contextHandler(e); e.preventDefault(); });
    window.event.cancelBubble = true;
    
    var signalk = new SignalK(HOSTS[0][0], HOSTS[0][1],
        function() {
            // Initialise page helper library
            var pageutils = new PageUtils({ "overlayOnLoad": function(r) { }});

            // Load document fragments
            PageUtils.include(document);

            // Load application configuration into local storage
            PageUtils.walk(document, "storage-config", element => LocalStorage.initialise(element));

            // Populate page with local storage item values
            PageUtils.walk(document, "storage-item-value", element => element.innerHTML = LocalStorage.getAtom(element.getAttribute("data-storage-item-name")));

            // Populate page with static values derived from Signal K server
            PageUtils.walk(document, "signalk-static", element => {
                var path = PageUtils.getAttributeValue(element, "data-signalk-path");
                var filter = FunctionFactory.getFilter(PageUtils.getAttributeValue(element, "data-filter"));
                signalk.interpolateValue(path, element, true, filter);
            });

            // Populate page with dynamic values derived from Signal K server
            PageUtils.walk(document, "signalk-dynamic", element => {
                var path = PageUtils.getAttributeValue(element, "data-signalk-path");
                var filter = FunctionFactory.getFilter(PageUtils.getAttributeValue(element, "data-filter"));
                signalk.registerCallback(path, function(v) { alert("Hello"); });
            });

            // Populate page with widgets
            PageUtils.wildWalk(document, "widget-", element => {
                var widgetType = element.className.split(" ").reduce((a,v) => { return((v.startsWith("widget-"))?v.substr(7):undefined); }, undefined);
                if (widgetType != undefined) {
                    if (element.hasAttribute("data-parameters")) {
                        var params = Parameters.createParameters(element.getAttribute("data-parameters"));
                        var source = params.getParameter("source");
                        if (source !== undefined) {
                            signalk.registerCallback(source, Widget.createWidget(element, widgetType, params, WidgetComponent.createWidgetComponent, FunctionFactory.getFilter));
                        }
                    } 
                }
            });
            if (localinit !== undefined) localinit(signalk);
        },
        function() {
            HOSTS = HOSTS.splice(1);
            if (HOSTS.length) init(localinit);        
        }
    );

}
