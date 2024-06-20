import tape from "tape";
import L from "leaflet";
require("../");

function triggerEvent(element, type, options = {}) {
  var evt = new MouseEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: options.clientX,
    clientY: options.clientY,
    which: options.which,
    ctrlKey: true,
  });
  //evt.initEvent(type, false, true);

  // for (let option in options) {
  //   evt[option] = options[option];
  // }

  element.dispatchEvent(evt);
  return evt;
}

tape("L.Map.SelectArea", (t) => {
  function createMap() {
    let container = L.DomUtil.create("div", "map", document.body);
    let map = L.map(container).setView([22.42658, 114.1452], 11);
    return map;
  }

  t.test("exposed", (t) => {
    t.ok(L.Map.SelectArea, "exposed");
    t.equal(L.Map.prototype.options.selectArea, false, "in map options");
    t.end();
  });

  t.test("interaction", (t) => {
    t.plan(6);

    let map = createMap();

    map.on({
      areaselecttoggled: (e) => {
        t.pass("toggled");
      },
      areaselected: (e) => {
        t.ok(e.bounds, "bounds received");
        t.ok(e.start, "start point received");
        t.ok(e.end, "end point received");
      },
    });
    t.ok(map.selectArea, "handler instance");
    map.selectArea.enable();

    // otherwise tests are broken,
    // draggable takes over somehow and
    // cannot work with fake events
    map.dragging.disable();

    triggerEvent(map.selectArea._container, "mousedown", {
      clientX: 100,
      clientY: 100,
      ctrlKey: true,
      // target: map._container,
      which: 1, // button
    });

    setTimeout(() => {
      t.ok(map.selectArea._startLayerPoint, "started selection");

      triggerEvent(document, "mousemove", {
        clientX: 200,
        clientY: 200,
      });

      triggerEvent(document, "mouseup", {
        clientX: 201,
        clientY: 201,
      });
    }, 100);
  });

  t.end();
});
