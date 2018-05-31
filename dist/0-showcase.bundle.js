webpackJsonp(
  [15],
  {
    21: function(t, e, o) {
      "use strict";
      (function(t) {
        function e(t) {
          return t && t.__esModule ? t : { default: t };
        }
        function n(t, e) {
          if (!(t instanceof e))
            throw new TypeError("Cannot call a class as a function");
        }
        function a(t, e) {
          if (!t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return !e || ("object" != typeof e && "function" != typeof e) ? t : e;
        }
        function r(t, e) {
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
        function i() {
          return f.default.map(f.default.range(0, 25), function(t, e) {
            var o = Math.ceil(4 * Math.random()) + 1;
            return {
              x: (2 * f.default.random(0, 5)) % 12,
              y: Math.floor(e / 6) * o,
              w: 2,
              h: o,
              i: e.toString(),
              static: Math.random() < 0.05
            };
          });
        }
        var s =
            Object.assign ||
            function(t) {
              for (var e = 1; e < arguments.length; e++) {
                var o = arguments[e];
                for (var n in o)
                  Object.prototype.hasOwnProperty.call(o, n) && (t[n] = o[n]);
              }
              return t;
            },
          c = (function() {
            var t =
              ("function" == typeof Symbol &&
                Symbol.for &&
                Symbol.for("react.element")) ||
              60103;
            return function(e, o, n, a) {
              var r = e && e.defaultProps,
                i = arguments.length - 3;
              if ((o || 0 === i || (o = {}), o && r))
                for (var s in r) void 0 === o[s] && (o[s] = r[s]);
              else o || (o = r || {});
              if (1 === i) o.children = a;
              else if (i > 1) {
                for (var c = Array(i), u = 0; u < i; u++)
                  c[u] = arguments[u + 3];
                o.children = c;
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
          u = o(0),
          p = e(u),
          l = o(4),
          f = e(l),
          h = o(2),
          y = (0, h.WidthProvider)(h.Responsive),
          d = (function(t) {
            function e() {
              var o, r, s;
              n(this, e);
              for (var c = arguments.length, u = Array(c), p = 0; p < c; p++)
                u[p] = arguments[p];
              return (
                (o = r = a(this, t.call.apply(t, [this].concat(u)))),
                (r.state = {
                  currentBreakpoint: "lg",
                  compactType: "vertical",
                  mounted: !1,
                  layouts: { lg: r.props.initialLayout }
                }),
                (r.onBreakpointChange = function(t) {
                  r.setState({ currentBreakpoint: t });
                }),
                (r.onCompactTypeChange = function() {
                  var t = r.state.compactType,
                    e =
                      "horizontal" === t
                        ? "vertical"
                        : "vertical" === t ? null : "horizontal";
                  r.setState({ compactType: e });
                }),
                (r.onLayoutChange = function(t, e) {
                  r.props.onLayoutChange(t, e);
                }),
                (r.onNewLayout = function() {
                  r.setState({ layouts: { lg: i() } });
                }),
                (s = o),
                a(r, s)
              );
            }
            return (
              r(e, t),
              (e.prototype.componentDidMount = function() {
                this.setState({ mounted: !0 });
              }),
              (e.prototype.generateDOM = function() {
                return f.default.map(this.state.layouts.lg, function(t, e) {
                  return c(
                    "div",
                    { className: t.static ? "static" : "" },
                    e,
                    t.static
                      ? c(
                          "span",
                          {
                            className: "text",
                            title:
                              "This item is static and cannot be removed or resized."
                          },
                          void 0,
                          "Static - ",
                          e
                        )
                      : c("span", { className: "text" }, void 0, e)
                  );
                });
              }),
              (e.prototype.render = function() {
                return c(
                  "div",
                  {},
                  void 0,
                  c(
                    "div",
                    {},
                    void 0,
                    "Current Breakpoint: ",
                    this.state.currentBreakpoint,
                    " (",
                    this.props.cols[this.state.currentBreakpoint],
                    " ",
                    "columns)"
                  ),
                  c(
                    "div",
                    {},
                    void 0,
                    "Compaction type:",
                    " ",
                    f.default.capitalize(this.state.compactType) ||
                      "No Compaction"
                  ),
                  c(
                    "button",
                    { onClick: this.onNewLayout },
                    void 0,
                    "Generate New Layout"
                  ),
                  c(
                    "button",
                    { onClick: this.onCompactTypeChange },
                    void 0,
                    "Change Compaction Type"
                  ),
                  p.default.createElement(
                    y,
                    s({}, this.props, {
                      layouts: this.state.layouts,
                      onBreakpointChange: this.onBreakpointChange,
                      onLayoutChange: this.onLayoutChange,
                      measureBeforeMount: !1,
                      useCSSTransforms: this.state.mounted,
                      compactType: this.state.compactType,
                      preventCollision: !this.state.compactType
                    }),
                    this.generateDOM()
                  )
                );
              }),
              e
            );
          })(p.default.Component);
        (d.defaultProps = {
          className: "layout",
          rowHeight: 30,
          onLayoutChange: function() {},
          cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
          initialLayout: i()
        }),
          (t.exports = d),
          o.c[o.s] === t && o(3)(t.exports);
      }.call(e, o(1)(t)));
    }
  },
  [21]
);
