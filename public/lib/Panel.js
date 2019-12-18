class Panel extends SignalK {

    static createPanel(container, host, port) {
        return(new Panel(container, host, port));
    }

    constructor(container, host, port) {
        super(host, port).waitForConnection().then(_ => {
            // Initialise page helper library
            var pageutils = new PageUtils({ "overlayOnLoad": function(r) { }});
            var functionfactory = new FunctionFactory();

            // Load document fragments
            PageUtils.include(document);

            // Load application configuration into local storage
            PageUtils.walk(document, "storage-config", element => LocalStorage.initialise(element));

            // Populate page with local storage item values
            PageUtils.walk(document, "storage-item-value", element => element.innerHTML = LocalStorage.getAtom(element.getAttribute("data-storage-item-name")));

            // Populate page with static values derived from Signal K server
            PageUtils.walk(document, "signalk-static", element => {
                var path = PageUtils.getAttributeValue(element, "data-signalk-path");
                var filter = functionfactory.getFilter(PageUtils.getAttributeValue(element, "data-filter"));
                super.interpolateValue(path, element, filter);
            });

            // Populate page with dynamic values derived from Signal K server
            PageUtils.walk(document, "signalk-dynamic", element => {
                var path = PageUtils.getAttributeValue(element, "data-signalk-path");
                var filter = functionfactory.getFilter(PageUtils.getAttributeValue(element, "data-filter"));
                super.registerCallback(path, function(v) { alert("Hello"); });
            });

            // Populate page with widgets
            PageUtils.wildWalk(document, "widget-", element => {
                if (element.hasAttribute("data-source")) LocalStorage.setAsAttributes(element.getAttribute("data-source"), element); 
                if (element.hasAttribute("data-signalk-path")) {
                    super.registerCallback(element.getAttribute("data-signalk-path"), Widget.createWidget(element, element.getAttribute("data-filter")));
                }
            });
        });

    }

    connectionLost() {
        if (confirm("Server connection lost! Reconnect?")) {
            window.location = window.location;
        }
    }

    rightClick(e) {
        alert("Hello");
    }

}