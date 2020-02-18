const config = {
  show: false
};

function hasClass(el, cls) {
  if (el) {
    cls = cls || "";
    if (cls.replace(/\s/g, "").length == 0) return false;
    return new RegExp(" " + cls + " ").test(" " + el.className + " ");
  }
}

function addClass(el, cls) {
  if (!hasClass(el, cls) && el) {
    el.className = el.className == "" ? cls : el.className + " " + cls;
  }
}

function removeClass(el, cls) {
  if (hasClass(el, cls) && el) {
    let newClass = " " + el.className.replace(/[\t\r\n]/g, "") + " ";
    while (newClass.indexOf(" " + cls + " ") >= 0) {
      newClass = newClass.replace(" " + cls + " ", " ");
    }
    el.className = newClass.replace(/^\s+|\s+$/g, "");
  }
}

function toggleClass(el, cls) {
  if (hasClass(el, cls)) {
    removeClass(el, cls);
  } else {
    addClass(el, cls);
  }
}

function check(el) {
  config.show = !config.show;
  toggleClass(el.children[0], "checked");
}

document.addEventListener("DOMContentLoaded", event => {
  setCanvasSize();
});

function setCanvasSize() {
  document.getElementById("glCanvas").width = document.getElementById(
    "canvas-box"
  ).clientWidth;
}
