webpackJsonp(
  [8],
  {
    52: function(t, o, e) {
      "use strict";
      (function(t) {
        function o(t) {
          return t && t.__esModule ? t : { default: t };
        }
        function n(t, o) {
          if (!(t instanceof o))
            throw new TypeError("Cannot call a class as a function");
        }
        function r(t, o) {
          if (!t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return !o || ("object" != typeof o && "function" != typeof o) ? t : o;
        }
        function a(t, o) {
          if ("function" != typeof o && null !== o)
            throw new TypeError(
              "Super expression must either be null or a function, not " +
                typeof o
            );
          (t.prototype = Object.create(o && o.prototype, {
            constructor: {
              value: t,
              enumerable: !1,
              writable: !0,
              configurable: !0
            }
          })),
            o &&
              (Object.setPrototypeOf
                ? Object.setPrototypeOf(t, o)
                : (t.__proto__ = o));
        }
        function i() {
          return f.default.map(f.default.range(0, 25), function(t, o) {
            var e = Math.ceil(4 * Math.random()) + 1;
            return {
              x: (2 * f.default.random(0, 5)) % 12,
              y: Math.floor(o / 6) * e,
              w: 2,
              h: e,
              i: o.toString(),
              static: Math.random() < 0.05
            };
          });
        }
        var s =
            Object.assign ||
            function(t) {
              for (var o = 1; o < arguments.length; o++) {
                var e = arguments[o];
                for (var n in e)
                  Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
              }
              return t;
            },
          u = (function() {
            var t =
              ("function" == typeof Symbol &&
                Symbol.for &&
                Symbol.for("react.element")) ||
              60103;
            return function(o, e, n, r) {
              var a = o && o.defaultProps,
                i = arguments.length - 3;
              if ((e || 0 === i || (e = {}), e && a))
                for (var s in a) void 0 === e[s] && (e[s] = a[s]);
              else e || (e = a || {});
              if (1 === i) e.children = r;
              else if (i > 1) {
                for (var u = Array(i), c = 0; c < i; c++)
                  u[c] = arguments[c + 3];
                e.children = u;
              }
              return {
                $$typeof: t,
                type: o,
                key: void 0 === n ? null : "" + n,
                ref: null,
                props: e,
                _owner: null
              };
            };
          })(),
          c = e(0),
          l = o(c),
          p = e(4),
          f = o(p),
          h = e(2),
          m = (0, h.WidthProvider)(h.Responsive),
          y = (function(t) {
            function o() {
              return n(this, o), r(this, t.apply(this, arguments));
            }
            return (
              a(o, t),
              (o.prototype.render = function() {
                return u(
                  "div",
                  {
                    className: "toolbox__items__item",
                    onClick: this.props.onTakeItem.bind(void 0, this.props.item)
                  },
                  void 0,
                  this.props.item.i
                );
              }),
              o
            );
          })(l.default.Component),
          d = (function(t) {
            function o() {
              return n(this, o), r(this, t.apply(this, arguments));
            }
            return (
              a(o, t),
              (o.prototype.render = function() {
                var t = this;
                return u(
                  "div",
                  { className: "toolbox" },
                  void 0,
                  u("span", { className: "toolbox__title" }, void 0, "Toolbox"),
                  u(
                    "div",
                    { className: "toolbox__items" },
                    void 0,
                    this.props.items.map(function(o) {
                      return u(
                        y,
                        { item: o, onTakeItem: t.props.onTakeItem },
                        o.i
                      );
                    })
                  )
                );
              }),
              o
            );
          })(l.default.Component),
          v = (function(t) {
            function o() {
              var e, a, u;
              n(this, o);
              for (var c = arguments.length, l = Array(c), p = 0; p < c; p++)
                l[p] = arguments[p];
              return (
                (e = a = r(this, t.call.apply(t, [this].concat(l)))),
                (a.state = {
                  currentBreakpoint: "lg",
                  compactType: "vertical",
                  mounted: !1,
                  layouts: { lg: a.props.initialLayout },
                  toolbox: { lg: [] }
                }),
                (a.onBreakpointChange = function(t) {
                  a.setState(function(o) {
                    var e;
                    return {
                      currentBreakpoint: t,
                      toolbox: s(
                        {},
                        o.toolbox,
                        ((e = {}),
                        (e[t] =
                          o.toolbox[t] || o.toolbox[o.currentBreakpoint] || []),
                        e)
                      )
                    };
                  });
                }),
                (a.onCompactTypeChange = function() {
                  var t = a.state.compactType,
                    o =
                      "horizontal" === t
                        ? "vertical"
                        : "vertical" === t ? null : "horizontal";
                  a.setState({ compactType: o });
                }),
                (a.onTakeItem = function(t) {
                  a.setState(function(o) {
                    var e, n;
                    return {
                      toolbox: s(
                        {},
                        o.toolbox,
                        ((e = {}),
                        (e[o.currentBreakpoint] = o.toolbox[
                          o.currentBreakpoint
                        ].filter(function(o) {
                          return o.i !== t.i;
                        })),
                        e)
                      ),
                      layouts: s(
                        {},
                        o.layouts,
                        ((n = {}),
                        (n[o.currentBreakpoint] = [].concat(
                          o.layouts[o.currentBreakpoint],
                          [t]
                        )),
                        n)
                      )
                    };
                  });
                }),
                (a.onPutItem = function(t) {
                  a.setState(function(o) {
                    var e, n;
                    return {
                      toolbox: s(
                        {},
                        o.toolbox,
                        ((e = {}),
                        (e[o.currentBreakpoint] = [].concat(
                          o.toolbox[o.currentBreakpoint] || [],
                          [t]
                        )),
                        e)
                      ),
                      layouts: s(
                        {},
                        o.layouts,
                        ((n = {}),
                        (n[o.currentBreakpoint] = o.layouts[
                          o.currentBreakpoint
                        ].filter(function(o) {
                          return o.i !== t.i;
                        })),
                        n)
                      )
                    };
                  });
                }),
                (a.onLayoutChange = function(t, o) {
                  a.props.onLayoutChange(t, o), a.setState({ layouts: o });
                }),
                (a.onNewLayout = function() {
                  a.setState({ layouts: { lg: i() } });
                }),
                (u = e),
                r(a, u)
              );
            }
            return (
              a(o, t),
              (o.prototype.componentDidMount = function() {
                this.setState({ mounted: !0 });
              }),
              (o.prototype.generateDOM = function() {
                var t = this;
                return f.default.map(
                  this.state.layouts[this.state.currentBreakpoint],
                  function(o) {
                    return u(
                      "div",
                      { className: o.static ? "static" : "" },
                      o.i,
                      u(
                        "div",
                        {
                          className: "hide-button",
                          onClick: t.onPutItem.bind(t, o)
                        },
                        void 0,
                        "×"
                      ),
                      o.static
                        ? u(
                            "span",
                            {
                              className: "text",
                              title:
                                "This item is static and cannot be removed or resized."
                            },
                            void 0,
                            "Static - ",
                            o.i
                          )
                        : u("span", { className: "text" }, void 0, o.i)
                    );
                  }
                );
              }),
              (o.prototype.render = function() {
                return u(
                  "div",
                  {},
                  void 0,
                  u(
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
                  u(
                    "div",
                    {},
                    void 0,
                    "Compaction type:",
                    " ",
                    f.default.capitalize(this.state.compactType) ||
                      "No Compaction"
                  ),
                  u(
                    "button",
                    { onClick: this.onNewLayout },
                    void 0,
                    "Generate New Layout"
                  ),
                  u(
                    "button",
                    { onClick: this.onCompactTypeChange },
                    void 0,
                    "Change Compaction Type"
                  ),
                  u(d, {
                    items:
                      this.state.toolbox[this.state.currentBreakpoint] || [],
                    onTakeItem: this.onTakeItem
                  }),
                  l.default.createElement(
                    m,
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
              o
            );
          })(l.default.Component);
        (v.defaultProps = {
          className: "layout",
          rowHeight: 30,
          onLayoutChange: function() {},
          cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
          initialLayout: i()
        }),
          (t.exports = v),
          e.c[e.s] === t && e(3)(t.exports);
      }.call(o, e(1)(t)));
    }
  },
  [52]
);
