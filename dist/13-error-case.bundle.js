webpackJsonp(
  [9],
  {
    51: function(t, e, o) {
      "use strict";
      (function(t) {
        function e(t) {
          return t && t.__esModule ? t : { default: t };
        }
        function n(t, e) {
          if (!(t instanceof e))
            throw new TypeError("Cannot call a class as a function");
        }
        function r(t, e) {
          if (!t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return !e || ("object" != typeof e && "function" != typeof e) ? t : e;
        }
        function a(t, e) {
          if ("function" != typeof e && null !== e)
            throw new TypeError(
              "Super expression must either be null or a function, not " +
                typeof e
            );
          (t.prototype = Object.create(e && e.prototype, {
            constructor: {
              value: t,
              enumerable: !1,
              writable: !0,
              configurable: !0
            }
          })),
            e &&
              (Object.setPrototypeOf
                ? Object.setPrototypeOf(t, e)
                : (t.__proto__ = e));
        }
        var i =
            Object.assign ||
            function(t) {
              for (var e = 1; e < arguments.length; e++) {
                var o = arguments[e];
                for (var n in o)
                  Object.prototype.hasOwnProperty.call(o, n) && (t[n] = o[n]);
              }
              return t;
            },
          u = (function() {
            var t =
              ("function" == typeof Symbol &&
                Symbol.for &&
                Symbol.for("react.element")) ||
              60103;
            return function(e, o, n, r) {
              var a = e && e.defaultProps,
                i = arguments.length - 3;
              if ((o || 0 === i || (o = {}), o && a))
                for (var u in a) void 0 === o[u] && (o[u] = a[u]);
              else o || (o = a || {});
              if (1 === i) o.children = r;
              else if (i > 1) {
                for (var s = Array(i), l = 0; l < i; l++)
                  s[l] = arguments[l + 3];
                o.children = s;
              }
              return {
                $$typeof: t,
                type: e,
                key: void 0 === n ? null : "" + n,
                ref: null,
                props: o,
                _owner: null
              };
            };
          })(),
          s = o(0),
          l = e(s),
          c = o(2),
          f = e(c),
          p = (0, c.WidthProvider)(f.default),
          y = (function(t) {
            function e(o) {
              n(this, e);
              var a = r(this, t.call(this, o)),
                i = a.generateLayout();
              return (a.state = { layout: i }), a;
            }
            return (
              a(e, t),
              (e.prototype.generateDOM = function() {
                return [
                  u(
                    "div",
                    {},
                    "1",
                    u("span", { className: "text" }, void 0, "1")
                  ),
                  u(
                    "div",
                    {},
                    "2",
                    u("span", { className: "text" }, void 0, "2")
                  ),
                  u(
                    "div",
                    {},
                    "3",
                    u("span", { className: "text" }, void 0, "3")
                  )
                ];
              }),
              (e.prototype.generateLayout = function() {
                return [
                  { x: 0, y: 0, w: 1, h: 1, i: "1" },
                  { x: 1, y: 0, w: 1, h: 1, i: "2" },
                  { x: 0, y: 1, w: 2, h: 2, i: "3" }
                ];
              }),
              (e.prototype.onLayoutChange = function(t) {
                this.props.onLayoutChange(t);
              }),
              (e.prototype.render = function() {
                return l.default.createElement(
                  p,
                  i(
                    {
                      layout: this.state.layout,
                      onLayoutChange: this.onLayoutChange
                    },
                    this.props
                  ),
                  this.generateDOM()
                );
              }),
              e
            );
          })(l.default.PureComponent);
        (y.defaultProps = {
          className: "layout",
          items: 3,
          rowHeight: 100,
          onLayoutChange: function() {},
          cols: 2
        }),
          (t.exports = y),
          o.c[o.s] === t && o(3)(t.exports);
      }.call(e, o(1)(t)));
    }
  },
  [51]
);
