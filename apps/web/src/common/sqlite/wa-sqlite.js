var Module = (() => {
  var _scriptName = import.meta.url;

  return function (moduleArg = {}) {
    var moduleRtn;

    var d = moduleArg,
      aa,
      ba,
      ca = new Promise((a, b) => {
        aa = a;
        ba = b;
      }),
      da = "object" == typeof window,
      ea = "undefined" != typeof WorkerGlobalScope,
      fa = Object.assign({}, d),
      ia = "./this.program",
      g = "",
      ja,
      ka;
    if (da || ea)
      ea
        ? (g = self.location.href)
        : "undefined" != typeof document &&
          document.currentScript &&
          (g = document.currentScript.src),
        _scriptName && (g = _scriptName),
        g.startsWith("blob:")
          ? (g = "")
          : (g = g.substr(0, g.replace(/[?#].*/, "").lastIndexOf("/") + 1)),
        ea &&
          (ka = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }),
        (ja = (a) =>
          fetch(a, { credentials: "same-origin" }).then((b) =>
            b.ok
              ? b.arrayBuffer()
              : Promise.reject(Error(b.status + " : " + b.url))
          ));
    var la = d.print || console.log.bind(console),
      r = d.printErr || console.error.bind(console);
    Object.assign(d, fa);
    fa = null;
    d.thisProgram && (ia = d.thisProgram);
    var ma = d.wasmBinary,
      na,
      oa = !1,
      pa,
      u,
      v,
      w,
      qa,
      x,
      z,
      ra,
      sa;
    function ta() {
      var a = na.buffer;
      d.HEAP8 = u = new Int8Array(a);
      d.HEAP16 = w = new Int16Array(a);
      d.HEAPU8 = v = new Uint8Array(a);
      d.HEAPU16 = qa = new Uint16Array(a);
      d.HEAP32 = x = new Int32Array(a);
      d.HEAPU32 = z = new Uint32Array(a);
      d.HEAPF32 = ra = new Float32Array(a);
      d.HEAPF64 = sa = new Float64Array(a);
    }
    var ua = [],
      va = [],
      wa = [],
      xa = [];
    function ya() {
      var a = d.preRun.shift();
      ua.unshift(a);
    }
    var B = 0,
      za = null,
      Aa = null;
    function C(a) {
      d.onAbort?.(a);
      a = "Aborted(" + a + ")";
      r(a);
      oa = !0;
      a = new WebAssembly.RuntimeError(
        a + ". Build with -sASSERTIONS for more info."
      );
      ba(a);
      throw a;
    }
    var Ba = (a) => a.startsWith("data:application/octet-stream;base64,"),
      Ca;
    function Da(a) {
      if (a == Ca && ma) return new Uint8Array(ma);
      if (ka) return ka(a);
      throw "both async and sync fetching of the wasm failed";
    }
    function Ea(a) {
      return ma
        ? Promise.resolve().then(() => Da(a))
        : ja(a).then(
            (b) => new Uint8Array(b),
            () => Da(a)
          );
    }
    function Fa(a, b, c) {
      return Ea(a)
        .then((e) => WebAssembly.instantiate(e, b))
        .then(c, (e) => {
          r(`failed to asynchronously prepare wasm: ${e}`);
          C(e);
        });
    }
    function Ga(a, b) {
      var c = Ca;
      return ma ||
        "function" != typeof WebAssembly.instantiateStreaming ||
        Ba(c) ||
        "function" != typeof fetch
        ? Fa(c, a, b)
        : fetch(c, { credentials: "same-origin" }).then((e) =>
            WebAssembly.instantiateStreaming(e, a).then(b, function (f) {
              r(`wasm streaming compile failed: ${f}`);
              r("falling back to ArrayBuffer instantiation");
              return Fa(c, a, b);
            })
          );
    }
    var D, F;
    class Ha {
      name = "ExitStatus";
      constructor(a) {
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
      }
    }
    var Ia = (a) => {
      for (; 0 < a.length; ) a.shift()(d);
    };
    function H(a, b = "i8") {
      b.endsWith("*") && (b = "*");
      switch (b) {
        case "i1":
          return u[a];
        case "i8":
          return u[a];
        case "i16":
          return w[a >> 1];
        case "i32":
          return x[a >> 2];
        case "i64":
          C("to do getValue(i64) use WASM_BIGINT");
        case "float":
          return ra[a >> 2];
        case "double":
          return sa[a >> 3];
        case "*":
          return z[a >> 2];
        default:
          C(`invalid type for getValue: ${b}`);
      }
    }
    var Ja = d.noExitRuntime || !0;
    function I(a, b, c = "i8") {
      c.endsWith("*") && (c = "*");
      switch (c) {
        case "i1":
          u[a] = b;
          break;
        case "i8":
          u[a] = b;
          break;
        case "i16":
          w[a >> 1] = b;
          break;
        case "i32":
          x[a >> 2] = b;
          break;
        case "i64":
          C("to do setValue(i64) use WASM_BIGINT");
        case "float":
          ra[a >> 2] = b;
          break;
        case "double":
          sa[a >> 3] = b;
          break;
        case "*":
          z[a >> 2] = b;
          break;
        default:
          C(`invalid type for setValue: ${c}`);
      }
    }
    var Ka = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0,
      J = (a, b = 0, c = NaN) => {
        var e = b + c;
        for (c = b; a[c] && !(c >= e); ) ++c;
        if (16 < c - b && a.buffer && Ka) return Ka.decode(a.subarray(b, c));
        for (e = ""; b < c; ) {
          var f = a[b++];
          if (f & 128) {
            var h = a[b++] & 63;
            if (192 == (f & 224)) e += String.fromCharCode(((f & 31) << 6) | h);
            else {
              var k = a[b++] & 63;
              f =
                224 == (f & 240)
                  ? ((f & 15) << 12) | (h << 6) | k
                  : ((f & 7) << 18) | (h << 12) | (k << 6) | (a[b++] & 63);
              65536 > f
                ? (e += String.fromCharCode(f))
                : ((f -= 65536),
                  (e += String.fromCharCode(
                    55296 | (f >> 10),
                    56320 | (f & 1023)
                  )));
            }
          } else e += String.fromCharCode(f);
        }
        return e;
      },
      La = (a, b) => {
        for (var c = 0, e = a.length - 1; 0 <= e; e--) {
          var f = a[e];
          "." === f
            ? a.splice(e, 1)
            : ".." === f
            ? (a.splice(e, 1), c++)
            : c && (a.splice(e, 1), c--);
        }
        if (b) for (; c; c--) a.unshift("..");
        return a;
      },
      Ma = (a) => {
        var b = "/" === a.charAt(0),
          c = "/" === a.substr(-1);
        (a = La(
          a.split("/").filter((e) => !!e),
          !b
        ).join("/")) ||
          b ||
          (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      },
      Na = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(a)
          .slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) return ".";
        b &&= b.substr(0, b.length - 1);
        return a + b;
      },
      Oa = (a) => {
        if ("/" === a) return "/";
        a = Ma(a);
        a = a.replace(/\/$/, "");
        var b = a.lastIndexOf("/");
        return -1 === b ? a : a.substr(b + 1);
      },
      Pa = () => {
        if (
          "object" == typeof crypto &&
          "function" == typeof crypto.getRandomValues
        )
          return (a) => crypto.getRandomValues(a);
        C("initRandomDevice");
      },
      Qa = (a) => (Qa = Pa())(a),
      Ra = (...a) => {
        for (var b = "", c = !1, e = a.length - 1; -1 <= e && !c; e--) {
          c = 0 <= e ? a[e] : "/";
          if ("string" != typeof c)
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!c) return "";
          b = c + "/" + b;
          c = "/" === c.charAt(0);
        }
        b = La(
          b.split("/").filter((f) => !!f),
          !c
        ).join("/");
        return (c ? "/" : "") + b || ".";
      },
      Sa = [],
      Ta = (a) => {
        for (var b = 0, c = 0; c < a.length; ++c) {
          var e = a.charCodeAt(c);
          127 >= e
            ? b++
            : 2047 >= e
            ? (b += 2)
            : 55296 <= e && 57343 >= e
            ? ((b += 4), ++c)
            : (b += 3);
        }
        return b;
      },
      K = (a, b, c, e) => {
        if (!(0 < e)) return 0;
        var f = c;
        e = c + e - 1;
        for (var h = 0; h < a.length; ++h) {
          var k = a.charCodeAt(h);
          if (55296 <= k && 57343 >= k) {
            var n = a.charCodeAt(++h);
            k = (65536 + ((k & 1023) << 10)) | (n & 1023);
          }
          if (127 >= k) {
            if (c >= e) break;
            b[c++] = k;
          } else {
            if (2047 >= k) {
              if (c + 1 >= e) break;
              b[c++] = 192 | (k >> 6);
            } else {
              if (65535 >= k) {
                if (c + 2 >= e) break;
                b[c++] = 224 | (k >> 12);
              } else {
                if (c + 3 >= e) break;
                b[c++] = 240 | (k >> 18);
                b[c++] = 128 | ((k >> 12) & 63);
              }
              b[c++] = 128 | ((k >> 6) & 63);
            }
            b[c++] = 128 | (k & 63);
          }
        }
        b[c] = 0;
        return c - f;
      };
    function Ua(a, b, c) {
      c = Array(0 < c ? c : Ta(a) + 1);
      a = K(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    var Va = [];
    function Wa(a, b) {
      Va[a] = { input: [], Pf: [], ag: b };
      Xa(a, Ya);
    }
    var Ya = {
        open(a) {
          var b = Va[a.node.dg];
          if (!b) throw new N(43);
          a.Qf = b;
          a.seekable = !1;
        },
        close(a) {
          a.Qf.ag.Yf(a.Qf);
        },
        Yf(a) {
          a.Qf.ag.Yf(a.Qf);
        },
        read(a, b, c, e) {
          if (!a.Qf || !a.Qf.ag.tg) throw new N(60);
          for (var f = 0, h = 0; h < e; h++) {
            try {
              var k = a.Qf.ag.tg(a.Qf);
            } catch (n) {
              throw new N(29);
            }
            if (void 0 === k && 0 === f) throw new N(6);
            if (null === k || void 0 === k) break;
            f++;
            b[c + h] = k;
          }
          f && (a.node.timestamp = Date.now());
          return f;
        },
        write(a, b, c, e) {
          if (!a.Qf || !a.Qf.ag.ng) throw new N(60);
          try {
            for (var f = 0; f < e; f++) a.Qf.ag.ng(a.Qf, b[c + f]);
          } catch (h) {
            throw new N(29);
          }
          e && (a.node.timestamp = Date.now());
          return f;
        }
      },
      Za = {
        tg() {
          a: {
            if (!Sa.length) {
              var a = null;
              "undefined" != typeof window &&
                "function" == typeof window.prompt &&
                ((a = window.prompt("Input: ")), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              Sa = Ua(a, !0);
            }
            a = Sa.shift();
          }
          return a;
        },
        ng(a, b) {
          null === b || 10 === b
            ? (la(J(a.Pf)), (a.Pf = []))
            : 0 != b && a.Pf.push(b);
        },
        Yf(a) {
          a.Pf && 0 < a.Pf.length && (la(J(a.Pf)), (a.Pf = []));
        },
        Ug() {
          return {
            Pg: 25856,
            Rg: 5,
            Og: 191,
            Qg: 35387,
            Ng: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
          };
        },
        Vg() {
          return 0;
        },
        Wg() {
          return [24, 80];
        }
      },
      $a = {
        ng(a, b) {
          null === b || 10 === b
            ? (r(J(a.Pf)), (a.Pf = []))
            : 0 != b && a.Pf.push(b);
        },
        Yf(a) {
          a.Pf && 0 < a.Pf.length && (r(J(a.Pf)), (a.Pf = []));
        }
      };
    function ab(a, b) {
      var c = a.Lf ? a.Lf.length : 0;
      c >= b ||
        ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
        0 != c && (b = Math.max(b, 256)),
        (c = a.Lf),
        (a.Lf = new Uint8Array(b)),
        0 < a.Nf && a.Lf.set(c.subarray(0, a.Nf), 0));
    }
    var O = {
        Sf: null,
        Tf() {
          return O.createNode(null, "/", 16895, 0);
        },
        createNode(a, b, c, e) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new N(63);
          O.Sf ||
            (O.Sf = {
              dir: {
                node: {
                  Rf: O.Jf.Rf,
                  Of: O.Jf.Of,
                  bg: O.Jf.bg,
                  gg: O.Jf.gg,
                  zg: O.Jf.zg,
                  lg: O.Jf.lg,
                  jg: O.Jf.jg,
                  yg: O.Jf.yg,
                  kg: O.Jf.kg
                },
                stream: { Xf: O.Kf.Xf }
              },
              file: {
                node: { Rf: O.Jf.Rf, Of: O.Jf.Of },
                stream: {
                  Xf: O.Kf.Xf,
                  read: O.Kf.read,
                  write: O.Kf.write,
                  qg: O.Kf.qg,
                  hg: O.Kf.hg,
                  ig: O.Kf.ig
                }
              },
              link: {
                node: { Rf: O.Jf.Rf, Of: O.Jf.Of, eg: O.Jf.eg },
                stream: {}
              },
              rg: { node: { Rf: O.Jf.Rf, Of: O.Jf.Of }, stream: bb }
            });
          c = cb(a, b, c, e);
          P(c.mode)
            ? ((c.Jf = O.Sf.dir.node), (c.Kf = O.Sf.dir.stream), (c.Lf = {}))
            : 32768 === (c.mode & 61440)
            ? ((c.Jf = O.Sf.file.node),
              (c.Kf = O.Sf.file.stream),
              (c.Nf = 0),
              (c.Lf = null))
            : 40960 === (c.mode & 61440)
            ? ((c.Jf = O.Sf.link.node), (c.Kf = O.Sf.link.stream))
            : 8192 === (c.mode & 61440) &&
              ((c.Jf = O.Sf.rg.node), (c.Kf = O.Sf.rg.stream));
          c.timestamp = Date.now();
          a && ((a.Lf[b] = c), (a.timestamp = c.timestamp));
          return c;
        },
        Tg(a) {
          return a.Lf
            ? a.Lf.subarray
              ? a.Lf.subarray(0, a.Nf)
              : new Uint8Array(a.Lf)
            : new Uint8Array(0);
        },
        Jf: {
          Rf(a) {
            var b = {};
            b.Fg = 8192 === (a.mode & 61440) ? a.id : 1;
            b.vg = a.id;
            b.mode = a.mode;
            b.Kg = 1;
            b.uid = 0;
            b.Hg = 0;
            b.dg = a.dg;
            P(a.mode)
              ? (b.size = 4096)
              : 32768 === (a.mode & 61440)
              ? (b.size = a.Nf)
              : 40960 === (a.mode & 61440)
              ? (b.size = a.link.length)
              : (b.size = 0);
            b.Bg = new Date(a.timestamp);
            b.Jg = new Date(a.timestamp);
            b.Eg = new Date(a.timestamp);
            b.Cg = 4096;
            b.Dg = Math.ceil(b.size / b.Cg);
            return b;
          },
          Of(a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            if (void 0 !== b.size && ((b = b.size), a.Nf != b))
              if (0 == b) (a.Lf = null), (a.Nf = 0);
              else {
                var c = a.Lf;
                a.Lf = new Uint8Array(b);
                c && a.Lf.set(c.subarray(0, Math.min(b, a.Nf)));
                a.Nf = b;
              }
          },
          bg() {
            throw db[44];
          },
          gg(a, b, c, e) {
            return O.createNode(a, b, c, e);
          },
          zg(a, b, c) {
            if (P(a.mode)) {
              try {
                var e = Q(b, c);
              } catch (h) {}
              if (e) for (var f in e.Lf) throw new N(55);
            }
            delete a.parent.Lf[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.Lf[c] = a;
            b.timestamp = a.parent.timestamp;
          },
          lg(a, b) {
            delete a.Lf[b];
            a.timestamp = Date.now();
          },
          jg(a, b) {
            var c = Q(a, b),
              e;
            for (e in c.Lf) throw new N(55);
            delete a.Lf[b];
            a.timestamp = Date.now();
          },
          yg(a) {
            var b = [".", ".."],
              c;
            for (c of Object.keys(a.Lf)) b.push(c);
            return b;
          },
          kg(a, b, c) {
            a = O.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          eg(a) {
            if (40960 !== (a.mode & 61440)) throw new N(28);
            return a.link;
          }
        },
        Kf: {
          read(a, b, c, e, f) {
            var h = a.node.Lf;
            if (f >= a.node.Nf) return 0;
            a = Math.min(a.node.Nf - f, e);
            if (8 < a && h.subarray) b.set(h.subarray(f, f + a), c);
            else for (e = 0; e < a; e++) b[c + e] = h[f + e];
            return a;
          },
          write(a, b, c, e, f, h) {
            b.buffer === u.buffer && (h = !1);
            if (!e) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Lf || a.Lf.subarray)) {
              if (h) return (a.Lf = b.subarray(c, c + e)), (a.Nf = e);
              if (0 === a.Nf && 0 === f)
                return (a.Lf = b.slice(c, c + e)), (a.Nf = e);
              if (f + e <= a.Nf) return a.Lf.set(b.subarray(c, c + e), f), e;
            }
            ab(a, f + e);
            if (a.Lf.subarray && b.subarray) a.Lf.set(b.subarray(c, c + e), f);
            else for (h = 0; h < e; h++) a.Lf[f + h] = b[c + h];
            a.Nf = Math.max(a.Nf, f + e);
            return e;
          },
          Xf(a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Nf);
            if (0 > b) throw new N(28);
            return b;
          },
          qg(a, b, c) {
            ab(a.node, b + c);
            a.node.Nf = Math.max(a.node.Nf, b + c);
          },
          hg(a, b, c, e, f) {
            if (32768 !== (a.node.mode & 61440)) throw new N(43);
            a = a.node.Lf;
            if (f & 2 || !a || a.buffer !== u.buffer) {
              f = !0;
              e = 65536 * Math.ceil(b / 65536);
              var h = eb(65536, e);
              h && v.fill(0, h, h + e);
              e = h;
              if (!e) throw new N(48);
              if (a) {
                if (0 < c || c + b < a.length)
                  a.subarray
                    ? (a = a.subarray(c, c + b))
                    : (a = Array.prototype.slice.call(a, c, c + b));
                u.set(a, e);
              }
            } else (f = !1), (e = a.byteOffset);
            return { Lg: e, Ag: f };
          },
          ig(a, b, c, e) {
            O.Kf.write(a, b, 0, e, c, !1);
            return 0;
          }
        }
      },
      fb = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      gb = null,
      hb = {},
      ib = [],
      jb = 1,
      R = null,
      kb = !1,
      lb = !0,
      N = class {
        name = "ErrnoError";
        constructor(a) {
          this.Mf = a;
        }
      },
      db = {},
      mb = {},
      nb = class {
        fg = {};
        node = null;
        get flags() {
          return this.fg.flags;
        }
        set flags(a) {
          this.fg.flags = a;
        }
        get position() {
          return this.fg.position;
        }
        set position(a) {
          this.fg.position = a;
        }
      },
      ob = class {
        Jf = {};
        Kf = {};
        Zf = null;
        constructor(a, b, c, e) {
          a ||= this;
          this.parent = a;
          this.Tf = a.Tf;
          this.id = jb++;
          this.name = b;
          this.mode = c;
          this.dg = e;
        }
        get read() {
          return 365 === (this.mode & 365);
        }
        set read(a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        }
        get write() {
          return 146 === (this.mode & 146);
        }
        set write(a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        }
      };
    function S(a, b = {}) {
      a = Ra(a);
      if (!a) return { path: "", node: null };
      b = Object.assign({ sg: !0, og: 0 }, b);
      if (8 < b.og) throw new N(32);
      a = a.split("/").filter((k) => !!k);
      for (var c = gb, e = "/", f = 0; f < a.length; f++) {
        var h = f === a.length - 1;
        if (h && b.parent) break;
        c = Q(c, a[f]);
        e = Ma(e + "/" + a[f]);
        c.Zf && (!h || (h && b.sg)) && (c = c.Zf.root);
        if (!h || b.Wf)
          for (h = 0; 40960 === (c.mode & 61440); )
            if (
              ((c = pb(e)),
              (e = Ra(Na(e), c)),
              (c = S(e, { og: b.og + 1 }).node),
              40 < h++)
            )
              throw new N(32);
      }
      return { path: e, node: c };
    }
    function qb(a) {
      for (var b; ; ) {
        if (a === a.parent)
          return (
            (a = a.Tf.xg),
            b ? ("/" !== a[a.length - 1] ? `${a}/${b}` : a + b) : a
          );
        b = b ? `${a.name}/${b}` : a.name;
        a = a.parent;
      }
    }
    function rb(a, b) {
      for (var c = 0, e = 0; e < b.length; e++)
        c = ((c << 5) - c + b.charCodeAt(e)) | 0;
      return ((a + c) >>> 0) % R.length;
    }
    function sb(a) {
      var b = rb(a.parent.id, a.name);
      if (R[b] === a) R[b] = a.$f;
      else
        for (b = R[b]; b; ) {
          if (b.$f === a) {
            b.$f = a.$f;
            break;
          }
          b = b.$f;
        }
    }
    function Q(a, b) {
      var c = P(a.mode) ? ((c = tb(a, "x")) ? c : a.Jf.bg ? 0 : 2) : 54;
      if (c) throw new N(c);
      for (c = R[rb(a.id, b)]; c; c = c.$f) {
        var e = c.name;
        if (c.parent.id === a.id && e === b) return c;
      }
      return a.Jf.bg(a, b);
    }
    function cb(a, b, c, e) {
      a = new ob(a, b, c, e);
      b = rb(a.parent.id, a.name);
      a.$f = R[b];
      return (R[b] = a);
    }
    function P(a) {
      return 16384 === (a & 61440);
    }
    function ub(a) {
      var b = ["r", "w", "rw"][a & 3];
      a & 512 && (b += "w");
      return b;
    }
    function tb(a, b) {
      if (lb) return 0;
      if (!b.includes("r") || a.mode & 292) {
        if (
          (b.includes("w") && !(a.mode & 146)) ||
          (b.includes("x") && !(a.mode & 73))
        )
          return 2;
      } else return 2;
      return 0;
    }
    function vb(a, b) {
      try {
        return Q(a, b), 20;
      } catch (c) {}
      return tb(a, "wx");
    }
    function wb(a, b, c) {
      try {
        var e = Q(a, b);
      } catch (f) {
        return f.Mf;
      }
      if ((a = tb(a, "wx"))) return a;
      if (c) {
        if (!P(e.mode)) return 54;
        if (e === e.parent || "/" === qb(e)) return 10;
      } else if (P(e.mode)) return 31;
      return 0;
    }
    function T(a) {
      a = ib[a];
      if (!a) throw new N(8);
      return a;
    }
    function xb(a, b = -1) {
      a = Object.assign(new nb(), a);
      if (-1 == b)
        a: {
          for (b = 0; 4096 >= b; b++) if (!ib[b]) break a;
          throw new N(33);
        }
      a.Uf = b;
      return (ib[b] = a);
    }
    function yb(a, b = -1) {
      a = xb(a, b);
      a.Kf?.Sg?.(a);
      return a;
    }
    var bb = {
      open(a) {
        a.Kf = hb[a.node.dg].Kf;
        a.Kf.open?.(a);
      },
      Xf() {
        throw new N(70);
      }
    };
    function Xa(a, b) {
      hb[a] = { Kf: b };
    }
    function zb(a, b) {
      var c = "/" === b;
      if (c && gb) throw new N(10);
      if (!c && b) {
        var e = S(b, { sg: !1 });
        b = e.path;
        e = e.node;
        if (e.Zf) throw new N(10);
        if (!P(e.mode)) throw new N(54);
      }
      b = { type: a, Xg: {}, xg: b, Ig: [] };
      a = a.Tf(b);
      a.Tf = b;
      b.root = a;
      c ? (gb = a) : e && ((e.Zf = b), e.Tf && e.Tf.Ig.push(b));
    }
    function Ab(a, b, c) {
      var e = S(a, { parent: !0 }).node;
      a = Oa(a);
      if (!a || "." === a || ".." === a) throw new N(28);
      var f = vb(e, a);
      if (f) throw new N(f);
      if (!e.Jf.gg) throw new N(63);
      return e.Jf.gg(e, a, b, c);
    }
    function U(a, b) {
      return Ab(a, ((void 0 !== b ? b : 511) & 1023) | 16384, 0);
    }
    function Bb(a, b, c) {
      "undefined" == typeof c && ((c = b), (b = 438));
      Ab(a, b | 8192, c);
    }
    function Cb(a, b) {
      if (!Ra(a)) throw new N(44);
      var c = S(b, { parent: !0 }).node;
      if (!c) throw new N(44);
      b = Oa(b);
      var e = vb(c, b);
      if (e) throw new N(e);
      if (!c.Jf.kg) throw new N(63);
      c.Jf.kg(c, b, a);
    }
    function Db(a) {
      var b = S(a, { parent: !0 }).node;
      a = Oa(a);
      var c = Q(b, a),
        e = wb(b, a, !0);
      if (e) throw new N(e);
      if (!b.Jf.jg) throw new N(63);
      if (c.Zf) throw new N(10);
      b.Jf.jg(b, a);
      sb(c);
    }
    function pb(a) {
      a = S(a).node;
      if (!a) throw new N(44);
      if (!a.Jf.eg) throw new N(28);
      return Ra(qb(a.parent), a.Jf.eg(a));
    }
    function Eb(a, b) {
      a = S(a, { Wf: !b }).node;
      if (!a) throw new N(44);
      if (!a.Jf.Rf) throw new N(63);
      return a.Jf.Rf(a);
    }
    function Fb(a) {
      return Eb(a, !0);
    }
    function Gb(a, b) {
      a = "string" == typeof a ? S(a, { Wf: !0 }).node : a;
      if (!a.Jf.Of) throw new N(63);
      a.Jf.Of(a, {
        mode: (b & 4095) | (a.mode & -4096),
        timestamp: Date.now()
      });
    }
    function Hb(a, b) {
      if (0 > b) throw new N(28);
      a = "string" == typeof a ? S(a, { Wf: !0 }).node : a;
      if (!a.Jf.Of) throw new N(63);
      if (P(a.mode)) throw new N(31);
      if (32768 !== (a.mode & 61440)) throw new N(28);
      var c = tb(a, "w");
      if (c) throw new N(c);
      a.Jf.Of(a, { size: b, timestamp: Date.now() });
    }
    function Ib(a, b, c) {
      if ("" === a) throw new N(44);
      if ("string" == typeof b) {
        var e = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
        if ("undefined" == typeof e)
          throw Error(`Unknown file open mode: ${b}`);
        b = e;
      }
      c = b & 64 ? (("undefined" == typeof c ? 438 : c) & 4095) | 32768 : 0;
      if ("object" == typeof a) var f = a;
      else {
        a = Ma(a);
        try {
          f = S(a, { Wf: !(b & 131072) }).node;
        } catch (h) {}
      }
      e = !1;
      if (b & 64)
        if (f) {
          if (b & 128) throw new N(20);
        } else (f = Ab(a, c, 0)), (e = !0);
      if (!f) throw new N(44);
      8192 === (f.mode & 61440) && (b &= -513);
      if (b & 65536 && !P(f.mode)) throw new N(54);
      if (
        !e &&
        (c = f
          ? 40960 === (f.mode & 61440)
            ? 32
            : P(f.mode) && ("r" !== ub(b) || b & 512)
            ? 31
            : tb(f, ub(b))
          : 44)
      )
        throw new N(c);
      b & 512 && !e && Hb(f, 0);
      b &= -131713;
      f = xb({
        node: f,
        path: qb(f),
        flags: b,
        seekable: !0,
        position: 0,
        Kf: f.Kf,
        Mg: [],
        error: !1
      });
      f.Kf.open && f.Kf.open(f);
      !d.logReadFiles || b & 1 || a in mb || (mb[a] = 1);
      return f;
    }
    function Jb(a, b, c) {
      if (null === a.Uf) throw new N(8);
      if (!a.seekable || !a.Kf.Xf) throw new N(70);
      if (0 != c && 1 != c && 2 != c) throw new N(28);
      a.position = a.Kf.Xf(a, b, c);
      a.Mg = [];
    }
    function V(a, b, c) {
      a = Ma("/dev/" + a);
      var e = fb(!!b, !!c);
      V.wg ?? (V.wg = 64);
      var f = (V.wg++ << 8) | 0;
      Xa(f, {
        open(h) {
          h.seekable = !1;
        },
        close() {
          c?.buffer?.length && c(10);
        },
        read(h, k, n, m) {
          for (var l = 0, p = 0; p < m; p++) {
            try {
              var q = b();
            } catch (t) {
              throw new N(29);
            }
            if (void 0 === q && 0 === l) throw new N(6);
            if (null === q || void 0 === q) break;
            l++;
            k[n + p] = q;
          }
          l && (h.node.timestamp = Date.now());
          return l;
        },
        write(h, k, n, m) {
          for (var l = 0; l < m; l++)
            try {
              c(k[n + l]);
            } catch (p) {
              throw new N(29);
            }
          m && (h.node.timestamp = Date.now());
          return l;
        }
      });
      Bb(a, e, f);
    }
    var X = {};
    function Kb(a, b, c) {
      if ("/" === b.charAt(0)) return b;
      a = -100 === a ? "/" : T(a).path;
      if (0 == b.length) {
        if (!c) throw new N(44);
        return a;
      }
      return Ma(a + "/" + b);
    }
    function Lb(a, b, c) {
      a = a(b);
      x[c >> 2] = a.Fg;
      x[(c + 4) >> 2] = a.mode;
      z[(c + 8) >> 2] = a.Kg;
      x[(c + 12) >> 2] = a.uid;
      x[(c + 16) >> 2] = a.Hg;
      x[(c + 20) >> 2] = a.dg;
      F = [
        a.size >>> 0,
        ((D = a.size),
        1 <= +Math.abs(D)
          ? 0 < D
            ? +Math.floor(D / 4294967296) >>> 0
            : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 24) >> 2] = F[0];
      x[(c + 28) >> 2] = F[1];
      x[(c + 32) >> 2] = 4096;
      x[(c + 36) >> 2] = a.Dg;
      b = a.Bg.getTime();
      var e = a.Jg.getTime(),
        f = a.Eg.getTime();
      F = [
        Math.floor(b / 1e3) >>> 0,
        ((D = Math.floor(b / 1e3)),
        1 <= +Math.abs(D)
          ? 0 < D
            ? +Math.floor(D / 4294967296) >>> 0
            : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 40) >> 2] = F[0];
      x[(c + 44) >> 2] = F[1];
      z[(c + 48) >> 2] = (b % 1e3) * 1e6;
      F = [
        Math.floor(e / 1e3) >>> 0,
        ((D = Math.floor(e / 1e3)),
        1 <= +Math.abs(D)
          ? 0 < D
            ? +Math.floor(D / 4294967296) >>> 0
            : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 56) >> 2] = F[0];
      x[(c + 60) >> 2] = F[1];
      z[(c + 64) >> 2] = (e % 1e3) * 1e6;
      F = [
        Math.floor(f / 1e3) >>> 0,
        ((D = Math.floor(f / 1e3)),
        1 <= +Math.abs(D)
          ? 0 < D
            ? +Math.floor(D / 4294967296) >>> 0
            : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 72) >> 2] = F[0];
      x[(c + 76) >> 2] = F[1];
      z[(c + 80) >> 2] = (f % 1e3) * 1e6;
      F = [
        a.vg >>> 0,
        ((D = a.vg),
        1 <= +Math.abs(D)
          ? 0 < D
            ? +Math.floor(D / 4294967296) >>> 0
            : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 88) >> 2] = F[0];
      x[(c + 92) >> 2] = F[1];
      return 0;
    }
    var Mb = void 0,
      Nb = () => {
        var a = x[+Mb >> 2];
        Mb += 4;
        return a;
      },
      Ob = (a, b) =>
        (b + 2097152) >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN,
      Pb = 0,
      Qb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
      Rb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
      Sb = {},
      Tb = (a) => {
        if (!(a instanceof Ha || "unwind" == a)) throw a;
      },
      Ub = (a) => {
        pa = a;
        Ja || 0 < Pb || (d.onExit?.(a), (oa = !0));
        throw new Ha(a);
      },
      Vb = (a) => {
        if (!oa)
          try {
            if ((a(), !(Ja || 0 < Pb)))
              try {
                (pa = a = pa), Ub(a);
              } catch (b) {
                Tb(b);
              }
          } catch (b) {
            Tb(b);
          }
      },
      Wb = {},
      Yb = () => {
        if (!Xb) {
          var a = {
              USER: "web_user",
              LOGNAME: "web_user",
              PATH: "/",
              PWD: "/",
              HOME: "/home/web_user",
              LANG:
                (
                  ("object" == typeof navigator &&
                    navigator.languages &&
                    navigator.languages[0]) ||
                  "C"
                ).replace("-", "_") + ".UTF-8",
              _: ia || "./this.program"
            },
            b;
          for (b in Wb) void 0 === Wb[b] ? delete a[b] : (a[b] = Wb[b]);
          var c = [];
          for (b in a) c.push(`${b}=${a[b]}`);
          Xb = c;
        }
        return Xb;
      },
      Xb;
    function Zb() {}
    function $b() {}
    function ac() {}
    function bc() {}
    function cc() {}
    function dc() {}
    function ec() {}
    function fc() {}
    function gc() {}
    function hc() {}
    function ic() {}
    function jc() {}
    function kc() {}
    function lc() {}
    function mc() {}
    function nc() {}
    function oc() {}
    function pc() {}
    function qc() {}
    function rc() {}
    function sc() {}
    function tc() {}
    function uc() {}
    function vc() {}
    function wc() {}
    function xc() {}
    function yc() {}
    function zc() {}
    function Ac() {}
    function Bc() {}
    function Cc() {}
    function Dc() {}
    function Ec() {}
    function Fc() {}
    function Gc() {}
    function Hc() {}
    function Ic() {}
    function Jc() {}
    function Kc() {}
    var Lc,
      Mc,
      Nc = [],
      Y = (a, b, c, e) => {
        var f = {
          string: (l) => {
            var p = 0;
            if (null !== l && void 0 !== l && 0 !== l) {
              p = Ta(l) + 1;
              var q = Oc(p);
              K(l, v, q, p);
              p = q;
            }
            return p;
          },
          array: (l) => {
            var p = Oc(l.length);
            u.set(l, p);
            return p;
          }
        };
        a = d["_" + a];
        var h = [],
          k = 0;
        if (e)
          for (var n = 0; n < e.length; n++) {
            var m = f[c[n]];
            m ? (0 === k && (k = Pc()), (h[n] = m(e[n]))) : (h[n] = e[n]);
          }
        c = a(...h);
        return (c = (function (l) {
          0 !== k && Qc(k);
          return "string" === b
            ? l
              ? J(v, l)
              : ""
            : "boolean" === b
            ? !!l
            : l;
        })(c));
      },
      Rc =
        "undefined" != typeof TextDecoder
          ? new TextDecoder("utf-16le")
          : void 0;
    [44].forEach((a) => {
      db[a] = new N(a);
      db[a].stack = "<generic error, no stack>";
    });
    R = Array(4096);
    zb(O, "/");
    U("/tmp");
    U("/home");
    U("/home/web_user");
    (function () {
      U("/dev");
      Xa(259, { read: () => 0, write: (e, f, h, k) => k });
      Bb("/dev/null", 259);
      Wa(1280, Za);
      Wa(1536, $a);
      Bb("/dev/tty", 1280);
      Bb("/dev/tty1", 1536);
      var a = new Uint8Array(1024),
        b = 0,
        c = () => {
          0 === b && (b = Qa(a).byteLength);
          return a[--b];
        };
      V("random", c);
      V("urandom", c);
      U("/dev/shm");
      U("/dev/shm/tmp");
    })();
    (function () {
      U("/proc");
      var a = U("/proc/self");
      U("/proc/self/fd");
      zb(
        {
          Tf() {
            var b = cb(a, "fd", 16895, 73);
            b.Jf = {
              bg(c, e) {
                var f = T(+e);
                c = {
                  parent: null,
                  Tf: { xg: "fake" },
                  Jf: { eg: () => f.path }
                };
                return (c.parent = c);
              }
            };
            return b;
          }
        },
        "/proc/self/fd"
      );
    })();
    (function () {
      const a = new Map();
      d.setAuthorizer = function (b, c, e) {
        c ? a.set(b, { f: c, pg: e }) : a.delete(b);
        return Y("set_authorizer", "number", ["number"], [b]);
      };
      Zb = function (b, c, e, f, h, k) {
        if (a.has(b)) {
          const { f: n, pg: m } = a.get(b);
          return n(
            m,
            c,
            e ? (e ? J(v, e) : "") : null,
            f ? (f ? J(v, f) : "") : null,
            h ? (h ? J(v, h) : "") : null,
            k ? (k ? J(v, k) : "") : null
          );
        }
        return 0;
      };
    })();
    (function () {
      const a = new Map(),
        b = new Map();
      d.createFunction = function (c, e, f, h, k, n) {
        const m = a.size;
        a.set(m, { f: n, Vf: k });
        return Y(
          "create_function",
          "number",
          "number string number number number number".split(" "),
          [c, e, f, h, m, 0]
        );
      };
      d.createAggregate = function (c, e, f, h, k, n, m) {
        const l = a.size;
        a.set(l, { step: n, Gg: m, Vf: k });
        return Y(
          "create_function",
          "number",
          "number string number number number number".split(" "),
          [c, e, f, h, l, 1]
        );
      };
      d.getFunctionUserData = function (c) {
        return b.get(c);
      };
      ac = function (c, e, f, h) {
        c = a.get(c);
        b.set(e, c.Vf);
        c.f(e, new Uint32Array(v.buffer, h, f));
        b.delete(e);
      };
      cc = function (c, e, f, h) {
        c = a.get(c);
        b.set(e, c.Vf);
        c.step(e, new Uint32Array(v.buffer, h, f));
        b.delete(e);
      };
      $b = function (c, e) {
        c = a.get(c);
        b.set(e, c.Vf);
        c.Gg(e);
        b.delete(e);
      };
    })();
    (function () {
      const a = new Map();
      d.progressHandler = function (b, c, e, f) {
        e ? a.set(b, { f: e, pg: f }) : a.delete(b);
        return Y("progress_handler", null, ["number", "number"], [b, c]);
      };
      bc = function (b) {
        if (a.has(b)) {
          const { f: c, pg: e } = a.get(b);
          return c(e);
        }
        return 0;
      };
    })();
    (function () {
      function a(m, l) {
        const p = `get${m}`,
          q = `set${m}`;
        return new Proxy(new DataView(v.buffer, l, "Int32" === m ? 4 : 8), {
          get(t, y) {
            if (y === p)
              return function (A, G) {
                if (!G) throw Error("must be little endian");
                return t[y](A, G);
              };
            if (y === q)
              return function (A, G, E) {
                if (!E) throw Error("must be little endian");
                return t[y](A, G, E);
              };
            if ("string" === typeof y && y.match(/^(get)|(set)/))
              throw Error("invalid type");
            return t[y];
          }
        });
      }
      const b = "object" === typeof Asyncify,
        c = new Map(),
        e = new Map(),
        f = new Map(),
        h = b ? new Set() : null,
        k = b ? new Set() : null,
        n = new Map();
      tc = function (m, l, p, q) {
        n.set(m ? J(v, m) : "", {
          size: l,
          cg: Array.from(new Uint32Array(v.buffer, q, p))
        });
      };
      d.createModule = function (m, l, p, q) {
        b && (p.handleAsync = Asyncify.ug);
        const t = c.size;
        c.set(t, { module: p, Vf: q });
        q = 0;
        p.xCreate && (q |= 1);
        p.xConnect && (q |= 2);
        p.xBestIndex && (q |= 4);
        p.xDisconnect && (q |= 8);
        p.xDestroy && (q |= 16);
        p.xOpen && (q |= 32);
        p.xClose && (q |= 64);
        p.xFilter && (q |= 128);
        p.xNext && (q |= 256);
        p.xEof && (q |= 512);
        p.xColumn && (q |= 1024);
        p.xRowid && (q |= 2048);
        p.xUpdate && (q |= 4096);
        p.xBegin && (q |= 8192);
        p.xSync && (q |= 16384);
        p.xCommit && (q |= 32768);
        p.xRollback && (q |= 65536);
        p.xFindFunction && (q |= 131072);
        p.xRename && (q |= 262144);
        return Y(
          "create_module",
          "number",
          ["number", "string", "number", "number"],
          [m, l, t, q]
        );
      };
      jc = function (m, l, p, q, t, y) {
        l = c.get(l);
        e.set(t, l);
        if (b) {
          h.delete(t);
          for (const A of h) e.delete(A);
        }
        q = Array.from(new Uint32Array(v.buffer, q, p)).map((A) =>
          A ? J(v, A) : ""
        );
        return l.module.xCreate(m, l.Vf, q, t, a("Int32", y));
      };
      ic = function (m, l, p, q, t, y) {
        l = c.get(l);
        e.set(t, l);
        if (b) {
          h.delete(t);
          for (const A of h) e.delete(A);
        }
        q = Array.from(new Uint32Array(v.buffer, q, p)).map((A) =>
          A ? J(v, A) : ""
        );
        return l.module.xConnect(m, l.Vf, q, t, a("Int32", y));
      };
      ec = function (m, l) {
        var p = e.get(m),
          q = n.get("sqlite3_index_info").cg;
        const t = {};
        t.nConstraint = H(l + q[0], "i32");
        t.aConstraint = [];
        var y = H(l + q[1], "*"),
          A = n.get("sqlite3_index_constraint").size;
        for (var G = 0; G < t.nConstraint; ++G) {
          var E = t.aConstraint,
            M = E.push,
            L = y + G * A,
            ha = n.get("sqlite3_index_constraint").cg,
            W = {};
          W.iColumn = H(L + ha[0], "i32");
          W.op = H(L + ha[1], "i8");
          W.usable = !!H(L + ha[2], "i8");
          M.call(E, W);
        }
        t.nOrderBy = H(l + q[2], "i32");
        t.aOrderBy = [];
        y = H(l + q[3], "*");
        A = n.get("sqlite3_index_orderby").size;
        for (G = 0; G < t.nOrderBy; ++G)
          (E = t.aOrderBy),
            (M = E.push),
            (L = y + G * A),
            (ha = n.get("sqlite3_index_orderby").cg),
            (W = {}),
            (W.iColumn = H(L + ha[0], "i32")),
            (W.desc = !!H(L + ha[1], "i8")),
            M.call(E, W);
        t.aConstraintUsage = [];
        for (y = 0; y < t.nConstraint; ++y)
          t.aConstraintUsage.push({ argvIndex: 0, omit: !1 });
        t.idxNum = H(l + q[5], "i32");
        t.idxStr = null;
        t.orderByConsumed = !!H(l + q[8], "i8");
        t.estimatedCost = H(l + q[9], "double");
        t.estimatedRows = H(l + q[10], "i32");
        t.idxFlags = H(l + q[11], "i32");
        t.colUsed = H(l + q[12], "i32");
        m = p.module.xBestIndex(m, t);
        p = n.get("sqlite3_index_info").cg;
        q = H(l + p[4], "*");
        y = n.get("sqlite3_index_constraint_usage").size;
        for (M = 0; M < t.nConstraint; ++M)
          (A = q + M * y),
            (E = t.aConstraintUsage[M]),
            (L = n.get("sqlite3_index_constraint_usage").cg),
            I(A + L[0], E.argvIndex, "i32"),
            I(A + L[1], E.omit ? 1 : 0, "i8");
        I(l + p[5], t.idxNum, "i32");
        "string" === typeof t.idxStr &&
          ((q = Ta(t.idxStr)),
          (y = Y("sqlite3_malloc", "number", ["number"], [q + 1])),
          K(t.idxStr, v, y, q + 1),
          I(l + p[6], y, "*"),
          I(l + p[7], 1, "i32"));
        I(l + p[8], t.orderByConsumed, "i32");
        I(l + p[9], t.estimatedCost, "double");
        I(l + p[10], t.estimatedRows, "i32");
        I(l + p[11], t.idxFlags, "i32");
        return m;
      };
      lc = function (m) {
        const l = e.get(m);
        b ? h.add(m) : e.delete(m);
        return l.module.xDisconnect(m);
      };
      kc = function (m) {
        const l = e.get(m);
        b ? h.add(m) : e.delete(m);
        return l.module.xDestroy(m);
      };
      pc = function (m, l) {
        const p = e.get(m);
        f.set(l, p);
        if (b) {
          k.delete(l);
          for (const q of k) f.delete(q);
        }
        return p.module.xOpen(m, l);
      };
      fc = function (m) {
        const l = f.get(m);
        b ? k.add(m) : f.delete(m);
        return l.module.xClose(m);
      };
      mc = function (m) {
        return f.get(m).module.xEof(m) ? 1 : 0;
      };
      nc = function (m, l, p, q, t) {
        const y = f.get(m);
        p = p ? (p ? J(v, p) : "") : null;
        t = new Uint32Array(v.buffer, t, q);
        return y.module.xFilter(m, l, p, t);
      };
      oc = function (m) {
        return f.get(m).module.xNext(m);
      };
      gc = function (m, l, p) {
        return f.get(m).module.xColumn(m, l, p);
      };
      sc = function (m, l) {
        return f.get(m).module.xRowid(m, a("BigInt64", l));
      };
      vc = function (m, l, p, q) {
        const t = e.get(m);
        p = new Uint32Array(v.buffer, p, l);
        return t.module.xUpdate(m, p, a("BigInt64", q));
      };
      dc = function (m) {
        return e.get(m).module.xBegin(m);
      };
      uc = function (m) {
        return e.get(m).module.xSync(m);
      };
      hc = function (m) {
        return e.get(m).module.xCommit(m);
      };
      rc = function (m) {
        return e.get(m).module.xRollback(m);
      };
      qc = function (m, l) {
        const p = e.get(m);
        l = l ? J(v, l) : "";
        return p.module.xRename(m, l);
      };
    })();
    (function () {
      function a(h, k) {
        const n = `get${h}`,
          m = `set${h}`;
        return new Proxy(new DataView(v.buffer, k, "Int32" === h ? 4 : 8), {
          get(l, p) {
            if (p === n)
              return function (q, t) {
                if (!t) throw Error("must be little endian");
                return l[p](q, t);
              };
            if (p === m)
              return function (q, t, y) {
                if (!y) throw Error("must be little endian");
                return l[p](q, t, y);
              };
            if ("string" === typeof p && p.match(/^(get)|(set)/))
              throw Error("invalid type");
            return l[p];
          }
        });
      }
      const b = "object" === typeof Asyncify;
      b && (d.handleAsync = Asyncify.ug);
      const c = new Map(),
        e = new Map();
      d.registerVFS = function (h, k) {
        if (Y("sqlite3_vfs_find", "number", ["string"], [h.name]))
          throw Error(`VFS '${h.name}' already registered`);
        b && (h.handleAsync = Asyncify.ug);
        var n = h.mxPathName ?? 64;
        const m = d._malloc(4);
        k = Y(
          "register_vfs",
          "number",
          ["string", "number", "number", "number"],
          [h.name, n, k ? 1 : 0, m]
        );
        k || ((n = H(m, "*")), c.set(n, h));
        d._free(m);
        return k;
      };
      const f = b ? new Set() : null;
      yc = function (h) {
        const k = e.get(h);
        b ? f.add(h) : e.delete(h);
        return k.xClose(h);
      };
      Fc = function (h, k, n, m, l) {
        return e
          .get(h)
          .xRead(
            h,
            v.subarray(k, k + n),
            4294967296 * l + m + (0 > m ? 2 ** 32 : 0)
          );
      };
      Kc = function (h, k, n, m, l) {
        return e
          .get(h)
          .xWrite(
            h,
            v.subarray(k, k + n),
            4294967296 * l + m + (0 > m ? 2 ** 32 : 0)
          );
      };
      Ic = function (h, k, n) {
        return e
          .get(h)
          .xTruncate(h, 4294967296 * n + k + (0 > k ? 2 ** 32 : 0));
      };
      Hc = function (h, k) {
        return e.get(h).xSync(h, k);
      };
      Cc = function (h, k) {
        const n = e.get(h);
        k = a("BigInt64", k);
        return n.xFileSize(h, k);
      };
      Dc = function (h, k) {
        return e.get(h).xLock(h, k);
      };
      Jc = function (h, k) {
        return e.get(h).xUnlock(h, k);
      };
      xc = function (h, k) {
        const n = e.get(h);
        k = a("Int32", k);
        return n.xCheckReservedLock(h, k);
      };
      Bc = function (h, k, n) {
        const m = e.get(h);
        n = new DataView(v.buffer, n);
        return m.xFileControl(h, k, n);
      };
      Gc = function (h) {
        return e.get(h).xSectorSize(h);
      };
      Ac = function (h) {
        return e.get(h).xDeviceCharacteristics(h);
      };
      Ec = function (h, k, n, m, l) {
        h = c.get(h);
        e.set(n, h);
        if (b) {
          f.delete(n);
          for (var p of f) e.delete(p);
        }
        p = null;
        if (m & 64) {
          p = 1;
          const q = [];
          for (; p; ) {
            const t = v[k++];
            if (t) q.push(t);
            else
              switch ((v[k] || (p = null), p)) {
                case 1:
                  q.push(63);
                  p = 2;
                  break;
                case 2:
                  q.push(61);
                  p = 3;
                  break;
                case 3:
                  q.push(38), (p = 2);
              }
          }
          p = new TextDecoder().decode(new Uint8Array(q));
        } else k && (p = k ? J(v, k) : "");
        l = a("Int32", l);
        return h.xOpen(p, n, m, l);
      };
      zc = function (h, k, n) {
        return c.get(h).xDelete(k ? J(v, k) : "", n);
      };
      wc = function (h, k, n, m) {
        h = c.get(h);
        m = a("Int32", m);
        return h.xAccess(k ? J(v, k) : "", n, m);
      };
    })();
    var Tc = {
        a: (a, b, c, e) => {
          C(
            `Assertion failed: ${a ? J(v, a) : ""}, at: ` +
              [
                b ? (b ? J(v, b) : "") : "unknown filename",
                c,
                e ? (e ? J(v, e) : "") : "unknown function"
              ]
          );
        },
        R: function (a, b) {
          try {
            return (a = a ? J(v, a) : ""), Gb(a, b), 0;
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return -c.Mf;
          }
        },
        U: function (a, b, c) {
          try {
            b = b ? J(v, b) : "";
            b = Kb(a, b);
            if (c & -8) return -28;
            var e = S(b, { Wf: !0 }).node;
            if (!e) return -44;
            a = "";
            c & 4 && (a += "r");
            c & 2 && (a += "w");
            c & 1 && (a += "x");
            return a && tb(e, a) ? -2 : 0;
          } catch (f) {
            if ("undefined" == typeof X || "ErrnoError" !== f.name) throw f;
            return -f.Mf;
          }
        },
        S: function (a, b) {
          try {
            var c = T(a);
            Gb(c.node, b);
            return 0;
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return -e.Mf;
          }
        },
        Q: function (a) {
          try {
            var b = T(a).node;
            var c = "string" == typeof b ? S(b, { Wf: !0 }).node : b;
            if (!c.Jf.Of) throw new N(63);
            c.Jf.Of(c, { timestamp: Date.now() });
            return 0;
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return -e.Mf;
          }
        },
        b: function (a, b, c) {
          Mb = c;
          try {
            var e = T(a);
            switch (b) {
              case 0:
                var f = Nb();
                if (0 > f) break;
                for (; ib[f]; ) f++;
                return yb(e, f).Uf;
              case 1:
              case 2:
                return 0;
              case 3:
                return e.flags;
              case 4:
                return (f = Nb()), (e.flags |= f), 0;
              case 12:
                return (f = Nb()), (w[(f + 0) >> 1] = 2), 0;
              case 13:
              case 14:
                return 0;
            }
            return -28;
          } catch (h) {
            if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
            return -h.Mf;
          }
        },
        P: function (a, b) {
          try {
            var c = T(a);
            return Lb(Eb, c.path, b);
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return -e.Mf;
          }
        },
        m: function (a, b, c) {
          b = Ob(b, c);
          try {
            if (isNaN(b)) return 61;
            var e = T(a);
            if (0 === (e.flags & 2097155)) throw new N(28);
            Hb(e.node, b);
            return 0;
          } catch (f) {
            if ("undefined" == typeof X || "ErrnoError" !== f.name) throw f;
            return -f.Mf;
          }
        },
        J: function (a, b) {
          try {
            if (0 === b) return -28;
            var c = Ta("/") + 1;
            if (b < c) return -68;
            K("/", v, a, b);
            return c;
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return -e.Mf;
          }
        },
        N: function (a, b) {
          try {
            return (a = a ? J(v, a) : ""), Lb(Fb, a, b);
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return -c.Mf;
          }
        },
        F: function (a, b, c) {
          try {
            return (
              (b = b ? J(v, b) : ""),
              (b = Kb(a, b)),
              (b = Ma(b)),
              "/" === b[b.length - 1] && (b = b.substr(0, b.length - 1)),
              U(b, c),
              0
            );
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return -e.Mf;
          }
        },
        M: function (a, b, c, e) {
          try {
            b = b ? J(v, b) : "";
            var f = e & 256;
            b = Kb(a, b, e & 4096);
            return Lb(f ? Fb : Eb, b, c);
          } catch (h) {
            if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
            return -h.Mf;
          }
        },
        D: function (a, b, c, e) {
          Mb = e;
          try {
            b = b ? J(v, b) : "";
            b = Kb(a, b);
            var f = e ? Nb() : 0;
            return Ib(b, c, f).Uf;
          } catch (h) {
            if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
            return -h.Mf;
          }
        },
        B: function (a, b, c, e) {
          try {
            b = b ? J(v, b) : "";
            b = Kb(a, b);
            if (0 >= e) return -28;
            var f = pb(b),
              h = Math.min(e, Ta(f)),
              k = u[c + h];
            K(f, v, c, e + 1);
            u[c + h] = k;
            return h;
          } catch (n) {
            if ("undefined" == typeof X || "ErrnoError" !== n.name) throw n;
            return -n.Mf;
          }
        },
        z: function (a) {
          try {
            return (a = a ? J(v, a) : ""), Db(a), 0;
          } catch (b) {
            if ("undefined" == typeof X || "ErrnoError" !== b.name) throw b;
            return -b.Mf;
          }
        },
        O: function (a, b) {
          try {
            return (a = a ? J(v, a) : ""), Lb(Eb, a, b);
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return -c.Mf;
          }
        },
        x: function (a, b, c) {
          try {
            b = b ? J(v, b) : "";
            b = Kb(a, b);
            if (0 === c) {
              a = b;
              var e = S(a, { parent: !0 }).node;
              if (!e) throw new N(44);
              var f = Oa(a),
                h = Q(e, f),
                k = wb(e, f, !1);
              if (k) throw new N(k);
              if (!e.Jf.lg) throw new N(63);
              if (h.Zf) throw new N(10);
              e.Jf.lg(e, f);
              sb(h);
            } else 512 === c ? Db(b) : C("Invalid flags passed to unlinkat");
            return 0;
          } catch (n) {
            if ("undefined" == typeof X || "ErrnoError" !== n.name) throw n;
            return -n.Mf;
          }
        },
        w: function (a, b, c) {
          try {
            b = b ? J(v, b) : "";
            b = Kb(a, b, !0);
            var e = Date.now();
            if (c) {
              var f = z[c >> 2] + 4294967296 * x[(c + 4) >> 2],
                h = x[(c + 8) >> 2];
              var k =
                1073741823 == h ? e : 1073741822 == h ? -1 : 1e3 * f + h / 1e6;
              c += 16;
              f = z[c >> 2] + 4294967296 * x[(c + 4) >> 2];
              h = x[(c + 8) >> 2];
              var n =
                1073741823 == h ? e : 1073741822 == h ? -1 : 1e3 * f + h / 1e6;
            } else n = k = e;
            if (-1 != n || -1 != k) {
              a = k;
              var m = S(b, { Wf: !0 }).node;
              m.Jf.Of(m, { timestamp: Math.max(a, n) });
            }
            return 0;
          } catch (l) {
            if ("undefined" == typeof X || "ErrnoError" !== l.name) throw l;
            return -l.Mf;
          }
        },
        V: () => {
          C("");
        },
        s: () => {
          Ja = !1;
          Pb = 0;
        },
        k: function (a, b, c) {
          a = new Date(1e3 * Ob(a, b));
          x[c >> 2] = a.getSeconds();
          x[(c + 4) >> 2] = a.getMinutes();
          x[(c + 8) >> 2] = a.getHours();
          x[(c + 12) >> 2] = a.getDate();
          x[(c + 16) >> 2] = a.getMonth();
          x[(c + 20) >> 2] = a.getFullYear() - 1900;
          x[(c + 24) >> 2] = a.getDay();
          b = a.getFullYear();
          x[(c + 28) >> 2] =
            ((0 !== b % 4 || (0 === b % 100 && 0 !== b % 400) ? Rb : Qb)[
              a.getMonth()
            ] +
              a.getDate() -
              1) |
            0;
          x[(c + 36) >> 2] = -(60 * a.getTimezoneOffset());
          b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
          var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          x[(c + 32) >> 2] =
            (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
        },
        i: function (a, b, c, e, f, h, k, n) {
          f = Ob(f, h);
          try {
            if (isNaN(f)) return 61;
            var m = T(e);
            if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (m.flags & 2097155))
              throw new N(2);
            if (1 === (m.flags & 2097155)) throw new N(2);
            if (!m.Kf.hg) throw new N(43);
            if (!a) throw new N(28);
            var l = m.Kf.hg(m, a, f, b, c);
            var p = l.Lg;
            x[k >> 2] = l.Ag;
            z[n >> 2] = p;
            return 0;
          } catch (q) {
            if ("undefined" == typeof X || "ErrnoError" !== q.name) throw q;
            return -q.Mf;
          }
        },
        j: function (a, b, c, e, f, h, k) {
          h = Ob(h, k);
          try {
            var n = T(f);
            if (c & 2) {
              if (32768 !== (n.node.mode & 61440)) throw new N(43);
              e & 2 || (n.Kf.ig && n.Kf.ig(n, v.slice(a, a + b), h, b, e));
            }
          } catch (m) {
            if ("undefined" == typeof X || "ErrnoError" !== m.name) throw m;
            return -m.Mf;
          }
        },
        t: (a, b) => {
          Sb[a] && (clearTimeout(Sb[a].id), delete Sb[a]);
          if (!b) return 0;
          var c = setTimeout(() => {
            delete Sb[a];
            Vb(() => Sc(a, performance.now()));
          }, b);
          Sb[a] = { id: c, Yg: b };
          return 0;
        },
        E: (a, b, c, e) => {
          var f = new Date().getFullYear(),
            h = new Date(f, 0, 1).getTimezoneOffset();
          f = new Date(f, 6, 1).getTimezoneOffset();
          z[a >> 2] = 60 * Math.max(h, f);
          x[b >> 2] = Number(h != f);
          b = (k) => {
            var n = Math.abs(k);
            return `UTC${0 <= k ? "-" : "+"}${String(
              Math.floor(n / 60)
            ).padStart(2, "0")}${String(n % 60).padStart(2, "0")}`;
          };
          a = b(h);
          b = b(f);
          f < h
            ? (K(a, v, c, 17), K(b, v, e, 17))
            : (K(a, v, e, 17), K(b, v, c, 17));
        },
        e: () => Date.now(),
        d: () => performance.now(),
        u: (a) => {
          var b = v.length;
          a >>>= 0;
          if (2147483648 < a) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var e = b * (1 + 0.2 / c);
            e = Math.min(e, a + 100663296);
            a: {
              e =
                ((Math.min(
                  2147483648,
                  65536 * Math.ceil(Math.max(a, e) / 65536)
                ) -
                  na.buffer.byteLength +
                  65535) /
                  65536) |
                0;
              try {
                na.grow(e);
                ta();
                var f = 1;
                break a;
              } catch (h) {}
              f = void 0;
            }
            if (f) return !0;
          }
          return !1;
        },
        G: (a, b) => {
          var c = 0;
          Yb().forEach((e, f) => {
            var h = b + c;
            f = z[(a + 4 * f) >> 2] = h;
            for (h = 0; h < e.length; ++h) u[f++] = e.charCodeAt(h);
            u[f] = 0;
            c += e.length + 1;
          });
          return 0;
        },
        H: (a, b) => {
          var c = Yb();
          z[a >> 2] = c.length;
          var e = 0;
          c.forEach((f) => (e += f.length + 1));
          z[b >> 2] = e;
          return 0;
        },
        f: function (a) {
          try {
            var b = T(a);
            if (null === b.Uf) throw new N(8);
            b.mg && (b.mg = null);
            try {
              b.Kf.close && b.Kf.close(b);
            } catch (c) {
              throw c;
            } finally {
              ib[b.Uf] = null;
            }
            b.Uf = null;
            return 0;
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return c.Mf;
          }
        },
        v: function (a, b) {
          try {
            var c = T(a);
            u[b] = c.Qf
              ? 2
              : P(c.mode)
              ? 3
              : 40960 === (c.mode & 61440)
              ? 7
              : 4;
            w[(b + 2) >> 1] = 0;
            F = [
              0,
              ((D = 0),
              1 <= +Math.abs(D)
                ? 0 < D
                  ? +Math.floor(D / 4294967296) >>> 0
                  : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[(b + 8) >> 2] = F[0];
            x[(b + 12) >> 2] = F[1];
            F = [
              0,
              ((D = 0),
              1 <= +Math.abs(D)
                ? 0 < D
                  ? +Math.floor(D / 4294967296) >>> 0
                  : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[(b + 16) >> 2] = F[0];
            x[(b + 20) >> 2] = F[1];
            return 0;
          } catch (e) {
            if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
            return e.Mf;
          }
        },
        C: function (a, b, c, e) {
          try {
            a: {
              var f = T(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var n = z[a >> 2],
                  m = z[(a + 4) >> 2];
                a += 8;
                var l = f,
                  p = h,
                  q = u;
                if (0 > m || 0 > p) throw new N(28);
                if (null === l.Uf) throw new N(8);
                if (1 === (l.flags & 2097155)) throw new N(8);
                if (P(l.node.mode)) throw new N(31);
                if (!l.Kf.read) throw new N(28);
                var t = "undefined" != typeof p;
                if (!t) p = l.position;
                else if (!l.seekable) throw new N(70);
                var y = l.Kf.read(l, q, n, m, p);
                t || (l.position += y);
                var A = y;
                if (0 > A) {
                  var G = -1;
                  break a;
                }
                b += A;
                if (A < m) break;
                "undefined" != typeof h && (h += A);
              }
              G = b;
            }
            z[e >> 2] = G;
            return 0;
          } catch (E) {
            if ("undefined" == typeof X || "ErrnoError" !== E.name) throw E;
            return E.Mf;
          }
        },
        l: function (a, b, c, e, f) {
          b = Ob(b, c);
          try {
            if (isNaN(b)) return 61;
            var h = T(a);
            Jb(h, b, e);
            F = [
              h.position >>> 0,
              ((D = h.position),
              1 <= +Math.abs(D)
                ? 0 < D
                  ? +Math.floor(D / 4294967296) >>> 0
                  : ~~+Math.ceil((D - +(~~D >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[f >> 2] = F[0];
            x[(f + 4) >> 2] = F[1];
            h.mg && 0 === b && 0 === e && (h.mg = null);
            return 0;
          } catch (k) {
            if ("undefined" == typeof X || "ErrnoError" !== k.name) throw k;
            return k.Mf;
          }
        },
        K: function (a) {
          try {
            var b = T(a);
            return b.Kf?.Yf ? b.Kf.Yf(b) : 0;
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return c.Mf;
          }
        },
        y: function (a, b, c, e) {
          try {
            a: {
              var f = T(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var n = z[a >> 2],
                  m = z[(a + 4) >> 2];
                a += 8;
                var l = f,
                  p = n,
                  q = m,
                  t = h,
                  y = u;
                if (0 > q || 0 > t) throw new N(28);
                if (null === l.Uf) throw new N(8);
                if (0 === (l.flags & 2097155)) throw new N(8);
                if (P(l.node.mode)) throw new N(31);
                if (!l.Kf.write) throw new N(28);
                l.seekable && l.flags & 1024 && Jb(l, 0, 2);
                var A = "undefined" != typeof t;
                if (!A) t = l.position;
                else if (!l.seekable) throw new N(70);
                var G = l.Kf.write(l, y, p, q, t, void 0);
                A || (l.position += G);
                var E = G;
                if (0 > E) {
                  var M = -1;
                  break a;
                }
                b += E;
                if (E < m) break;
                "undefined" != typeof h && (h += E);
              }
              M = b;
            }
            z[e >> 2] = M;
            return 0;
          } catch (L) {
            if ("undefined" == typeof X || "ErrnoError" !== L.name) throw L;
            return L.Mf;
          }
        },
        wa: Zb,
        T: $b,
        la: ac,
        ha: bc,
        ba: cc,
        qa: dc,
        L: ec,
        h: fc,
        ta: gc,
        oa: hc,
        ja: ic,
        ka: jc,
        p: kc,
        A: lc,
        ua: mc,
        g: nc,
        va: oc,
        ia: pc,
        ma: qc,
        na: rc,
        sa: sc,
        c: tc,
        pa: uc,
        ra: vc,
        r: Ub,
        I: function (a, b) {
          try {
            return Qa(v.subarray(a, a + b)), 0;
          } catch (c) {
            if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
            return c.Mf;
          }
        },
        fa: wc,
        _: xc,
        ea: yc,
        ga: zc,
        X: Ac,
        Z: Bc,
        ca: Cc,
        aa: Dc,
        W: Ec,
        q: Fc,
        Y: Gc,
        da: Hc,
        n: Ic,
        $: Jc,
        o: Kc
      },
      Z = (function () {
        function a(c) {
          Z = c.exports;
          na = Z.xa;
          ta();
          Lc = Z.Cf;
          va.unshift(Z.ya);
          B--;
          d.monitorRunDependencies?.(B);
          0 == B &&
            (null !== za && (clearInterval(za), (za = null)),
            Aa && ((c = Aa), (Aa = null), c()));
          return Z;
        }
        var b = { a: Tc };
        B++;
        d.monitorRunDependencies?.(B);
        if (d.instantiateWasm)
          try {
            return d.instantiateWasm(b, a);
          } catch (c) {
            r(`Module.instantiateWasm callback failed with error: ${c}`), ba(c);
          }
        Ca ??= d.locateFile
          ? Ba("wa-sqlite.wasm")
            ? "wa-sqlite.wasm"
            : d.locateFile
            ? d.locateFile("wa-sqlite.wasm", g)
            : g + "wa-sqlite.wasm"
          : new URL("wa-sqlite.wasm", import.meta.url).href;
        Ga(b, function (c) {
          a(c.instance);
        }).catch(ba);
        return {};
      })();
    d._sqlite3_status64 = (a, b, c, e) =>
      (d._sqlite3_status64 = Z.za)(a, b, c, e);
    d._sqlite3_status = (a, b, c, e) => (d._sqlite3_status = Z.Aa)(a, b, c, e);
    d._sqlite3_db_status = (a, b, c, e, f) =>
      (d._sqlite3_db_status = Z.Ba)(a, b, c, e, f);
    d._sqlite3_msize = (a) => (d._sqlite3_msize = Z.Ca)(a);
    d._sqlite3_vfs_find = (a) => (d._sqlite3_vfs_find = Z.Da)(a);
    d._sqlite3_vfs_register = (a, b) => (d._sqlite3_vfs_register = Z.Ea)(a, b);
    d._sqlite3_vfs_unregister = (a) => (d._sqlite3_vfs_unregister = Z.Fa)(a);
    d._sqlite3_release_memory = (a) => (d._sqlite3_release_memory = Z.Ga)(a);
    d._sqlite3_soft_heap_limit64 = (a, b) =>
      (d._sqlite3_soft_heap_limit64 = Z.Ha)(a, b);
    d._sqlite3_memory_used = () => (d._sqlite3_memory_used = Z.Ia)();
    d._sqlite3_hard_heap_limit64 = (a, b) =>
      (d._sqlite3_hard_heap_limit64 = Z.Ja)(a, b);
    d._sqlite3_memory_highwater = (a) =>
      (d._sqlite3_memory_highwater = Z.Ka)(a);
    d._sqlite3_malloc = (a) => (d._sqlite3_malloc = Z.La)(a);
    d._sqlite3_malloc64 = (a, b) => (d._sqlite3_malloc64 = Z.Ma)(a, b);
    d._sqlite3_free = (a) => (d._sqlite3_free = Z.Na)(a);
    d._sqlite3_realloc = (a, b) => (d._sqlite3_realloc = Z.Oa)(a, b);
    d._sqlite3_realloc64 = (a, b, c) => (d._sqlite3_realloc64 = Z.Pa)(a, b, c);
    d._sqlite3_str_vappendf = (a, b, c) =>
      (d._sqlite3_str_vappendf = Z.Qa)(a, b, c);
    d._sqlite3_str_append = (a, b, c) =>
      (d._sqlite3_str_append = Z.Ra)(a, b, c);
    d._sqlite3_str_appendchar = (a, b, c) =>
      (d._sqlite3_str_appendchar = Z.Sa)(a, b, c);
    d._sqlite3_str_appendall = (a, b) =>
      (d._sqlite3_str_appendall = Z.Ta)(a, b);
    d._sqlite3_str_appendf = (a, b, c) =>
      (d._sqlite3_str_appendf = Z.Ua)(a, b, c);
    d._sqlite3_str_finish = (a) => (d._sqlite3_str_finish = Z.Va)(a);
    d._sqlite3_str_errcode = (a) => (d._sqlite3_str_errcode = Z.Wa)(a);
    d._sqlite3_str_length = (a) => (d._sqlite3_str_length = Z.Xa)(a);
    d._sqlite3_str_value = (a) => (d._sqlite3_str_value = Z.Ya)(a);
    d._sqlite3_str_reset = (a) => (d._sqlite3_str_reset = Z.Za)(a);
    d._sqlite3_str_new = (a) => (d._sqlite3_str_new = Z._a)(a);
    d._sqlite3_vmprintf = (a, b) => (d._sqlite3_vmprintf = Z.$a)(a, b);
    d._sqlite3_mprintf = (a, b) => (d._sqlite3_mprintf = Z.ab)(a, b);
    d._sqlite3_vsnprintf = (a, b, c, e) =>
      (d._sqlite3_vsnprintf = Z.bb)(a, b, c, e);
    d._sqlite3_snprintf = (a, b, c, e) =>
      (d._sqlite3_snprintf = Z.cb)(a, b, c, e);
    d._sqlite3_log = (a, b, c) => (d._sqlite3_log = Z.db)(a, b, c);
    d._sqlite3_randomness = (a, b) => (d._sqlite3_randomness = Z.eb)(a, b);
    d._sqlite3_stricmp = (a, b) => (d._sqlite3_stricmp = Z.fb)(a, b);
    d._sqlite3_strnicmp = (a, b, c) => (d._sqlite3_strnicmp = Z.gb)(a, b, c);
    d._sqlite3_os_init = () => (d._sqlite3_os_init = Z.hb)();
    d._sqlite3_os_end = () => (d._sqlite3_os_end = Z.ib)();
    d._sqlite3_serialize = (a, b, c, e) =>
      (d._sqlite3_serialize = Z.jb)(a, b, c, e);
    d._sqlite3_prepare_v2 = (a, b, c, e, f) =>
      (d._sqlite3_prepare_v2 = Z.kb)(a, b, c, e, f);
    d._sqlite3_step = (a) => (d._sqlite3_step = Z.lb)(a);
    d._sqlite3_column_int64 = (a, b) => (d._sqlite3_column_int64 = Z.mb)(a, b);
    d._sqlite3_reset = (a) => (d._sqlite3_reset = Z.nb)(a);
    d._sqlite3_exec = (a, b, c, e, f) =>
      (d._sqlite3_exec = Z.ob)(a, b, c, e, f);
    d._sqlite3_column_int = (a, b) => (d._sqlite3_column_int = Z.pb)(a, b);
    d._sqlite3_finalize = (a) => (d._sqlite3_finalize = Z.qb)(a);
    d._sqlite3_deserialize = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_deserialize = Z.rb)(a, b, c, e, f, h, k, n);
    d._sqlite3_database_file_object = (a) =>
      (d._sqlite3_database_file_object = Z.sb)(a);
    d._sqlite3_backup_init = (a, b, c, e) =>
      (d._sqlite3_backup_init = Z.tb)(a, b, c, e);
    d._sqlite3_backup_step = (a, b) => (d._sqlite3_backup_step = Z.ub)(a, b);
    d._sqlite3_backup_finish = (a) => (d._sqlite3_backup_finish = Z.vb)(a);
    d._sqlite3_backup_remaining = (a) =>
      (d._sqlite3_backup_remaining = Z.wb)(a);
    d._sqlite3_backup_pagecount = (a) =>
      (d._sqlite3_backup_pagecount = Z.xb)(a);
    d._sqlite3_clear_bindings = (a) => (d._sqlite3_clear_bindings = Z.yb)(a);
    d._sqlite3_value_blob = (a) => (d._sqlite3_value_blob = Z.zb)(a);
    d._sqlite3_value_text = (a) => (d._sqlite3_value_text = Z.Ab)(a);
    d._sqlite3_value_bytes = (a) => (d._sqlite3_value_bytes = Z.Bb)(a);
    d._sqlite3_value_bytes16 = (a) => (d._sqlite3_value_bytes16 = Z.Cb)(a);
    d._sqlite3_value_double = (a) => (d._sqlite3_value_double = Z.Db)(a);
    d._sqlite3_value_int = (a) => (d._sqlite3_value_int = Z.Eb)(a);
    d._sqlite3_value_int64 = (a) => (d._sqlite3_value_int64 = Z.Fb)(a);
    d._sqlite3_value_subtype = (a) => (d._sqlite3_value_subtype = Z.Gb)(a);
    d._sqlite3_value_pointer = (a, b) =>
      (d._sqlite3_value_pointer = Z.Hb)(a, b);
    d._sqlite3_value_text16 = (a) => (d._sqlite3_value_text16 = Z.Ib)(a);
    d._sqlite3_value_text16be = (a) => (d._sqlite3_value_text16be = Z.Jb)(a);
    d._sqlite3_value_text16le = (a) => (d._sqlite3_value_text16le = Z.Kb)(a);
    d._sqlite3_value_type = (a) => (d._sqlite3_value_type = Z.Lb)(a);
    d._sqlite3_value_encoding = (a) => (d._sqlite3_value_encoding = Z.Mb)(a);
    d._sqlite3_value_nochange = (a) => (d._sqlite3_value_nochange = Z.Nb)(a);
    d._sqlite3_value_frombind = (a) => (d._sqlite3_value_frombind = Z.Ob)(a);
    d._sqlite3_value_dup = (a) => (d._sqlite3_value_dup = Z.Pb)(a);
    d._sqlite3_value_free = (a) => (d._sqlite3_value_free = Z.Qb)(a);
    d._sqlite3_result_blob = (a, b, c, e) =>
      (d._sqlite3_result_blob = Z.Rb)(a, b, c, e);
    d._sqlite3_result_blob64 = (a, b, c, e, f) =>
      (d._sqlite3_result_blob64 = Z.Sb)(a, b, c, e, f);
    d._sqlite3_result_double = (a, b) =>
      (d._sqlite3_result_double = Z.Tb)(a, b);
    d._sqlite3_result_error = (a, b, c) =>
      (d._sqlite3_result_error = Z.Ub)(a, b, c);
    d._sqlite3_result_error16 = (a, b, c) =>
      (d._sqlite3_result_error16 = Z.Vb)(a, b, c);
    d._sqlite3_result_int = (a, b) => (d._sqlite3_result_int = Z.Wb)(a, b);
    d._sqlite3_result_int64 = (a, b, c) =>
      (d._sqlite3_result_int64 = Z.Xb)(a, b, c);
    d._sqlite3_result_null = (a) => (d._sqlite3_result_null = Z.Yb)(a);
    d._sqlite3_result_pointer = (a, b, c, e) =>
      (d._sqlite3_result_pointer = Z.Zb)(a, b, c, e);
    d._sqlite3_result_subtype = (a, b) =>
      (d._sqlite3_result_subtype = Z._b)(a, b);
    d._sqlite3_result_text = (a, b, c, e) =>
      (d._sqlite3_result_text = Z.$b)(a, b, c, e);
    d._sqlite3_result_text64 = (a, b, c, e, f, h) =>
      (d._sqlite3_result_text64 = Z.ac)(a, b, c, e, f, h);
    d._sqlite3_result_text16 = (a, b, c, e) =>
      (d._sqlite3_result_text16 = Z.bc)(a, b, c, e);
    d._sqlite3_result_text16be = (a, b, c, e) =>
      (d._sqlite3_result_text16be = Z.cc)(a, b, c, e);
    d._sqlite3_result_text16le = (a, b, c, e) =>
      (d._sqlite3_result_text16le = Z.dc)(a, b, c, e);
    d._sqlite3_result_value = (a, b) => (d._sqlite3_result_value = Z.ec)(a, b);
    d._sqlite3_result_error_toobig = (a) =>
      (d._sqlite3_result_error_toobig = Z.fc)(a);
    d._sqlite3_result_zeroblob = (a, b) =>
      (d._sqlite3_result_zeroblob = Z.gc)(a, b);
    d._sqlite3_result_zeroblob64 = (a, b, c) =>
      (d._sqlite3_result_zeroblob64 = Z.hc)(a, b, c);
    d._sqlite3_result_error_code = (a, b) =>
      (d._sqlite3_result_error_code = Z.ic)(a, b);
    d._sqlite3_result_error_nomem = (a) =>
      (d._sqlite3_result_error_nomem = Z.jc)(a);
    d._sqlite3_user_data = (a) => (d._sqlite3_user_data = Z.kc)(a);
    d._sqlite3_context_db_handle = (a) =>
      (d._sqlite3_context_db_handle = Z.lc)(a);
    d._sqlite3_vtab_nochange = (a) => (d._sqlite3_vtab_nochange = Z.mc)(a);
    d._sqlite3_vtab_in_first = (a, b) =>
      (d._sqlite3_vtab_in_first = Z.nc)(a, b);
    d._sqlite3_vtab_in_next = (a, b) => (d._sqlite3_vtab_in_next = Z.oc)(a, b);
    d._sqlite3_aggregate_context = (a, b) =>
      (d._sqlite3_aggregate_context = Z.pc)(a, b);
    d._sqlite3_get_auxdata = (a, b) => (d._sqlite3_get_auxdata = Z.qc)(a, b);
    d._sqlite3_set_auxdata = (a, b, c, e) =>
      (d._sqlite3_set_auxdata = Z.rc)(a, b, c, e);
    d._sqlite3_column_count = (a) => (d._sqlite3_column_count = Z.sc)(a);
    d._sqlite3_data_count = (a) => (d._sqlite3_data_count = Z.tc)(a);
    d._sqlite3_column_blob = (a, b) => (d._sqlite3_column_blob = Z.uc)(a, b);
    d._sqlite3_column_bytes = (a, b) => (d._sqlite3_column_bytes = Z.vc)(a, b);
    d._sqlite3_column_bytes16 = (a, b) =>
      (d._sqlite3_column_bytes16 = Z.wc)(a, b);
    d._sqlite3_column_double = (a, b) =>
      (d._sqlite3_column_double = Z.xc)(a, b);
    d._sqlite3_column_text = (a, b) => (d._sqlite3_column_text = Z.yc)(a, b);
    d._sqlite3_column_value = (a, b) => (d._sqlite3_column_value = Z.zc)(a, b);
    d._sqlite3_column_text16 = (a, b) =>
      (d._sqlite3_column_text16 = Z.Ac)(a, b);
    d._sqlite3_column_type = (a, b) => (d._sqlite3_column_type = Z.Bc)(a, b);
    d._sqlite3_column_name = (a, b) => (d._sqlite3_column_name = Z.Cc)(a, b);
    d._sqlite3_column_name16 = (a, b) =>
      (d._sqlite3_column_name16 = Z.Dc)(a, b);
    d._sqlite3_bind_blob = (a, b, c, e, f) =>
      (d._sqlite3_bind_blob = Z.Ec)(a, b, c, e, f);
    d._sqlite3_bind_blob64 = (a, b, c, e, f, h) =>
      (d._sqlite3_bind_blob64 = Z.Fc)(a, b, c, e, f, h);
    d._sqlite3_bind_double = (a, b, c) =>
      (d._sqlite3_bind_double = Z.Gc)(a, b, c);
    d._sqlite3_bind_int = (a, b, c) => (d._sqlite3_bind_int = Z.Hc)(a, b, c);
    d._sqlite3_bind_int64 = (a, b, c, e) =>
      (d._sqlite3_bind_int64 = Z.Ic)(a, b, c, e);
    d._sqlite3_bind_null = (a, b) => (d._sqlite3_bind_null = Z.Jc)(a, b);
    d._sqlite3_bind_pointer = (a, b, c, e, f) =>
      (d._sqlite3_bind_pointer = Z.Kc)(a, b, c, e, f);
    d._sqlite3_bind_text = (a, b, c, e, f) =>
      (d._sqlite3_bind_text = Z.Lc)(a, b, c, e, f);
    d._sqlite3_bind_text64 = (a, b, c, e, f, h, k) =>
      (d._sqlite3_bind_text64 = Z.Mc)(a, b, c, e, f, h, k);
    d._sqlite3_bind_text16 = (a, b, c, e, f) =>
      (d._sqlite3_bind_text16 = Z.Nc)(a, b, c, e, f);
    d._sqlite3_bind_value = (a, b, c) =>
      (d._sqlite3_bind_value = Z.Oc)(a, b, c);
    d._sqlite3_bind_zeroblob = (a, b, c) =>
      (d._sqlite3_bind_zeroblob = Z.Pc)(a, b, c);
    d._sqlite3_bind_zeroblob64 = (a, b, c, e) =>
      (d._sqlite3_bind_zeroblob64 = Z.Qc)(a, b, c, e);
    d._sqlite3_bind_parameter_count = (a) =>
      (d._sqlite3_bind_parameter_count = Z.Rc)(a);
    d._sqlite3_bind_parameter_name = (a, b) =>
      (d._sqlite3_bind_parameter_name = Z.Sc)(a, b);
    d._sqlite3_bind_parameter_index = (a, b) =>
      (d._sqlite3_bind_parameter_index = Z.Tc)(a, b);
    d._sqlite3_db_handle = (a) => (d._sqlite3_db_handle = Z.Uc)(a);
    d._sqlite3_stmt_readonly = (a) => (d._sqlite3_stmt_readonly = Z.Vc)(a);
    d._sqlite3_stmt_isexplain = (a) => (d._sqlite3_stmt_isexplain = Z.Wc)(a);
    d._sqlite3_stmt_explain = (a, b) => (d._sqlite3_stmt_explain = Z.Xc)(a, b);
    d._sqlite3_stmt_busy = (a) => (d._sqlite3_stmt_busy = Z.Yc)(a);
    d._sqlite3_next_stmt = (a, b) => (d._sqlite3_next_stmt = Z.Zc)(a, b);
    d._sqlite3_stmt_status = (a, b, c) =>
      (d._sqlite3_stmt_status = Z._c)(a, b, c);
    d._sqlite3_sql = (a) => (d._sqlite3_sql = Z.$c)(a);
    d._sqlite3_expanded_sql = (a) => (d._sqlite3_expanded_sql = Z.ad)(a);
    d._sqlite3_value_numeric_type = (a) =>
      (d._sqlite3_value_numeric_type = Z.bd)(a);
    d._sqlite3_blob_open = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_blob_open = Z.cd)(a, b, c, e, f, h, k, n);
    d._sqlite3_blob_close = (a) => (d._sqlite3_blob_close = Z.dd)(a);
    d._sqlite3_blob_read = (a, b, c, e) =>
      (d._sqlite3_blob_read = Z.ed)(a, b, c, e);
    d._sqlite3_blob_write = (a, b, c, e) =>
      (d._sqlite3_blob_write = Z.fd)(a, b, c, e);
    d._sqlite3_blob_bytes = (a) => (d._sqlite3_blob_bytes = Z.gd)(a);
    d._sqlite3_blob_reopen = (a, b, c) =>
      (d._sqlite3_blob_reopen = Z.hd)(a, b, c);
    d._sqlite3_set_authorizer = (a, b, c) =>
      (d._sqlite3_set_authorizer = Z.id)(a, b, c);
    d._sqlite3_strglob = (a, b) => (d._sqlite3_strglob = Z.jd)(a, b);
    d._sqlite3_strlike = (a, b, c) => (d._sqlite3_strlike = Z.kd)(a, b, c);
    d._sqlite3_errmsg = (a) => (d._sqlite3_errmsg = Z.ld)(a);
    d._sqlite3_auto_extension = (a) => (d._sqlite3_auto_extension = Z.md)(a);
    d._sqlite3_cancel_auto_extension = (a) =>
      (d._sqlite3_cancel_auto_extension = Z.nd)(a);
    d._sqlite3_reset_auto_extension = () =>
      (d._sqlite3_reset_auto_extension = Z.od)();
    d._sqlite3_prepare = (a, b, c, e, f) =>
      (d._sqlite3_prepare = Z.pd)(a, b, c, e, f);
    d._sqlite3_prepare_v3 = (a, b, c, e, f, h) =>
      (d._sqlite3_prepare_v3 = Z.qd)(a, b, c, e, f, h);
    d._sqlite3_prepare16 = (a, b, c, e, f) =>
      (d._sqlite3_prepare16 = Z.rd)(a, b, c, e, f);
    d._sqlite3_prepare16_v2 = (a, b, c, e, f) =>
      (d._sqlite3_prepare16_v2 = Z.sd)(a, b, c, e, f);
    d._sqlite3_prepare16_v3 = (a, b, c, e, f, h) =>
      (d._sqlite3_prepare16_v3 = Z.td)(a, b, c, e, f, h);
    d._sqlite3_get_table = (a, b, c, e, f, h) =>
      (d._sqlite3_get_table = Z.ud)(a, b, c, e, f, h);
    d._sqlite3_free_table = (a) => (d._sqlite3_free_table = Z.vd)(a);
    d._sqlite3_create_module = (a, b, c, e) =>
      (d._sqlite3_create_module = Z.wd)(a, b, c, e);
    d._sqlite3_create_module_v2 = (a, b, c, e, f) =>
      (d._sqlite3_create_module_v2 = Z.xd)(a, b, c, e, f);
    d._sqlite3_drop_modules = (a, b) => (d._sqlite3_drop_modules = Z.yd)(a, b);
    d._sqlite3_declare_vtab = (a, b) => (d._sqlite3_declare_vtab = Z.zd)(a, b);
    d._sqlite3_vtab_on_conflict = (a) =>
      (d._sqlite3_vtab_on_conflict = Z.Ad)(a);
    d._sqlite3_vtab_config = (a, b, c) =>
      (d._sqlite3_vtab_config = Z.Bd)(a, b, c);
    d._sqlite3_vtab_collation = (a, b) =>
      (d._sqlite3_vtab_collation = Z.Cd)(a, b);
    d._sqlite3_vtab_in = (a, b, c) => (d._sqlite3_vtab_in = Z.Dd)(a, b, c);
    d._sqlite3_vtab_rhs_value = (a, b, c) =>
      (d._sqlite3_vtab_rhs_value = Z.Ed)(a, b, c);
    d._sqlite3_vtab_distinct = (a) => (d._sqlite3_vtab_distinct = Z.Fd)(a);
    d._sqlite3_keyword_name = (a, b, c) =>
      (d._sqlite3_keyword_name = Z.Gd)(a, b, c);
    d._sqlite3_keyword_count = () => (d._sqlite3_keyword_count = Z.Hd)();
    d._sqlite3_keyword_check = (a, b) =>
      (d._sqlite3_keyword_check = Z.Id)(a, b);
    d._sqlite3_complete = (a) => (d._sqlite3_complete = Z.Jd)(a);
    d._sqlite3_complete16 = (a) => (d._sqlite3_complete16 = Z.Kd)(a);
    d._sqlite3_libversion = () => (d._sqlite3_libversion = Z.Ld)();
    d._sqlite3_libversion_number = () =>
      (d._sqlite3_libversion_number = Z.Md)();
    d._sqlite3_threadsafe = () => (d._sqlite3_threadsafe = Z.Nd)();
    d._sqlite3_initialize = () => (d._sqlite3_initialize = Z.Od)();
    d._sqlite3_shutdown = () => (d._sqlite3_shutdown = Z.Pd)();
    d._sqlite3_config = (a, b) => (d._sqlite3_config = Z.Qd)(a, b);
    d._sqlite3_db_mutex = (a) => (d._sqlite3_db_mutex = Z.Rd)(a);
    d._sqlite3_db_release_memory = (a) =>
      (d._sqlite3_db_release_memory = Z.Sd)(a);
    d._sqlite3_db_cacheflush = (a) => (d._sqlite3_db_cacheflush = Z.Td)(a);
    d._sqlite3_db_config = (a, b, c) => (d._sqlite3_db_config = Z.Ud)(a, b, c);
    d._sqlite3_last_insert_rowid = (a) =>
      (d._sqlite3_last_insert_rowid = Z.Vd)(a);
    d._sqlite3_set_last_insert_rowid = (a, b, c) =>
      (d._sqlite3_set_last_insert_rowid = Z.Wd)(a, b, c);
    d._sqlite3_changes64 = (a) => (d._sqlite3_changes64 = Z.Xd)(a);
    d._sqlite3_changes = (a) => (d._sqlite3_changes = Z.Yd)(a);
    d._sqlite3_total_changes64 = (a) => (d._sqlite3_total_changes64 = Z.Zd)(a);
    d._sqlite3_total_changes = (a) => (d._sqlite3_total_changes = Z._d)(a);
    d._sqlite3_txn_state = (a, b) => (d._sqlite3_txn_state = Z.$d)(a, b);
    d._sqlite3_close = (a) => (d._sqlite3_close = Z.ae)(a);
    d._sqlite3_close_v2 = (a) => (d._sqlite3_close_v2 = Z.be)(a);
    d._sqlite3_busy_handler = (a, b, c) =>
      (d._sqlite3_busy_handler = Z.ce)(a, b, c);
    d._sqlite3_progress_handler = (a, b, c, e) =>
      (d._sqlite3_progress_handler = Z.de)(a, b, c, e);
    d._sqlite3_busy_timeout = (a, b) => (d._sqlite3_busy_timeout = Z.ee)(a, b);
    d._sqlite3_interrupt = (a) => (d._sqlite3_interrupt = Z.fe)(a);
    d._sqlite3_is_interrupted = (a) => (d._sqlite3_is_interrupted = Z.ge)(a);
    d._sqlite3_create_function = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_create_function = Z.he)(a, b, c, e, f, h, k, n);
    d._sqlite3_create_function_v2 = (a, b, c, e, f, h, k, n, m) =>
      (d._sqlite3_create_function_v2 = Z.ie)(a, b, c, e, f, h, k, n, m);
    d._sqlite3_create_window_function = (a, b, c, e, f, h, k, n, m, l) =>
      (d._sqlite3_create_window_function = Z.je)(a, b, c, e, f, h, k, n, m, l);
    d._sqlite3_create_function16 = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_create_function16 = Z.ke)(a, b, c, e, f, h, k, n);
    d._sqlite3_overload_function = (a, b, c) =>
      (d._sqlite3_overload_function = Z.le)(a, b, c);
    d._sqlite3_trace_v2 = (a, b, c, e) =>
      (d._sqlite3_trace_v2 = Z.me)(a, b, c, e);
    d._sqlite3_commit_hook = (a, b, c) =>
      (d._sqlite3_commit_hook = Z.ne)(a, b, c);
    d._sqlite3_update_hook = (a, b, c) =>
      (d._sqlite3_update_hook = Z.oe)(a, b, c);
    d._sqlite3_rollback_hook = (a, b, c) =>
      (d._sqlite3_rollback_hook = Z.pe)(a, b, c);
    d._sqlite3_autovacuum_pages = (a, b, c, e) =>
      (d._sqlite3_autovacuum_pages = Z.qe)(a, b, c, e);
    d._sqlite3_wal_autocheckpoint = (a, b) =>
      (d._sqlite3_wal_autocheckpoint = Z.re)(a, b);
    d._sqlite3_wal_hook = (a, b, c) => (d._sqlite3_wal_hook = Z.se)(a, b, c);
    d._sqlite3_wal_checkpoint_v2 = (a, b, c, e, f) =>
      (d._sqlite3_wal_checkpoint_v2 = Z.te)(a, b, c, e, f);
    d._sqlite3_wal_checkpoint = (a, b) =>
      (d._sqlite3_wal_checkpoint = Z.ue)(a, b);
    d._sqlite3_error_offset = (a) => (d._sqlite3_error_offset = Z.ve)(a);
    d._sqlite3_errmsg16 = (a) => (d._sqlite3_errmsg16 = Z.we)(a);
    d._sqlite3_errcode = (a) => (d._sqlite3_errcode = Z.xe)(a);
    d._sqlite3_extended_errcode = (a) =>
      (d._sqlite3_extended_errcode = Z.ye)(a);
    d._sqlite3_system_errno = (a) => (d._sqlite3_system_errno = Z.ze)(a);
    d._sqlite3_errstr = (a) => (d._sqlite3_errstr = Z.Ae)(a);
    d._sqlite3_limit = (a, b, c) => (d._sqlite3_limit = Z.Be)(a, b, c);
    d._sqlite3_open = (a, b) => (d._sqlite3_open = Z.Ce)(a, b);
    d._sqlite3_open_v2 = (a, b, c, e) =>
      (d._sqlite3_open_v2 = Z.De)(a, b, c, e);
    d._sqlite3_open16 = (a, b) => (d._sqlite3_open16 = Z.Ee)(a, b);
    d._sqlite3_create_collation = (a, b, c, e, f) =>
      (d._sqlite3_create_collation = Z.Fe)(a, b, c, e, f);
    d._sqlite3_create_collation_v2 = (a, b, c, e, f, h) =>
      (d._sqlite3_create_collation_v2 = Z.Ge)(a, b, c, e, f, h);
    d._sqlite3_create_collation16 = (a, b, c, e, f) =>
      (d._sqlite3_create_collation16 = Z.He)(a, b, c, e, f);
    d._sqlite3_collation_needed = (a, b, c) =>
      (d._sqlite3_collation_needed = Z.Ie)(a, b, c);
    d._sqlite3_collation_needed16 = (a, b, c) =>
      (d._sqlite3_collation_needed16 = Z.Je)(a, b, c);
    d._sqlite3_get_clientdata = (a, b) =>
      (d._sqlite3_get_clientdata = Z.Ke)(a, b);
    d._sqlite3_set_clientdata = (a, b, c, e) =>
      (d._sqlite3_set_clientdata = Z.Le)(a, b, c, e);
    d._sqlite3_get_autocommit = (a) => (d._sqlite3_get_autocommit = Z.Me)(a);
    d._sqlite3_table_column_metadata = (a, b, c, e, f, h, k, n, m) =>
      (d._sqlite3_table_column_metadata = Z.Ne)(a, b, c, e, f, h, k, n, m);
    d._sqlite3_sleep = (a) => (d._sqlite3_sleep = Z.Oe)(a);
    d._sqlite3_extended_result_codes = (a, b) =>
      (d._sqlite3_extended_result_codes = Z.Pe)(a, b);
    d._sqlite3_file_control = (a, b, c, e) =>
      (d._sqlite3_file_control = Z.Qe)(a, b, c, e);
    d._sqlite3_test_control = (a, b) => (d._sqlite3_test_control = Z.Re)(a, b);
    d._sqlite3_create_filename = (a, b, c, e, f) =>
      (d._sqlite3_create_filename = Z.Se)(a, b, c, e, f);
    d._sqlite3_free_filename = (a) => (d._sqlite3_free_filename = Z.Te)(a);
    d._sqlite3_uri_parameter = (a, b) =>
      (d._sqlite3_uri_parameter = Z.Ue)(a, b);
    d._sqlite3_uri_key = (a, b) => (d._sqlite3_uri_key = Z.Ve)(a, b);
    d._sqlite3_uri_boolean = (a, b, c) =>
      (d._sqlite3_uri_boolean = Z.We)(a, b, c);
    d._sqlite3_uri_int64 = (a, b, c, e) =>
      (d._sqlite3_uri_int64 = Z.Xe)(a, b, c, e);
    d._sqlite3_filename_database = (a) =>
      (d._sqlite3_filename_database = Z.Ye)(a);
    d._sqlite3_filename_journal = (a) =>
      (d._sqlite3_filename_journal = Z.Ze)(a);
    d._sqlite3_filename_wal = (a) => (d._sqlite3_filename_wal = Z._e)(a);
    d._sqlite3_db_name = (a, b) => (d._sqlite3_db_name = Z.$e)(a, b);
    d._sqlite3_db_filename = (a, b) => (d._sqlite3_db_filename = Z.af)(a, b);
    d._sqlite3_db_readonly = (a, b) => (d._sqlite3_db_readonly = Z.bf)(a, b);
    d._sqlite3_compileoption_used = (a) =>
      (d._sqlite3_compileoption_used = Z.cf)(a);
    d._sqlite3_compileoption_get = (a) =>
      (d._sqlite3_compileoption_get = Z.df)(a);
    d._sqlite3_sourceid = () => (d._sqlite3_sourceid = Z.ef)();
    d._sqlite3mc_config = (a, b, c) => (d._sqlite3mc_config = Z.ff)(a, b, c);
    d._sqlite3mc_cipher_count = () => (d._sqlite3mc_cipher_count = Z.gf)();
    d._sqlite3mc_cipher_index = (a) => (d._sqlite3mc_cipher_index = Z.hf)(a);
    d._sqlite3mc_cipher_name = (a) => (d._sqlite3mc_cipher_name = Z.jf)(a);
    d._sqlite3mc_config_cipher = (a, b, c, e) =>
      (d._sqlite3mc_config_cipher = Z.kf)(a, b, c, e);
    d._sqlite3mc_codec_data = (a, b, c) =>
      (d._sqlite3mc_codec_data = Z.lf)(a, b, c);
    d._sqlite3_key = (a, b, c) => (d._sqlite3_key = Z.mf)(a, b, c);
    d._sqlite3_key_v2 = (a, b, c, e) => (d._sqlite3_key_v2 = Z.nf)(a, b, c, e);
    d._sqlite3_rekey_v2 = (a, b, c, e) =>
      (d._sqlite3_rekey_v2 = Z.of)(a, b, c, e);
    d._sqlite3_rekey = (a, b, c) => (d._sqlite3_rekey = Z.pf)(a, b, c);
    d._sqlite3mc_register_cipher = (a, b, c) =>
      (d._sqlite3mc_register_cipher = Z.qf)(a, b, c);
    d._malloc = (a) => (d._malloc = Z.rf)(a);
    d._free = (a) => (d._free = Z.sf)(a);
    d._RegisterExtensionFunctions = (a) =>
      (d._RegisterExtensionFunctions = Z.tf)(a);
    d._sqlite3Fts5BetterTrigramInit = (a) =>
      (d._sqlite3Fts5BetterTrigramInit = Z.uf)(a);
    d._set_authorizer = (a) => (d._set_authorizer = Z.vf)(a);
    d._create_function = (a, b, c, e, f, h) =>
      (d._create_function = Z.wf)(a, b, c, e, f, h);
    d._create_module = (a, b, c, e) => (d._create_module = Z.xf)(a, b, c, e);
    d._progress_handler = (a, b) => (d._progress_handler = Z.yf)(a, b);
    d._register_vfs = (a, b, c, e) => (d._register_vfs = Z.zf)(a, b, c, e);
    d._getSqliteFree = () => (d._getSqliteFree = Z.Af)();
    var Uc = (d._main = (a, b) => (Uc = d._main = Z.Bf)(a, b)),
      eb = (a, b) => (eb = Z.Df)(a, b),
      Sc = (a, b) => (Sc = Z.Ef)(a, b),
      Vc = () => (Vc = Z.Ff)(),
      Qc = (a) => (Qc = Z.Gf)(a),
      Oc = (a) => (Oc = Z.Hf)(a),
      Pc = () => (Pc = Z.If)();
    d._sqlite3_version = 5472;
    d.getTempRet0 = () => Vc();
    d.ccall = Y;
    d.cwrap = (a, b, c, e) => {
      var f = !c || c.every((h) => "number" === h || "boolean" === h);
      return "string" !== b && f && !e
        ? d["_" + a]
        : (...h) => Y(a, b, c, h, e);
    };
    d.addFunction = (a, b) => {
      if (!Mc) {
        Mc = new WeakMap();
        var c = Lc.length;
        if (Mc)
          for (var e = 0; e < 0 + c; e++) {
            var f = Lc.get(e);
            f && Mc.set(f, e);
          }
      }
      if ((c = Mc.get(a) || 0)) return c;
      if (Nc.length) c = Nc.pop();
      else {
        try {
          Lc.grow(1);
        } catch (n) {
          if (!(n instanceof RangeError)) throw n;
          throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
        }
        c = Lc.length - 1;
      }
      try {
        Lc.set(c, a);
      } catch (n) {
        if (!(n instanceof TypeError)) throw n;
        if ("function" == typeof WebAssembly.Function) {
          e = WebAssembly.Function;
          f = {
            i: "i32",
            j: "i64",
            f: "f32",
            d: "f64",
            e: "externref",
            p: "i32"
          };
          for (
            var h = { parameters: [], results: "v" == b[0] ? [] : [f[b[0]]] },
              k = 1;
            k < b.length;
            ++k
          )
            h.parameters.push(f[b[k]]);
          b = new e(h, a);
        } else {
          e = [1];
          f = b.slice(0, 1);
          b = b.slice(1);
          h = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
          e.push(96);
          k = b.length;
          128 > k ? e.push(k) : e.push(k % 128 | 128, k >> 7);
          for (k = 0; k < b.length; ++k) e.push(h[b[k]]);
          "v" == f ? e.push(0) : e.push(1, h[f]);
          b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
          f = e.length;
          128 > f ? b.push(f) : b.push(f % 128 | 128, f >> 7);
          b.push(...e);
          b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
          b = new WebAssembly.Module(new Uint8Array(b));
          b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
        }
        Lc.set(c, b);
      }
      Mc.set(a, c);
      return c;
    };
    d.setValue = I;
    d.getValue = H;
    d.UTF8ToString = (a, b) => (a ? J(v, a, b) : "");
    d.stringToUTF8 = (a, b, c) => K(a, v, b, c);
    d.lengthBytesUTF8 = Ta;
    d.intArrayFromString = Ua;
    d.intArrayToString = function (a) {
      for (var b = [], c = 0; c < a.length; c++) {
        var e = a[c];
        255 < e && (e &= 255);
        b.push(String.fromCharCode(e));
      }
      return b.join("");
    };
    d.AsciiToString = (a) => {
      for (var b = ""; ; ) {
        var c = v[a++];
        if (!c) return b;
        b += String.fromCharCode(c);
      }
    };
    d.UTF16ToString = (a, b) => {
      var c = a >> 1;
      for (var e = c + b / 2; !(c >= e) && qa[c]; ) ++c;
      c <<= 1;
      if (32 < c - a && Rc) return Rc.decode(v.subarray(a, c));
      c = "";
      for (e = 0; !(e >= b / 2); ++e) {
        var f = w[(a + 2 * e) >> 1];
        if (0 == f) break;
        c += String.fromCharCode(f);
      }
      return c;
    };
    d.stringToUTF16 = (a, b, c) => {
      c ??= 2147483647;
      if (2 > c) return 0;
      c -= 2;
      var e = b;
      c = c < 2 * a.length ? c / 2 : a.length;
      for (var f = 0; f < c; ++f) (w[b >> 1] = a.charCodeAt(f)), (b += 2);
      w[b >> 1] = 0;
      return b - e;
    };
    d.UTF32ToString = (a, b) => {
      for (var c = 0, e = ""; !(c >= b / 4); ) {
        var f = x[(a + 4 * c) >> 2];
        if (0 == f) break;
        ++c;
        65536 <= f
          ? ((f -= 65536),
            (e += String.fromCharCode(55296 | (f >> 10), 56320 | (f & 1023))))
          : (e += String.fromCharCode(f));
      }
      return e;
    };
    d.stringToUTF32 = (a, b, c) => {
      c ??= 2147483647;
      if (4 > c) return 0;
      var e = b;
      c = e + c - 4;
      for (var f = 0; f < a.length; ++f) {
        var h = a.charCodeAt(f);
        if (55296 <= h && 57343 >= h) {
          var k = a.charCodeAt(++f);
          h = (65536 + ((h & 1023) << 10)) | (k & 1023);
        }
        x[b >> 2] = h;
        b += 4;
        if (b + 4 > c) break;
      }
      x[b >> 2] = 0;
      return b - e;
    };
    d.writeArrayToMemory = (a, b) => {
      u.set(a, b);
    };
    var Wc;
    Aa = function Xc() {
      Wc || Yc();
      Wc || (Aa = Xc);
    };
    function Yc() {
      function a() {
        if (!Wc && ((Wc = !0), (d.calledRun = !0), !oa)) {
          if (!d.noFSInit && !kb) {
            var b, c;
            kb = !0;
            e ??= d.stdin;
            b ??= d.stdout;
            c ??= d.stderr;
            e ? V("stdin", e) : Cb("/dev/tty", "/dev/stdin");
            b ? V("stdout", null, b) : Cb("/dev/tty", "/dev/stdout");
            c ? V("stderr", null, c) : Cb("/dev/tty1", "/dev/stderr");
            Ib("/dev/stdin", 0);
            Ib("/dev/stdout", 1);
            Ib("/dev/stderr", 1);
          }
          lb = !1;
          Ia(va);
          Ia(wa);
          aa(d);
          d.onRuntimeInitialized?.();
          if (Zc) {
            var e = Uc;
            try {
              var f = e(0, 0);
              pa = f;
              Ub(f);
            } catch (h) {
              Tb(h);
            }
          }
          if (d.postRun)
            for (
              "function" == typeof d.postRun && (d.postRun = [d.postRun]);
              d.postRun.length;

            )
              (f = d.postRun.shift()), xa.unshift(f);
          Ia(xa);
        }
      }
      if (!(0 < B)) {
        if (d.preRun)
          for (
            "function" == typeof d.preRun && (d.preRun = [d.preRun]);
            d.preRun.length;

          )
            ya();
        Ia(ua);
        0 < B ||
          (d.setStatus
            ? (d.setStatus("Running..."),
              setTimeout(() => {
                setTimeout(() => d.setStatus(""), 1);
                a();
              }, 1))
            : a());
      }
    }
    if (d.preInit)
      for (
        "function" == typeof d.preInit && (d.preInit = [d.preInit]);
        0 < d.preInit.length;

      )
        d.preInit.pop()();
    var Zc = !0;
    d.noInitialRun && (Zc = !1);
    Yc();
    moduleRtn = ca;

    return moduleRtn;
  };
})();
export default Module;
