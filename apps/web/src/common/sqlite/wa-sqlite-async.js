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
      ha = "./this.program",
      g = "",
      ia,
      ja;
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
          (ja = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }),
        (ia = (a) =>
          fetch(a, { credentials: "same-origin" }).then((b) =>
            b.ok
              ? b.arrayBuffer()
              : Promise.reject(Error(b.status + " : " + b.url))
          ));
    var la = d.print || console.log.bind(console),
      r = d.printErr || console.error.bind(console);
    Object.assign(d, fa);
    fa = null;
    d.thisProgram && (ha = d.thisProgram);
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
    var za = 0,
      Aa = null,
      Ba = null;
    function B(a) {
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
    var Ca = (a) => a.startsWith("data:application/octet-stream;base64,"),
      Da;
    function Ea(a) {
      if (a == Da && ma) return new Uint8Array(ma);
      if (ja) return ja(a);
      throw "both async and sync fetching of the wasm failed";
    }
    function Fa(a) {
      return ma
        ? Promise.resolve().then(() => Ea(a))
        : ia(a).then(
            (b) => new Uint8Array(b),
            () => Ea(a)
          );
    }
    function Ga(a, b, c) {
      return Fa(a)
        .then((e) => WebAssembly.instantiate(e, b))
        .then(c, (e) => {
          r(`failed to asynchronously prepare wasm: ${e}`);
          B(e);
        });
    }
    function Ha(a, b) {
      var c = Da;
      return ma ||
        "function" != typeof WebAssembly.instantiateStreaming ||
        Ca(c) ||
        "function" != typeof fetch
        ? Ga(c, a, b)
        : fetch(c, { credentials: "same-origin" }).then((e) =>
            WebAssembly.instantiateStreaming(e, a).then(b, function (f) {
              r(`wasm streaming compile failed: ${f}`);
              r("falling back to ArrayBuffer instantiation");
              return Ga(c, a, b);
            })
          );
    }
    var C, D;
    class Ia {
      name = "ExitStatus";
      constructor(a) {
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
      }
    }
    var Ja = (a) => {
      for (; 0 < a.length; ) a.shift()(d);
    };
    function F(a, b = "i8") {
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
          B("to do getValue(i64) use WASM_BIGINT");
        case "float":
          return ra[a >> 2];
        case "double":
          return sa[a >> 3];
        case "*":
          return z[a >> 2];
        default:
          B(`invalid type for getValue: ${b}`);
      }
    }
    var Ka = d.noExitRuntime || !0;
    function H(a, b, c = "i8") {
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
          B("to do setValue(i64) use WASM_BIGINT");
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
          B(`invalid type for setValue: ${c}`);
      }
    }
    var La = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0,
      I = (a, b = 0, c = NaN) => {
        var e = b + c;
        for (c = b; a[c] && !(c >= e); ) ++c;
        if (16 < c - b && a.buffer && La) return La.decode(a.subarray(b, c));
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
      Ma = (a, b) => {
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
      Na = (a) => {
        var b = "/" === a.charAt(0),
          c = "/" === a.substr(-1);
        (a = Ma(
          a.split("/").filter((e) => !!e),
          !b
        ).join("/")) ||
          b ||
          (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      },
      Oa = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(a)
          .slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) return ".";
        b &&= b.substr(0, b.length - 1);
        return a + b;
      },
      Pa = (a) => {
        if ("/" === a) return "/";
        a = Na(a);
        a = a.replace(/\/$/, "");
        var b = a.lastIndexOf("/");
        return -1 === b ? a : a.substr(b + 1);
      },
      Qa = () => {
        if (
          "object" == typeof crypto &&
          "function" == typeof crypto.getRandomValues
        )
          return (a) => crypto.getRandomValues(a);
        B("initRandomDevice");
      },
      Ra = (a) => (Ra = Qa())(a),
      Sa = (...a) => {
        for (var b = "", c = !1, e = a.length - 1; -1 <= e && !c; e--) {
          c = 0 <= e ? a[e] : "/";
          if ("string" != typeof c)
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!c) return "";
          b = c + "/" + b;
          c = "/" === c.charAt(0);
        }
        b = Ma(
          b.split("/").filter((f) => !!f),
          !c
        ).join("/");
        return (c ? "/" : "") + b || ".";
      },
      Ta = [],
      Ua = (a) => {
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
      J = (a, b, c, e) => {
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
    function Va(a, b, c) {
      c = Array(0 < c ? c : Ua(a) + 1);
      a = J(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    var Wa = [];
    function Xa(a, b) {
      Wa[a] = { input: [], Tf: [], dg: b };
      Ya(a, Za);
    }
    var Za = {
        open(a) {
          var b = Wa[a.node.gg];
          if (!b) throw new K(43);
          a.Uf = b;
          a.seekable = !1;
        },
        close(a) {
          a.Uf.dg.jg(a.Uf);
        },
        jg(a) {
          a.Uf.dg.jg(a.Uf);
        },
        read(a, b, c, e) {
          if (!a.Uf || !a.Uf.dg.xg) throw new K(60);
          for (var f = 0, h = 0; h < e; h++) {
            try {
              var k = a.Uf.dg.xg(a.Uf);
            } catch (n) {
              throw new K(29);
            }
            if (void 0 === k && 0 === f) throw new K(6);
            if (null === k || void 0 === k) break;
            f++;
            b[c + h] = k;
          }
          f && (a.node.timestamp = Date.now());
          return f;
        },
        write(a, b, c, e) {
          if (!a.Uf || !a.Uf.dg.rg) throw new K(60);
          try {
            for (var f = 0; f < e; f++) a.Uf.dg.rg(a.Uf, b[c + f]);
          } catch (h) {
            throw new K(29);
          }
          e && (a.node.timestamp = Date.now());
          return f;
        }
      },
      $a = {
        xg() {
          a: {
            if (!Ta.length) {
              var a = null;
              "undefined" != typeof window &&
                "function" == typeof window.prompt &&
                ((a = window.prompt("Input: ")), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              Ta = Va(a, !0);
            }
            a = Ta.shift();
          }
          return a;
        },
        rg(a, b) {
          null === b || 10 === b
            ? (la(I(a.Tf)), (a.Tf = []))
            : 0 != b && a.Tf.push(b);
        },
        jg(a) {
          a.Tf && 0 < a.Tf.length && (la(I(a.Tf)), (a.Tf = []));
        },
        Zg() {
          return {
            Ug: 25856,
            Wg: 5,
            Tg: 191,
            Vg: 35387,
            Sg: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
          };
        },
        $g() {
          return 0;
        },
        ah() {
          return [24, 80];
        }
      },
      ab = {
        rg(a, b) {
          null === b || 10 === b
            ? (r(I(a.Tf)), (a.Tf = []))
            : 0 != b && a.Tf.push(b);
        },
        jg(a) {
          a.Tf && 0 < a.Tf.length && (r(I(a.Tf)), (a.Tf = []));
        }
      };
    function bb(a, b) {
      var c = a.Pf ? a.Pf.length : 0;
      c >= b ||
        ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
        0 != c && (b = Math.max(b, 256)),
        (c = a.Pf),
        (a.Pf = new Uint8Array(b)),
        0 < a.Rf && a.Pf.set(c.subarray(0, a.Rf), 0));
    }
    var M = {
        Xf: null,
        Wf() {
          return M.createNode(null, "/", 16895, 0);
        },
        createNode(a, b, c, e) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new K(63);
          M.Xf ||
            (M.Xf = {
              dir: {
                node: {
                  Vf: M.Nf.Vf,
                  Sf: M.Nf.Sf,
                  eg: M.Nf.eg,
                  kg: M.Nf.kg,
                  Cg: M.Nf.Cg,
                  pg: M.Nf.pg,
                  ng: M.Nf.ng,
                  Bg: M.Nf.Bg,
                  og: M.Nf.og
                },
                stream: { ag: M.Of.ag }
              },
              file: {
                node: { Vf: M.Nf.Vf, Sf: M.Nf.Sf },
                stream: {
                  ag: M.Of.ag,
                  read: M.Of.read,
                  write: M.Of.write,
                  ug: M.Of.ug,
                  lg: M.Of.lg,
                  mg: M.Of.mg
                }
              },
              link: {
                node: { Vf: M.Nf.Vf, Sf: M.Nf.Sf, hg: M.Nf.hg },
                stream: {}
              },
              vg: { node: { Vf: M.Nf.Vf, Sf: M.Nf.Sf }, stream: cb }
            });
          c = db(a, b, c, e);
          O(c.mode)
            ? ((c.Nf = M.Xf.dir.node), (c.Of = M.Xf.dir.stream), (c.Pf = {}))
            : 32768 === (c.mode & 61440)
            ? ((c.Nf = M.Xf.file.node),
              (c.Of = M.Xf.file.stream),
              (c.Rf = 0),
              (c.Pf = null))
            : 40960 === (c.mode & 61440)
            ? ((c.Nf = M.Xf.link.node), (c.Of = M.Xf.link.stream))
            : 8192 === (c.mode & 61440) &&
              ((c.Nf = M.Xf.vg.node), (c.Of = M.Xf.vg.stream));
          c.timestamp = Date.now();
          a && ((a.Pf[b] = c), (a.timestamp = c.timestamp));
          return c;
        },
        Yg(a) {
          return a.Pf
            ? a.Pf.subarray
              ? a.Pf.subarray(0, a.Rf)
              : new Uint8Array(a.Pf)
            : new Uint8Array(0);
        },
        Nf: {
          Vf(a) {
            var b = {};
            b.Ig = 8192 === (a.mode & 61440) ? a.id : 1;
            b.yg = a.id;
            b.mode = a.mode;
            b.Og = 1;
            b.uid = 0;
            b.Lg = 0;
            b.gg = a.gg;
            O(a.mode)
              ? (b.size = 4096)
              : 32768 === (a.mode & 61440)
              ? (b.size = a.Rf)
              : 40960 === (a.mode & 61440)
              ? (b.size = a.link.length)
              : (b.size = 0);
            b.Eg = new Date(a.timestamp);
            b.Ng = new Date(a.timestamp);
            b.Hg = new Date(a.timestamp);
            b.Fg = 4096;
            b.Gg = Math.ceil(b.size / b.Fg);
            return b;
          },
          Sf(a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            if (void 0 !== b.size && ((b = b.size), a.Rf != b))
              if (0 == b) (a.Pf = null), (a.Rf = 0);
              else {
                var c = a.Pf;
                a.Pf = new Uint8Array(b);
                c && a.Pf.set(c.subarray(0, Math.min(b, a.Rf)));
                a.Rf = b;
              }
          },
          eg() {
            throw eb[44];
          },
          kg(a, b, c, e) {
            return M.createNode(a, b, c, e);
          },
          Cg(a, b, c) {
            if (O(a.mode)) {
              try {
                var e = fb(b, c);
              } catch (h) {}
              if (e) for (var f in e.Pf) throw new K(55);
            }
            delete a.parent.Pf[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.Pf[c] = a;
            b.timestamp = a.parent.timestamp;
          },
          pg(a, b) {
            delete a.Pf[b];
            a.timestamp = Date.now();
          },
          ng(a, b) {
            var c = fb(a, b),
              e;
            for (e in c.Pf) throw new K(55);
            delete a.Pf[b];
            a.timestamp = Date.now();
          },
          Bg(a) {
            var b = [".", ".."],
              c;
            for (c of Object.keys(a.Pf)) b.push(c);
            return b;
          },
          og(a, b, c) {
            a = M.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          hg(a) {
            if (40960 !== (a.mode & 61440)) throw new K(28);
            return a.link;
          }
        },
        Of: {
          read(a, b, c, e, f) {
            var h = a.node.Pf;
            if (f >= a.node.Rf) return 0;
            a = Math.min(a.node.Rf - f, e);
            if (8 < a && h.subarray) b.set(h.subarray(f, f + a), c);
            else for (e = 0; e < a; e++) b[c + e] = h[f + e];
            return a;
          },
          write(a, b, c, e, f, h) {
            b.buffer === u.buffer && (h = !1);
            if (!e) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Pf || a.Pf.subarray)) {
              if (h) return (a.Pf = b.subarray(c, c + e)), (a.Rf = e);
              if (0 === a.Rf && 0 === f)
                return (a.Pf = b.slice(c, c + e)), (a.Rf = e);
              if (f + e <= a.Rf) return a.Pf.set(b.subarray(c, c + e), f), e;
            }
            bb(a, f + e);
            if (a.Pf.subarray && b.subarray) a.Pf.set(b.subarray(c, c + e), f);
            else for (h = 0; h < e; h++) a.Pf[f + h] = b[c + h];
            a.Rf = Math.max(a.Rf, f + e);
            return e;
          },
          ag(a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Rf);
            if (0 > b) throw new K(28);
            return b;
          },
          ug(a, b, c) {
            bb(a.node, b + c);
            a.node.Rf = Math.max(a.node.Rf, b + c);
          },
          lg(a, b, c, e, f) {
            if (32768 !== (a.node.mode & 61440)) throw new K(43);
            a = a.node.Pf;
            if (f & 2 || !a || a.buffer !== u.buffer) {
              f = !0;
              e = 65536 * Math.ceil(b / 65536);
              var h = gb(65536, e);
              h && v.fill(0, h, h + e);
              e = h;
              if (!e) throw new K(48);
              if (a) {
                if (0 < c || c + b < a.length)
                  a.subarray
                    ? (a = a.subarray(c, c + b))
                    : (a = Array.prototype.slice.call(a, c, c + b));
                u.set(a, e);
              }
            } else (f = !1), (e = a.byteOffset);
            return { Pg: e, Dg: f };
          },
          mg(a, b, c, e) {
            M.Of.write(a, b, 0, e, c, !1);
            return 0;
          }
        }
      },
      hb = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      ib = null,
      jb = {},
      kb = [],
      lb = 1,
      P = null,
      mb = !1,
      nb = !0,
      K = class {
        name = "ErrnoError";
        constructor(a) {
          this.Qf = a;
        }
      },
      eb = {},
      ob = {},
      pb = class {
        ig = {};
        node = null;
        get flags() {
          return this.ig.flags;
        }
        set flags(a) {
          this.ig.flags = a;
        }
        get position() {
          return this.ig.position;
        }
        set position(a) {
          this.ig.position = a;
        }
      },
      qb = class {
        Nf = {};
        Of = {};
        bg = null;
        constructor(a, b, c, e) {
          a ||= this;
          this.parent = a;
          this.Wf = a.Wf;
          this.id = lb++;
          this.name = b;
          this.mode = c;
          this.gg = e;
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
    function Q(a, b = {}) {
      a = Sa(a);
      if (!a) return { path: "", node: null };
      b = Object.assign({ wg: !0, sg: 0 }, b);
      if (8 < b.sg) throw new K(32);
      a = a.split("/").filter((k) => !!k);
      for (var c = ib, e = "/", f = 0; f < a.length; f++) {
        var h = f === a.length - 1;
        if (h && b.parent) break;
        c = fb(c, a[f]);
        e = Na(e + "/" + a[f]);
        c.bg && (!h || (h && b.wg)) && (c = c.bg.root);
        if (!h || b.$f)
          for (h = 0; 40960 === (c.mode & 61440); )
            if (
              ((c = rb(e)),
              (e = Sa(Oa(e), c)),
              (c = Q(e, { sg: b.sg + 1 }).node),
              40 < h++)
            )
              throw new K(32);
      }
      return { path: e, node: c };
    }
    function sb(a) {
      for (var b; ; ) {
        if (a === a.parent)
          return (
            (a = a.Wf.Ag),
            b ? ("/" !== a[a.length - 1] ? `${a}/${b}` : a + b) : a
          );
        b = b ? `${a.name}/${b}` : a.name;
        a = a.parent;
      }
    }
    function tb(a, b) {
      for (var c = 0, e = 0; e < b.length; e++)
        c = ((c << 5) - c + b.charCodeAt(e)) | 0;
      return ((a + c) >>> 0) % P.length;
    }
    function ub(a) {
      var b = tb(a.parent.id, a.name);
      if (P[b] === a) P[b] = a.cg;
      else
        for (b = P[b]; b; ) {
          if (b.cg === a) {
            b.cg = a.cg;
            break;
          }
          b = b.cg;
        }
    }
    function fb(a, b) {
      var c = O(a.mode) ? ((c = vb(a, "x")) ? c : a.Nf.eg ? 0 : 2) : 54;
      if (c) throw new K(c);
      for (c = P[tb(a.id, b)]; c; c = c.cg) {
        var e = c.name;
        if (c.parent.id === a.id && e === b) return c;
      }
      return a.Nf.eg(a, b);
    }
    function db(a, b, c, e) {
      a = new qb(a, b, c, e);
      b = tb(a.parent.id, a.name);
      a.cg = P[b];
      return (P[b] = a);
    }
    function O(a) {
      return 16384 === (a & 61440);
    }
    function wb(a) {
      var b = ["r", "w", "rw"][a & 3];
      a & 512 && (b += "w");
      return b;
    }
    function vb(a, b) {
      if (nb) return 0;
      if (!b.includes("r") || a.mode & 292) {
        if (
          (b.includes("w") && !(a.mode & 146)) ||
          (b.includes("x") && !(a.mode & 73))
        )
          return 2;
      } else return 2;
      return 0;
    }
    function xb(a, b) {
      try {
        return fb(a, b), 20;
      } catch (c) {}
      return vb(a, "wx");
    }
    function yb(a, b, c) {
      try {
        var e = fb(a, b);
      } catch (f) {
        return f.Qf;
      }
      if ((a = vb(a, "wx"))) return a;
      if (c) {
        if (!O(e.mode)) return 54;
        if (e === e.parent || "/" === sb(e)) return 10;
      } else if (O(e.mode)) return 31;
      return 0;
    }
    function R(a) {
      a = kb[a];
      if (!a) throw new K(8);
      return a;
    }
    function zb(a, b = -1) {
      a = Object.assign(new pb(), a);
      if (-1 == b)
        a: {
          for (b = 0; 4096 >= b; b++) if (!kb[b]) break a;
          throw new K(33);
        }
      a.Yf = b;
      return (kb[b] = a);
    }
    function Ab(a, b = -1) {
      a = zb(a, b);
      a.Of?.Xg?.(a);
      return a;
    }
    var cb = {
      open(a) {
        a.Of = jb[a.node.gg].Of;
        a.Of.open?.(a);
      },
      ag() {
        throw new K(70);
      }
    };
    function Ya(a, b) {
      jb[a] = { Of: b };
    }
    function Bb(a, b) {
      var c = "/" === b;
      if (c && ib) throw new K(10);
      if (!c && b) {
        var e = Q(b, { wg: !1 });
        b = e.path;
        e = e.node;
        if (e.bg) throw new K(10);
        if (!O(e.mode)) throw new K(54);
      }
      b = { type: a, bh: {}, Ag: b, Mg: [] };
      a = a.Wf(b);
      a.Wf = b;
      b.root = a;
      c ? (ib = a) : e && ((e.bg = b), e.Wf && e.Wf.Mg.push(b));
    }
    function Cb(a, b, c) {
      var e = Q(a, { parent: !0 }).node;
      a = Pa(a);
      if (!a || "." === a || ".." === a) throw new K(28);
      var f = xb(e, a);
      if (f) throw new K(f);
      if (!e.Nf.kg) throw new K(63);
      return e.Nf.kg(e, a, b, c);
    }
    function S(a, b) {
      return Cb(a, ((void 0 !== b ? b : 511) & 1023) | 16384, 0);
    }
    function Db(a, b, c) {
      "undefined" == typeof c && ((c = b), (b = 438));
      Cb(a, b | 8192, c);
    }
    function Eb(a, b) {
      if (!Sa(a)) throw new K(44);
      var c = Q(b, { parent: !0 }).node;
      if (!c) throw new K(44);
      b = Pa(b);
      var e = xb(c, b);
      if (e) throw new K(e);
      if (!c.Nf.og) throw new K(63);
      c.Nf.og(c, b, a);
    }
    function Fb(a) {
      var b = Q(a, { parent: !0 }).node;
      a = Pa(a);
      var c = fb(b, a),
        e = yb(b, a, !0);
      if (e) throw new K(e);
      if (!b.Nf.ng) throw new K(63);
      if (c.bg) throw new K(10);
      b.Nf.ng(b, a);
      ub(c);
    }
    function rb(a) {
      a = Q(a).node;
      if (!a) throw new K(44);
      if (!a.Nf.hg) throw new K(28);
      return Sa(sb(a.parent), a.Nf.hg(a));
    }
    function Gb(a, b) {
      a = Q(a, { $f: !b }).node;
      if (!a) throw new K(44);
      if (!a.Nf.Vf) throw new K(63);
      return a.Nf.Vf(a);
    }
    function Hb(a) {
      return Gb(a, !0);
    }
    function Ib(a, b) {
      a = "string" == typeof a ? Q(a, { $f: !0 }).node : a;
      if (!a.Nf.Sf) throw new K(63);
      a.Nf.Sf(a, {
        mode: (b & 4095) | (a.mode & -4096),
        timestamp: Date.now()
      });
    }
    function Jb(a, b) {
      if (0 > b) throw new K(28);
      a = "string" == typeof a ? Q(a, { $f: !0 }).node : a;
      if (!a.Nf.Sf) throw new K(63);
      if (O(a.mode)) throw new K(31);
      if (32768 !== (a.mode & 61440)) throw new K(28);
      var c = vb(a, "w");
      if (c) throw new K(c);
      a.Nf.Sf(a, { size: b, timestamp: Date.now() });
    }
    function Kb(a, b, c) {
      if ("" === a) throw new K(44);
      if ("string" == typeof b) {
        var e = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
        if ("undefined" == typeof e)
          throw Error(`Unknown file open mode: ${b}`);
        b = e;
      }
      c = b & 64 ? (("undefined" == typeof c ? 438 : c) & 4095) | 32768 : 0;
      if ("object" == typeof a) var f = a;
      else {
        a = Na(a);
        try {
          f = Q(a, { $f: !(b & 131072) }).node;
        } catch (h) {}
      }
      e = !1;
      if (b & 64)
        if (f) {
          if (b & 128) throw new K(20);
        } else (f = Cb(a, c, 0)), (e = !0);
      if (!f) throw new K(44);
      8192 === (f.mode & 61440) && (b &= -513);
      if (b & 65536 && !O(f.mode)) throw new K(54);
      if (
        !e &&
        (c = f
          ? 40960 === (f.mode & 61440)
            ? 32
            : O(f.mode) && ("r" !== wb(b) || b & 512)
            ? 31
            : vb(f, wb(b))
          : 44)
      )
        throw new K(c);
      b & 512 && !e && Jb(f, 0);
      b &= -131713;
      f = zb({
        node: f,
        path: sb(f),
        flags: b,
        seekable: !0,
        position: 0,
        Of: f.Of,
        Rg: [],
        error: !1
      });
      f.Of.open && f.Of.open(f);
      !d.logReadFiles || b & 1 || a in ob || (ob[a] = 1);
      return f;
    }
    function Lb(a, b, c) {
      if (null === a.Yf) throw new K(8);
      if (!a.seekable || !a.Of.ag) throw new K(70);
      if (0 != c && 1 != c && 2 != c) throw new K(28);
      a.position = a.Of.ag(a, b, c);
      a.Rg = [];
    }
    function T(a, b, c) {
      a = Na("/dev/" + a);
      var e = hb(!!b, !!c);
      T.zg ?? (T.zg = 64);
      var f = (T.zg++ << 8) | 0;
      Ya(f, {
        open(h) {
          h.seekable = !1;
        },
        close() {
          c?.buffer?.length && c(10);
        },
        read(h, k, n, l) {
          for (var m = 0, p = 0; p < l; p++) {
            try {
              var q = b();
            } catch (t) {
              throw new K(29);
            }
            if (void 0 === q && 0 === m) throw new K(6);
            if (null === q || void 0 === q) break;
            m++;
            k[n + p] = q;
          }
          m && (h.node.timestamp = Date.now());
          return m;
        },
        write(h, k, n, l) {
          for (var m = 0; m < l; m++)
            try {
              c(k[n + m]);
            } catch (p) {
              throw new K(29);
            }
          l && (h.node.timestamp = Date.now());
          return m;
        }
      });
      Db(a, e, f);
    }
    var U = {};
    function Mb(a, b, c) {
      if ("/" === b.charAt(0)) return b;
      a = -100 === a ? "/" : R(a).path;
      if (0 == b.length) {
        if (!c) throw new K(44);
        return a;
      }
      return Na(a + "/" + b);
    }
    function Nb(a, b, c) {
      a = a(b);
      x[c >> 2] = a.Ig;
      x[(c + 4) >> 2] = a.mode;
      z[(c + 8) >> 2] = a.Og;
      x[(c + 12) >> 2] = a.uid;
      x[(c + 16) >> 2] = a.Lg;
      x[(c + 20) >> 2] = a.gg;
      D = [
        a.size >>> 0,
        ((C = a.size),
        1 <= +Math.abs(C)
          ? 0 < C
            ? +Math.floor(C / 4294967296) >>> 0
            : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 24) >> 2] = D[0];
      x[(c + 28) >> 2] = D[1];
      x[(c + 32) >> 2] = 4096;
      x[(c + 36) >> 2] = a.Gg;
      b = a.Eg.getTime();
      var e = a.Ng.getTime(),
        f = a.Hg.getTime();
      D = [
        Math.floor(b / 1e3) >>> 0,
        ((C = Math.floor(b / 1e3)),
        1 <= +Math.abs(C)
          ? 0 < C
            ? +Math.floor(C / 4294967296) >>> 0
            : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 40) >> 2] = D[0];
      x[(c + 44) >> 2] = D[1];
      z[(c + 48) >> 2] = (b % 1e3) * 1e6;
      D = [
        Math.floor(e / 1e3) >>> 0,
        ((C = Math.floor(e / 1e3)),
        1 <= +Math.abs(C)
          ? 0 < C
            ? +Math.floor(C / 4294967296) >>> 0
            : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 56) >> 2] = D[0];
      x[(c + 60) >> 2] = D[1];
      z[(c + 64) >> 2] = (e % 1e3) * 1e6;
      D = [
        Math.floor(f / 1e3) >>> 0,
        ((C = Math.floor(f / 1e3)),
        1 <= +Math.abs(C)
          ? 0 < C
            ? +Math.floor(C / 4294967296) >>> 0
            : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 72) >> 2] = D[0];
      x[(c + 76) >> 2] = D[1];
      z[(c + 80) >> 2] = (f % 1e3) * 1e6;
      D = [
        a.yg >>> 0,
        ((C = a.yg),
        1 <= +Math.abs(C)
          ? 0 < C
            ? +Math.floor(C / 4294967296) >>> 0
            : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
          : 0)
      ];
      x[(c + 88) >> 2] = D[0];
      x[(c + 92) >> 2] = D[1];
      return 0;
    }
    var Ob = void 0,
      Pb = () => {
        var a = x[+Ob >> 2];
        Ob += 4;
        return a;
      },
      Qb = (a, b) =>
        (b + 2097152) >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN,
      Rb = 0,
      Sb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
      Tb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
      Ub = {},
      Vb = (a) => {
        if (!(a instanceof Ia || "unwind" == a)) throw a;
      },
      Wb = (a) => {
        pa = a;
        Ka || 0 < Rb || (d.onExit?.(a), (oa = !0));
        throw new Ia(a);
      },
      Xb = (a) => {
        if (!oa)
          try {
            if ((a(), !(Ka || 0 < Rb)))
              try {
                (pa = a = pa), Wb(a);
              } catch (b) {
                Vb(b);
              }
          } catch (b) {
            Vb(b);
          }
      },
      Yb = {},
      $b = () => {
        if (!Zb) {
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
              _: ha || "./this.program"
            },
            b;
          for (b in Yb) void 0 === Yb[b] ? delete a[b] : (a[b] = Yb[b]);
          var c = [];
          for (b in a) c.push(`${b}=${a[b]}`);
          Zb = c;
        }
        return Zb;
      },
      Zb;
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
    function Lc() {}
    function Mc() {}
    var Nc = (a) => {
      try {
        a();
      } catch (b) {
        B(b);
      }
    };
    function Oc() {
      var a = V,
        b = {};
      for (let [c, e] of Object.entries(a))
        b[c] =
          "function" == typeof e
            ? (...f) => {
                Pc.push(c);
                try {
                  return e(...f);
                } finally {
                  oa ||
                    (Pc.pop(),
                    W &&
                      1 === X &&
                      0 === Pc.length &&
                      ((X = 0),
                      Nc(Qc),
                      "undefined" != typeof Fibers && Fibers.eh()));
                }
              }
            : e;
      return b;
    }
    var X = 0,
      W = null,
      Rc = 0,
      Pc = [],
      Sc = {},
      Tc = {},
      Uc = 0,
      Vc = null,
      Wc = [];
    function Xc() {
      return new Promise((a, b) => {
        Vc = { resolve: a, reject: b };
      });
    }
    function Yc() {
      var a = Zc(16396),
        b = a + 12;
      z[a >> 2] = b;
      z[(a + 4) >> 2] = b + 16384;
      b = Pc[0];
      var c = Sc[b];
      void 0 === c && ((c = Uc++), (Sc[b] = c), (Tc[c] = b));
      x[(a + 8) >> 2] = c;
      return a;
    }
    function $c(a) {
      if (!oa) {
        if (0 === X) {
          var b = !1,
            c = !1;
          a((e = 0) => {
            if (!oa && ((Rc = e), (b = !0), c)) {
              X = 2;
              Nc(() => ad(W));
              "undefined" != typeof MainLoop &&
                MainLoop.Kg &&
                MainLoop.resume();
              e = !1;
              try {
                var f = (0, V[Tc[x[(W + 8) >> 2]]])();
              } catch (n) {
                (f = n), (e = !0);
              }
              var h = !1;
              if (!W) {
                var k = Vc;
                k && ((Vc = null), (e ? k.reject : k.resolve)(f), (h = !0));
              }
              if (e && !h) throw f;
            }
          });
          c = !0;
          b ||
            ((X = 1),
            (W = Yc()),
            "undefined" != typeof MainLoop && MainLoop.Kg && MainLoop.pause(),
            Nc(() => bd(W)));
        } else
          2 === X
            ? ((X = 0), Nc(cd), dd(W), (W = null), Wc.forEach(Xb))
            : B(`invalid state: ${X}`);
        return Rc;
      }
    }
    function ed(a) {
      return $c((b) => {
        a().then(b);
      });
    }
    var fd = {},
      gd,
      hd,
      jd = [],
      Z = (a, b, c, e, f) => {
        function h(q) {
          --Rb;
          0 !== l && kd(l);
          return "string" === b
            ? q
              ? I(v, q)
              : ""
            : "boolean" === b
            ? !!q
            : q;
        }
        var k = {
          string: (q) => {
            var t = 0;
            if (null !== q && void 0 !== q && 0 !== q) {
              t = Ua(q) + 1;
              var y = ld(t);
              J(q, v, y, t);
              t = y;
            }
            return t;
          },
          array: (q) => {
            var t = ld(q.length);
            u.set(q, t);
            return t;
          }
        };
        a = d["_" + a];
        var n = [],
          l = 0;
        if (e)
          for (var m = 0; m < e.length; m++) {
            var p = k[c[m]];
            p ? (0 === l && (l = md()), (n[m] = p(e[m]))) : (n[m] = e[m]);
          }
        c = W;
        e = a(...n);
        f = f?.async;
        Rb += 1;
        if (W != c) return Xc().then(h);
        e = h(e);
        return f ? Promise.resolve(e) : e;
      },
      nd =
        "undefined" != typeof TextDecoder
          ? new TextDecoder("utf-16le")
          : void 0;
    [44].forEach((a) => {
      eb[a] = new K(a);
      eb[a].stack = "<generic error, no stack>";
    });
    P = Array(4096);
    Bb(M, "/");
    S("/tmp");
    S("/home");
    S("/home/web_user");
    (function () {
      S("/dev");
      Ya(259, { read: () => 0, write: (e, f, h, k) => k });
      Db("/dev/null", 259);
      Xa(1280, $a);
      Xa(1536, ab);
      Db("/dev/tty", 1280);
      Db("/dev/tty1", 1536);
      var a = new Uint8Array(1024),
        b = 0,
        c = () => {
          0 === b && (b = Ra(a).byteLength);
          return a[--b];
        };
      T("random", c);
      T("urandom", c);
      S("/dev/shm");
      S("/dev/shm/tmp");
    })();
    (function () {
      S("/proc");
      var a = S("/proc/self");
      S("/proc/self/fd");
      Bb(
        {
          Wf() {
            var b = db(a, "fd", 16895, 73);
            b.Nf = {
              eg(c, e) {
                var f = R(+e);
                c = {
                  parent: null,
                  Wf: { Ag: "fake" },
                  Nf: { hg: () => f.path }
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
        c ? a.set(b, { f: c, tg: e }) : a.delete(b);
        return Z("set_authorizer", "number", ["number"], [b]);
      };
      ac = function (b, c, e, f, h, k) {
        if (a.has(b)) {
          const { f: n, tg: l } = a.get(b);
          return n(
            l,
            c,
            e ? (e ? I(v, e) : "") : null,
            f ? (f ? I(v, f) : "") : null,
            h ? (h ? I(v, h) : "") : null,
            k ? (k ? I(v, k) : "") : null
          );
        }
        return 0;
      };
    })();
    (function () {
      const a = new Map(),
        b = new Map();
      d.createFunction = function (c, e, f, h, k, n) {
        const l = a.size;
        a.set(l, { f: n, Zf: k });
        return Z(
          "create_function",
          "number",
          "number string number number number number".split(" "),
          [c, e, f, h, l, 0]
        );
      };
      d.createAggregate = function (c, e, f, h, k, n, l) {
        const m = a.size;
        a.set(m, { step: n, Jg: l, Zf: k });
        return Z(
          "create_function",
          "number",
          "number string number number number number".split(" "),
          [c, e, f, h, m, 1]
        );
      };
      d.getFunctionUserData = function (c) {
        return b.get(c);
      };
      cc = function (c, e, f, h) {
        c = a.get(c);
        b.set(e, c.Zf);
        c.f(e, new Uint32Array(v.buffer, h, f));
        b.delete(e);
      };
      ec = function (c, e, f, h) {
        c = a.get(c);
        b.set(e, c.Zf);
        c.step(e, new Uint32Array(v.buffer, h, f));
        b.delete(e);
      };
      bc = function (c, e) {
        c = a.get(c);
        b.set(e, c.Zf);
        c.Jg(e);
        b.delete(e);
      };
    })();
    (function () {
      const a = new Map();
      d.progressHandler = function (b, c, e, f) {
        e ? a.set(b, { f: e, tg: f }) : a.delete(b);
        return Z("progress_handler", null, ["number", "number"], [b, c]);
      };
      dc = function (b) {
        if (a.has(b)) {
          const { f: c, tg: e } = a.get(b);
          return c(e);
        }
        return 0;
      };
    })();
    (function () {
      function a(l, m) {
        const p = `get${l}`,
          q = `set${l}`;
        return new Proxy(new DataView(v.buffer, m, "Int32" === l ? 4 : 8), {
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
      const b = "object" === typeof fd,
        c = new Map(),
        e = new Map(),
        f = new Map(),
        h = b ? new Set() : null,
        k = b ? new Set() : null,
        n = new Map();
      vc = function (l, m, p, q) {
        n.set(l ? I(v, l) : "", {
          size: m,
          fg: Array.from(new Uint32Array(v.buffer, q, p))
        });
      };
      d.createModule = function (l, m, p, q) {
        b && (p.handleAsync = ed);
        const t = c.size;
        c.set(t, { module: p, Zf: q });
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
        return Z(
          "create_module",
          "number",
          ["number", "string", "number", "number"],
          [l, m, t, q]
        );
      };
      lc = function (l, m, p, q, t, y) {
        m = c.get(m);
        e.set(t, m);
        if (b) {
          h.delete(t);
          for (const A of h) e.delete(A);
        }
        q = Array.from(new Uint32Array(v.buffer, q, p)).map((A) =>
          A ? I(v, A) : ""
        );
        return m.module.xCreate(l, m.Zf, q, t, a("Int32", y));
      };
      kc = function (l, m, p, q, t, y) {
        m = c.get(m);
        e.set(t, m);
        if (b) {
          h.delete(t);
          for (const A of h) e.delete(A);
        }
        q = Array.from(new Uint32Array(v.buffer, q, p)).map((A) =>
          A ? I(v, A) : ""
        );
        return m.module.xConnect(l, m.Zf, q, t, a("Int32", y));
      };
      gc = function (l, m) {
        var p = e.get(l),
          q = n.get("sqlite3_index_info").fg;
        const t = {};
        t.nConstraint = F(m + q[0], "i32");
        t.aConstraint = [];
        var y = F(m + q[1], "*"),
          A = n.get("sqlite3_index_constraint").size;
        for (var G = 0; G < t.nConstraint; ++G) {
          var E = t.aConstraint,
            N = E.push,
            L = y + G * A,
            ka = n.get("sqlite3_index_constraint").fg,
            Y = {};
          Y.iColumn = F(L + ka[0], "i32");
          Y.op = F(L + ka[1], "i8");
          Y.usable = !!F(L + ka[2], "i8");
          N.call(E, Y);
        }
        t.nOrderBy = F(m + q[2], "i32");
        t.aOrderBy = [];
        y = F(m + q[3], "*");
        A = n.get("sqlite3_index_orderby").size;
        for (G = 0; G < t.nOrderBy; ++G)
          (E = t.aOrderBy),
            (N = E.push),
            (L = y + G * A),
            (ka = n.get("sqlite3_index_orderby").fg),
            (Y = {}),
            (Y.iColumn = F(L + ka[0], "i32")),
            (Y.desc = !!F(L + ka[1], "i8")),
            N.call(E, Y);
        t.aConstraintUsage = [];
        for (y = 0; y < t.nConstraint; ++y)
          t.aConstraintUsage.push({ argvIndex: 0, omit: !1 });
        t.idxNum = F(m + q[5], "i32");
        t.idxStr = null;
        t.orderByConsumed = !!F(m + q[8], "i8");
        t.estimatedCost = F(m + q[9], "double");
        t.estimatedRows = F(m + q[10], "i32");
        t.idxFlags = F(m + q[11], "i32");
        t.colUsed = F(m + q[12], "i32");
        l = p.module.xBestIndex(l, t);
        p = n.get("sqlite3_index_info").fg;
        q = F(m + p[4], "*");
        y = n.get("sqlite3_index_constraint_usage").size;
        for (N = 0; N < t.nConstraint; ++N)
          (A = q + N * y),
            (E = t.aConstraintUsage[N]),
            (L = n.get("sqlite3_index_constraint_usage").fg),
            H(A + L[0], E.argvIndex, "i32"),
            H(A + L[1], E.omit ? 1 : 0, "i8");
        H(m + p[5], t.idxNum, "i32");
        "string" === typeof t.idxStr &&
          ((q = Ua(t.idxStr)),
          (y = Z("sqlite3_malloc", "number", ["number"], [q + 1])),
          J(t.idxStr, v, y, q + 1),
          H(m + p[6], y, "*"),
          H(m + p[7], 1, "i32"));
        H(m + p[8], t.orderByConsumed, "i32");
        H(m + p[9], t.estimatedCost, "double");
        H(m + p[10], t.estimatedRows, "i32");
        H(m + p[11], t.idxFlags, "i32");
        return l;
      };
      nc = function (l) {
        const m = e.get(l);
        b ? h.add(l) : e.delete(l);
        return m.module.xDisconnect(l);
      };
      mc = function (l) {
        const m = e.get(l);
        b ? h.add(l) : e.delete(l);
        return m.module.xDestroy(l);
      };
      rc = function (l, m) {
        const p = e.get(l);
        f.set(m, p);
        if (b) {
          k.delete(m);
          for (const q of k) f.delete(q);
        }
        return p.module.xOpen(l, m);
      };
      hc = function (l) {
        const m = f.get(l);
        b ? k.add(l) : f.delete(l);
        return m.module.xClose(l);
      };
      oc = function (l) {
        return f.get(l).module.xEof(l) ? 1 : 0;
      };
      pc = function (l, m, p, q, t) {
        const y = f.get(l);
        p = p ? (p ? I(v, p) : "") : null;
        t = new Uint32Array(v.buffer, t, q);
        return y.module.xFilter(l, m, p, t);
      };
      qc = function (l) {
        return f.get(l).module.xNext(l);
      };
      ic = function (l, m, p) {
        return f.get(l).module.xColumn(l, m, p);
      };
      uc = function (l, m) {
        return f.get(l).module.xRowid(l, a("BigInt64", m));
      };
      xc = function (l, m, p, q) {
        const t = e.get(l);
        p = new Uint32Array(v.buffer, p, m);
        return t.module.xUpdate(l, p, a("BigInt64", q));
      };
      fc = function (l) {
        return e.get(l).module.xBegin(l);
      };
      wc = function (l) {
        return e.get(l).module.xSync(l);
      };
      jc = function (l) {
        return e.get(l).module.xCommit(l);
      };
      tc = function (l) {
        return e.get(l).module.xRollback(l);
      };
      sc = function (l, m) {
        const p = e.get(l);
        m = m ? I(v, m) : "";
        return p.module.xRename(l, m);
      };
    })();
    (function () {
      function a(h, k) {
        const n = `get${h}`,
          l = `set${h}`;
        return new Proxy(new DataView(v.buffer, k, "Int32" === h ? 4 : 8), {
          get(m, p) {
            if (p === n)
              return function (q, t) {
                if (!t) throw Error("must be little endian");
                return m[p](q, t);
              };
            if (p === l)
              return function (q, t, y) {
                if (!y) throw Error("must be little endian");
                return m[p](q, t, y);
              };
            if ("string" === typeof p && p.match(/^(get)|(set)/))
              throw Error("invalid type");
            return m[p];
          }
        });
      }
      const b = "object" === typeof fd;
      b && (d.handleAsync = ed);
      const c = new Map(),
        e = new Map();
      d.registerVFS = function (h, k) {
        if (Z("sqlite3_vfs_find", "number", ["string"], [h.name]))
          throw Error(`VFS '${h.name}' already registered`);
        b && (h.handleAsync = ed);
        var n = h.mxPathName ?? 64;
        const l = d._malloc(4);
        k = Z(
          "register_vfs",
          "number",
          ["string", "number", "number", "number"],
          [h.name, n, k ? 1 : 0, l]
        );
        k || ((n = F(l, "*")), c.set(n, h));
        d._free(l);
        return k;
      };
      const f = b ? new Set() : null;
      Ac = function (h) {
        const k = e.get(h);
        b ? f.add(h) : e.delete(h);
        return k.xClose(h);
      };
      Hc = function (h, k, n, l, m) {
        return e
          .get(h)
          .xRead(
            h,
            v.subarray(k, k + n),
            4294967296 * m + l + (0 > l ? 2 ** 32 : 0)
          );
      };
      Mc = function (h, k, n, l, m) {
        return e
          .get(h)
          .xWrite(
            h,
            v.subarray(k, k + n),
            4294967296 * m + l + (0 > l ? 2 ** 32 : 0)
          );
      };
      Kc = function (h, k, n) {
        return e
          .get(h)
          .xTruncate(h, 4294967296 * n + k + (0 > k ? 2 ** 32 : 0));
      };
      Jc = function (h, k) {
        return e.get(h).xSync(h, k);
      };
      Ec = function (h, k) {
        const n = e.get(h);
        k = a("BigInt64", k);
        return n.xFileSize(h, k);
      };
      Fc = function (h, k) {
        return e.get(h).xLock(h, k);
      };
      Lc = function (h, k) {
        return e.get(h).xUnlock(h, k);
      };
      zc = function (h, k) {
        const n = e.get(h);
        k = a("Int32", k);
        return n.xCheckReservedLock(h, k);
      };
      Dc = function (h, k, n) {
        const l = e.get(h);
        n = new DataView(v.buffer, n);
        return l.xFileControl(h, k, n);
      };
      Ic = function (h) {
        return e.get(h).xSectorSize(h);
      };
      Cc = function (h) {
        return e.get(h).xDeviceCharacteristics(h);
      };
      Gc = function (h, k, n, l, m) {
        h = c.get(h);
        e.set(n, h);
        if (b) {
          f.delete(n);
          for (var p of f) e.delete(p);
        }
        p = null;
        if (l & 64) {
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
        } else k && (p = k ? I(v, k) : "");
        m = a("Int32", m);
        return h.xOpen(p, n, l, m);
      };
      Bc = function (h, k, n) {
        return c.get(h).xDelete(k ? I(v, k) : "", n);
      };
      yc = function (h, k, n, l) {
        h = c.get(h);
        l = a("Int32", l);
        return h.xAccess(k ? I(v, k) : "", n, l);
      };
    })();
    var pd = {
        a: (a, b, c, e) => {
          B(
            `Assertion failed: ${a ? I(v, a) : ""}, at: ` +
              [
                b ? (b ? I(v, b) : "") : "unknown filename",
                c,
                e ? (e ? I(v, e) : "") : "unknown function"
              ]
          );
        },
        R: function (a, b) {
          try {
            return (a = a ? I(v, a) : ""), Ib(a, b), 0;
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return -c.Qf;
          }
        },
        U: function (a, b, c) {
          try {
            b = b ? I(v, b) : "";
            b = Mb(a, b);
            if (c & -8) return -28;
            var e = Q(b, { $f: !0 }).node;
            if (!e) return -44;
            a = "";
            c & 4 && (a += "r");
            c & 2 && (a += "w");
            c & 1 && (a += "x");
            return a && vb(e, a) ? -2 : 0;
          } catch (f) {
            if ("undefined" == typeof U || "ErrnoError" !== f.name) throw f;
            return -f.Qf;
          }
        },
        S: function (a, b) {
          try {
            var c = R(a);
            Ib(c.node, b);
            return 0;
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return -e.Qf;
          }
        },
        Q: function (a) {
          try {
            var b = R(a).node;
            var c = "string" == typeof b ? Q(b, { $f: !0 }).node : b;
            if (!c.Nf.Sf) throw new K(63);
            c.Nf.Sf(c, { timestamp: Date.now() });
            return 0;
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return -e.Qf;
          }
        },
        b: function (a, b, c) {
          Ob = c;
          try {
            var e = R(a);
            switch (b) {
              case 0:
                var f = Pb();
                if (0 > f) break;
                for (; kb[f]; ) f++;
                return Ab(e, f).Yf;
              case 1:
              case 2:
                return 0;
              case 3:
                return e.flags;
              case 4:
                return (f = Pb()), (e.flags |= f), 0;
              case 12:
                return (f = Pb()), (w[(f + 0) >> 1] = 2), 0;
              case 13:
              case 14:
                return 0;
            }
            return -28;
          } catch (h) {
            if ("undefined" == typeof U || "ErrnoError" !== h.name) throw h;
            return -h.Qf;
          }
        },
        P: function (a, b) {
          try {
            var c = R(a);
            return Nb(Gb, c.path, b);
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return -e.Qf;
          }
        },
        m: function (a, b, c) {
          b = Qb(b, c);
          try {
            if (isNaN(b)) return 61;
            var e = R(a);
            if (0 === (e.flags & 2097155)) throw new K(28);
            Jb(e.node, b);
            return 0;
          } catch (f) {
            if ("undefined" == typeof U || "ErrnoError" !== f.name) throw f;
            return -f.Qf;
          }
        },
        J: function (a, b) {
          try {
            if (0 === b) return -28;
            var c = Ua("/") + 1;
            if (b < c) return -68;
            J("/", v, a, b);
            return c;
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return -e.Qf;
          }
        },
        N: function (a, b) {
          try {
            return (a = a ? I(v, a) : ""), Nb(Hb, a, b);
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return -c.Qf;
          }
        },
        F: function (a, b, c) {
          try {
            return (
              (b = b ? I(v, b) : ""),
              (b = Mb(a, b)),
              (b = Na(b)),
              "/" === b[b.length - 1] && (b = b.substr(0, b.length - 1)),
              S(b, c),
              0
            );
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return -e.Qf;
          }
        },
        M: function (a, b, c, e) {
          try {
            b = b ? I(v, b) : "";
            var f = e & 256;
            b = Mb(a, b, e & 4096);
            return Nb(f ? Hb : Gb, b, c);
          } catch (h) {
            if ("undefined" == typeof U || "ErrnoError" !== h.name) throw h;
            return -h.Qf;
          }
        },
        D: function (a, b, c, e) {
          Ob = e;
          try {
            b = b ? I(v, b) : "";
            b = Mb(a, b);
            var f = e ? Pb() : 0;
            return Kb(b, c, f).Yf;
          } catch (h) {
            if ("undefined" == typeof U || "ErrnoError" !== h.name) throw h;
            return -h.Qf;
          }
        },
        B: function (a, b, c, e) {
          try {
            b = b ? I(v, b) : "";
            b = Mb(a, b);
            if (0 >= e) return -28;
            var f = rb(b),
              h = Math.min(e, Ua(f)),
              k = u[c + h];
            J(f, v, c, e + 1);
            u[c + h] = k;
            return h;
          } catch (n) {
            if ("undefined" == typeof U || "ErrnoError" !== n.name) throw n;
            return -n.Qf;
          }
        },
        z: function (a) {
          try {
            return (a = a ? I(v, a) : ""), Fb(a), 0;
          } catch (b) {
            if ("undefined" == typeof U || "ErrnoError" !== b.name) throw b;
            return -b.Qf;
          }
        },
        O: function (a, b) {
          try {
            return (a = a ? I(v, a) : ""), Nb(Gb, a, b);
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return -c.Qf;
          }
        },
        x: function (a, b, c) {
          try {
            b = b ? I(v, b) : "";
            b = Mb(a, b);
            if (0 === c) {
              a = b;
              var e = Q(a, { parent: !0 }).node;
              if (!e) throw new K(44);
              var f = Pa(a),
                h = fb(e, f),
                k = yb(e, f, !1);
              if (k) throw new K(k);
              if (!e.Nf.pg) throw new K(63);
              if (h.bg) throw new K(10);
              e.Nf.pg(e, f);
              ub(h);
            } else 512 === c ? Fb(b) : B("Invalid flags passed to unlinkat");
            return 0;
          } catch (n) {
            if ("undefined" == typeof U || "ErrnoError" !== n.name) throw n;
            return -n.Qf;
          }
        },
        w: function (a, b, c) {
          try {
            b = b ? I(v, b) : "";
            b = Mb(a, b, !0);
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
              var l = Q(b, { $f: !0 }).node;
              l.Nf.Sf(l, { timestamp: Math.max(a, n) });
            }
            return 0;
          } catch (m) {
            if ("undefined" == typeof U || "ErrnoError" !== m.name) throw m;
            return -m.Qf;
          }
        },
        V: () => {
          B("");
        },
        s: () => {
          Ka = !1;
          Rb = 0;
        },
        k: function (a, b, c) {
          a = new Date(1e3 * Qb(a, b));
          x[c >> 2] = a.getSeconds();
          x[(c + 4) >> 2] = a.getMinutes();
          x[(c + 8) >> 2] = a.getHours();
          x[(c + 12) >> 2] = a.getDate();
          x[(c + 16) >> 2] = a.getMonth();
          x[(c + 20) >> 2] = a.getFullYear() - 1900;
          x[(c + 24) >> 2] = a.getDay();
          b = a.getFullYear();
          x[(c + 28) >> 2] =
            ((0 !== b % 4 || (0 === b % 100 && 0 !== b % 400) ? Tb : Sb)[
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
          f = Qb(f, h);
          try {
            if (isNaN(f)) return 61;
            var l = R(e);
            if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (l.flags & 2097155))
              throw new K(2);
            if (1 === (l.flags & 2097155)) throw new K(2);
            if (!l.Of.lg) throw new K(43);
            if (!a) throw new K(28);
            var m = l.Of.lg(l, a, f, b, c);
            var p = m.Pg;
            x[k >> 2] = m.Dg;
            z[n >> 2] = p;
            return 0;
          } catch (q) {
            if ("undefined" == typeof U || "ErrnoError" !== q.name) throw q;
            return -q.Qf;
          }
        },
        j: function (a, b, c, e, f, h, k) {
          h = Qb(h, k);
          try {
            var n = R(f);
            if (c & 2) {
              if (32768 !== (n.node.mode & 61440)) throw new K(43);
              e & 2 || (n.Of.mg && n.Of.mg(n, v.slice(a, a + b), h, b, e));
            }
          } catch (l) {
            if ("undefined" == typeof U || "ErrnoError" !== l.name) throw l;
            return -l.Qf;
          }
        },
        t: (a, b) => {
          Ub[a] && (clearTimeout(Ub[a].id), delete Ub[a]);
          if (!b) return 0;
          var c = setTimeout(() => {
            delete Ub[a];
            Xb(() => od(a, performance.now()));
          }, b);
          Ub[a] = { id: c, dh: b };
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
            ? (J(a, v, c, 17), J(b, v, e, 17))
            : (J(a, v, e, 17), J(b, v, c, 17));
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
          $b().forEach((e, f) => {
            var h = b + c;
            f = z[(a + 4 * f) >> 2] = h;
            for (h = 0; h < e.length; ++h) u[f++] = e.charCodeAt(h);
            u[f] = 0;
            c += e.length + 1;
          });
          return 0;
        },
        H: (a, b) => {
          var c = $b();
          z[a >> 2] = c.length;
          var e = 0;
          c.forEach((f) => (e += f.length + 1));
          z[b >> 2] = e;
          return 0;
        },
        f: function (a) {
          try {
            var b = R(a);
            if (null === b.Yf) throw new K(8);
            b.qg && (b.qg = null);
            try {
              b.Of.close && b.Of.close(b);
            } catch (c) {
              throw c;
            } finally {
              kb[b.Yf] = null;
            }
            b.Yf = null;
            return 0;
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return c.Qf;
          }
        },
        v: function (a, b) {
          try {
            var c = R(a);
            u[b] = c.Uf
              ? 2
              : O(c.mode)
              ? 3
              : 40960 === (c.mode & 61440)
              ? 7
              : 4;
            w[(b + 2) >> 1] = 0;
            D = [
              0,
              ((C = 0),
              1 <= +Math.abs(C)
                ? 0 < C
                  ? +Math.floor(C / 4294967296) >>> 0
                  : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[(b + 8) >> 2] = D[0];
            x[(b + 12) >> 2] = D[1];
            D = [
              0,
              ((C = 0),
              1 <= +Math.abs(C)
                ? 0 < C
                  ? +Math.floor(C / 4294967296) >>> 0
                  : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[(b + 16) >> 2] = D[0];
            x[(b + 20) >> 2] = D[1];
            return 0;
          } catch (e) {
            if ("undefined" == typeof U || "ErrnoError" !== e.name) throw e;
            return e.Qf;
          }
        },
        C: function (a, b, c, e) {
          try {
            a: {
              var f = R(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var n = z[a >> 2],
                  l = z[(a + 4) >> 2];
                a += 8;
                var m = f,
                  p = h,
                  q = u;
                if (0 > l || 0 > p) throw new K(28);
                if (null === m.Yf) throw new K(8);
                if (1 === (m.flags & 2097155)) throw new K(8);
                if (O(m.node.mode)) throw new K(31);
                if (!m.Of.read) throw new K(28);
                var t = "undefined" != typeof p;
                if (!t) p = m.position;
                else if (!m.seekable) throw new K(70);
                var y = m.Of.read(m, q, n, l, p);
                t || (m.position += y);
                var A = y;
                if (0 > A) {
                  var G = -1;
                  break a;
                }
                b += A;
                if (A < l) break;
                "undefined" != typeof h && (h += A);
              }
              G = b;
            }
            z[e >> 2] = G;
            return 0;
          } catch (E) {
            if ("undefined" == typeof U || "ErrnoError" !== E.name) throw E;
            return E.Qf;
          }
        },
        l: function (a, b, c, e, f) {
          b = Qb(b, c);
          try {
            if (isNaN(b)) return 61;
            var h = R(a);
            Lb(h, b, e);
            D = [
              h.position >>> 0,
              ((C = h.position),
              1 <= +Math.abs(C)
                ? 0 < C
                  ? +Math.floor(C / 4294967296) >>> 0
                  : ~~+Math.ceil((C - +(~~C >>> 0)) / 4294967296) >>> 0
                : 0)
            ];
            x[f >> 2] = D[0];
            x[(f + 4) >> 2] = D[1];
            h.qg && 0 === b && 0 === e && (h.qg = null);
            return 0;
          } catch (k) {
            if ("undefined" == typeof U || "ErrnoError" !== k.name) throw k;
            return k.Qf;
          }
        },
        K: function (a) {
          try {
            var b = R(a);
            return $c((c) => {
              var e = b.node.Wf;
              e.type.Qg
                ? e.type.Qg(e, !1, (f) => {
                    f ? c(29) : c(0);
                  })
                : c(0);
            });
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return c.Qf;
          }
        },
        y: function (a, b, c, e) {
          try {
            a: {
              var f = R(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var n = z[a >> 2],
                  l = z[(a + 4) >> 2];
                a += 8;
                var m = f,
                  p = n,
                  q = l,
                  t = h,
                  y = u;
                if (0 > q || 0 > t) throw new K(28);
                if (null === m.Yf) throw new K(8);
                if (0 === (m.flags & 2097155)) throw new K(8);
                if (O(m.node.mode)) throw new K(31);
                if (!m.Of.write) throw new K(28);
                m.seekable && m.flags & 1024 && Lb(m, 0, 2);
                var A = "undefined" != typeof t;
                if (!A) t = m.position;
                else if (!m.seekable) throw new K(70);
                var G = m.Of.write(m, y, p, q, t, void 0);
                A || (m.position += G);
                var E = G;
                if (0 > E) {
                  var N = -1;
                  break a;
                }
                b += E;
                if (E < l) break;
                "undefined" != typeof h && (h += E);
              }
              N = b;
            }
            z[e >> 2] = N;
            return 0;
          } catch (L) {
            if ("undefined" == typeof U || "ErrnoError" !== L.name) throw L;
            return L.Qf;
          }
        },
        wa: ac,
        T: bc,
        la: cc,
        ha: dc,
        ba: ec,
        qa: fc,
        L: gc,
        h: hc,
        ta: ic,
        oa: jc,
        ja: kc,
        ka: lc,
        p: mc,
        A: nc,
        ua: oc,
        g: pc,
        va: qc,
        ia: rc,
        ma: sc,
        na: tc,
        sa: uc,
        c: vc,
        pa: wc,
        ra: xc,
        r: Wb,
        I: function (a, b) {
          try {
            return Ra(v.subarray(a, a + b)), 0;
          } catch (c) {
            if ("undefined" == typeof U || "ErrnoError" !== c.name) throw c;
            return c.Qf;
          }
        },
        fa: yc,
        _: zc,
        ea: Ac,
        ga: Bc,
        X: Cc,
        Z: Dc,
        ca: Ec,
        aa: Fc,
        W: Gc,
        q: Hc,
        Y: Ic,
        da: Jc,
        n: Kc,
        $: Lc,
        o: Mc
      },
      V = (function () {
        function a(c) {
          V = c.exports;
          V = Oc();
          na = V.xa;
          ta();
          gd = V.Cf;
          va.unshift(V.ya);
          za--;
          d.monitorRunDependencies?.(za);
          0 == za &&
            (null !== Aa && (clearInterval(Aa), (Aa = null)),
            Ba && ((c = Ba), (Ba = null), c()));
          return V;
        }
        var b = { a: pd };
        za++;
        d.monitorRunDependencies?.(za);
        if (d.instantiateWasm)
          try {
            return d.instantiateWasm(b, a);
          } catch (c) {
            r(`Module.instantiateWasm callback failed with error: ${c}`), ba(c);
          }
        Da ??= d.locateFile
          ? Ca("wa-sqlite-async.wasm")
            ? "wa-sqlite-async.wasm"
            : d.locateFile
            ? d.locateFile("wa-sqlite-async.wasm", g)
            : g + "wa-sqlite-async.wasm"
          : new URL("wa-sqlite-async.wasm", import.meta.url).href;
        Ha(b, function (c) {
          a(c.instance);
        }).catch(ba);
        return {};
      })();
    d._sqlite3_status64 = (a, b, c, e) =>
      (d._sqlite3_status64 = V.za)(a, b, c, e);
    d._sqlite3_status = (a, b, c, e) => (d._sqlite3_status = V.Aa)(a, b, c, e);
    d._sqlite3_db_status = (a, b, c, e, f) =>
      (d._sqlite3_db_status = V.Ba)(a, b, c, e, f);
    d._sqlite3_msize = (a) => (d._sqlite3_msize = V.Ca)(a);
    d._sqlite3_vfs_find = (a) => (d._sqlite3_vfs_find = V.Da)(a);
    d._sqlite3_vfs_register = (a, b) => (d._sqlite3_vfs_register = V.Ea)(a, b);
    d._sqlite3_vfs_unregister = (a) => (d._sqlite3_vfs_unregister = V.Fa)(a);
    d._sqlite3_release_memory = (a) => (d._sqlite3_release_memory = V.Ga)(a);
    d._sqlite3_soft_heap_limit64 = (a, b) =>
      (d._sqlite3_soft_heap_limit64 = V.Ha)(a, b);
    d._sqlite3_memory_used = () => (d._sqlite3_memory_used = V.Ia)();
    d._sqlite3_hard_heap_limit64 = (a, b) =>
      (d._sqlite3_hard_heap_limit64 = V.Ja)(a, b);
    d._sqlite3_memory_highwater = (a) =>
      (d._sqlite3_memory_highwater = V.Ka)(a);
    d._sqlite3_malloc = (a) => (d._sqlite3_malloc = V.La)(a);
    d._sqlite3_malloc64 = (a, b) => (d._sqlite3_malloc64 = V.Ma)(a, b);
    d._sqlite3_free = (a) => (d._sqlite3_free = V.Na)(a);
    d._sqlite3_realloc = (a, b) => (d._sqlite3_realloc = V.Oa)(a, b);
    d._sqlite3_realloc64 = (a, b, c) => (d._sqlite3_realloc64 = V.Pa)(a, b, c);
    d._sqlite3_str_vappendf = (a, b, c) =>
      (d._sqlite3_str_vappendf = V.Qa)(a, b, c);
    d._sqlite3_str_append = (a, b, c) =>
      (d._sqlite3_str_append = V.Ra)(a, b, c);
    d._sqlite3_str_appendchar = (a, b, c) =>
      (d._sqlite3_str_appendchar = V.Sa)(a, b, c);
    d._sqlite3_str_appendall = (a, b) =>
      (d._sqlite3_str_appendall = V.Ta)(a, b);
    d._sqlite3_str_appendf = (a, b, c) =>
      (d._sqlite3_str_appendf = V.Ua)(a, b, c);
    d._sqlite3_str_finish = (a) => (d._sqlite3_str_finish = V.Va)(a);
    d._sqlite3_str_errcode = (a) => (d._sqlite3_str_errcode = V.Wa)(a);
    d._sqlite3_str_length = (a) => (d._sqlite3_str_length = V.Xa)(a);
    d._sqlite3_str_value = (a) => (d._sqlite3_str_value = V.Ya)(a);
    d._sqlite3_str_reset = (a) => (d._sqlite3_str_reset = V.Za)(a);
    d._sqlite3_str_new = (a) => (d._sqlite3_str_new = V._a)(a);
    d._sqlite3_vmprintf = (a, b) => (d._sqlite3_vmprintf = V.$a)(a, b);
    d._sqlite3_mprintf = (a, b) => (d._sqlite3_mprintf = V.ab)(a, b);
    d._sqlite3_vsnprintf = (a, b, c, e) =>
      (d._sqlite3_vsnprintf = V.bb)(a, b, c, e);
    d._sqlite3_snprintf = (a, b, c, e) =>
      (d._sqlite3_snprintf = V.cb)(a, b, c, e);
    d._sqlite3_log = (a, b, c) => (d._sqlite3_log = V.db)(a, b, c);
    d._sqlite3_randomness = (a, b) => (d._sqlite3_randomness = V.eb)(a, b);
    d._sqlite3_stricmp = (a, b) => (d._sqlite3_stricmp = V.fb)(a, b);
    d._sqlite3_strnicmp = (a, b, c) => (d._sqlite3_strnicmp = V.gb)(a, b, c);
    d._sqlite3_os_init = () => (d._sqlite3_os_init = V.hb)();
    d._sqlite3_os_end = () => (d._sqlite3_os_end = V.ib)();
    d._sqlite3_serialize = (a, b, c, e) =>
      (d._sqlite3_serialize = V.jb)(a, b, c, e);
    d._sqlite3_prepare_v2 = (a, b, c, e, f) =>
      (d._sqlite3_prepare_v2 = V.kb)(a, b, c, e, f);
    d._sqlite3_step = (a) => (d._sqlite3_step = V.lb)(a);
    d._sqlite3_column_int64 = (a, b) => (d._sqlite3_column_int64 = V.mb)(a, b);
    d._sqlite3_reset = (a) => (d._sqlite3_reset = V.nb)(a);
    d._sqlite3_exec = (a, b, c, e, f) =>
      (d._sqlite3_exec = V.ob)(a, b, c, e, f);
    d._sqlite3_column_int = (a, b) => (d._sqlite3_column_int = V.pb)(a, b);
    d._sqlite3_finalize = (a) => (d._sqlite3_finalize = V.qb)(a);
    d._sqlite3_deserialize = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_deserialize = V.rb)(a, b, c, e, f, h, k, n);
    d._sqlite3_database_file_object = (a) =>
      (d._sqlite3_database_file_object = V.sb)(a);
    d._sqlite3_backup_init = (a, b, c, e) =>
      (d._sqlite3_backup_init = V.tb)(a, b, c, e);
    d._sqlite3_backup_step = (a, b) => (d._sqlite3_backup_step = V.ub)(a, b);
    d._sqlite3_backup_finish = (a) => (d._sqlite3_backup_finish = V.vb)(a);
    d._sqlite3_backup_remaining = (a) =>
      (d._sqlite3_backup_remaining = V.wb)(a);
    d._sqlite3_backup_pagecount = (a) =>
      (d._sqlite3_backup_pagecount = V.xb)(a);
    d._sqlite3_clear_bindings = (a) => (d._sqlite3_clear_bindings = V.yb)(a);
    d._sqlite3_value_blob = (a) => (d._sqlite3_value_blob = V.zb)(a);
    d._sqlite3_value_text = (a) => (d._sqlite3_value_text = V.Ab)(a);
    d._sqlite3_value_bytes = (a) => (d._sqlite3_value_bytes = V.Bb)(a);
    d._sqlite3_value_bytes16 = (a) => (d._sqlite3_value_bytes16 = V.Cb)(a);
    d._sqlite3_value_double = (a) => (d._sqlite3_value_double = V.Db)(a);
    d._sqlite3_value_int = (a) => (d._sqlite3_value_int = V.Eb)(a);
    d._sqlite3_value_int64 = (a) => (d._sqlite3_value_int64 = V.Fb)(a);
    d._sqlite3_value_subtype = (a) => (d._sqlite3_value_subtype = V.Gb)(a);
    d._sqlite3_value_pointer = (a, b) =>
      (d._sqlite3_value_pointer = V.Hb)(a, b);
    d._sqlite3_value_text16 = (a) => (d._sqlite3_value_text16 = V.Ib)(a);
    d._sqlite3_value_text16be = (a) => (d._sqlite3_value_text16be = V.Jb)(a);
    d._sqlite3_value_text16le = (a) => (d._sqlite3_value_text16le = V.Kb)(a);
    d._sqlite3_value_type = (a) => (d._sqlite3_value_type = V.Lb)(a);
    d._sqlite3_value_encoding = (a) => (d._sqlite3_value_encoding = V.Mb)(a);
    d._sqlite3_value_nochange = (a) => (d._sqlite3_value_nochange = V.Nb)(a);
    d._sqlite3_value_frombind = (a) => (d._sqlite3_value_frombind = V.Ob)(a);
    d._sqlite3_value_dup = (a) => (d._sqlite3_value_dup = V.Pb)(a);
    d._sqlite3_value_free = (a) => (d._sqlite3_value_free = V.Qb)(a);
    d._sqlite3_result_blob = (a, b, c, e) =>
      (d._sqlite3_result_blob = V.Rb)(a, b, c, e);
    d._sqlite3_result_blob64 = (a, b, c, e, f) =>
      (d._sqlite3_result_blob64 = V.Sb)(a, b, c, e, f);
    d._sqlite3_result_double = (a, b) =>
      (d._sqlite3_result_double = V.Tb)(a, b);
    d._sqlite3_result_error = (a, b, c) =>
      (d._sqlite3_result_error = V.Ub)(a, b, c);
    d._sqlite3_result_error16 = (a, b, c) =>
      (d._sqlite3_result_error16 = V.Vb)(a, b, c);
    d._sqlite3_result_int = (a, b) => (d._sqlite3_result_int = V.Wb)(a, b);
    d._sqlite3_result_int64 = (a, b, c) =>
      (d._sqlite3_result_int64 = V.Xb)(a, b, c);
    d._sqlite3_result_null = (a) => (d._sqlite3_result_null = V.Yb)(a);
    d._sqlite3_result_pointer = (a, b, c, e) =>
      (d._sqlite3_result_pointer = V.Zb)(a, b, c, e);
    d._sqlite3_result_subtype = (a, b) =>
      (d._sqlite3_result_subtype = V._b)(a, b);
    d._sqlite3_result_text = (a, b, c, e) =>
      (d._sqlite3_result_text = V.$b)(a, b, c, e);
    d._sqlite3_result_text64 = (a, b, c, e, f, h) =>
      (d._sqlite3_result_text64 = V.ac)(a, b, c, e, f, h);
    d._sqlite3_result_text16 = (a, b, c, e) =>
      (d._sqlite3_result_text16 = V.bc)(a, b, c, e);
    d._sqlite3_result_text16be = (a, b, c, e) =>
      (d._sqlite3_result_text16be = V.cc)(a, b, c, e);
    d._sqlite3_result_text16le = (a, b, c, e) =>
      (d._sqlite3_result_text16le = V.dc)(a, b, c, e);
    d._sqlite3_result_value = (a, b) => (d._sqlite3_result_value = V.ec)(a, b);
    d._sqlite3_result_error_toobig = (a) =>
      (d._sqlite3_result_error_toobig = V.fc)(a);
    d._sqlite3_result_zeroblob = (a, b) =>
      (d._sqlite3_result_zeroblob = V.gc)(a, b);
    d._sqlite3_result_zeroblob64 = (a, b, c) =>
      (d._sqlite3_result_zeroblob64 = V.hc)(a, b, c);
    d._sqlite3_result_error_code = (a, b) =>
      (d._sqlite3_result_error_code = V.ic)(a, b);
    d._sqlite3_result_error_nomem = (a) =>
      (d._sqlite3_result_error_nomem = V.jc)(a);
    d._sqlite3_user_data = (a) => (d._sqlite3_user_data = V.kc)(a);
    d._sqlite3_context_db_handle = (a) =>
      (d._sqlite3_context_db_handle = V.lc)(a);
    d._sqlite3_vtab_nochange = (a) => (d._sqlite3_vtab_nochange = V.mc)(a);
    d._sqlite3_vtab_in_first = (a, b) =>
      (d._sqlite3_vtab_in_first = V.nc)(a, b);
    d._sqlite3_vtab_in_next = (a, b) => (d._sqlite3_vtab_in_next = V.oc)(a, b);
    d._sqlite3_aggregate_context = (a, b) =>
      (d._sqlite3_aggregate_context = V.pc)(a, b);
    d._sqlite3_get_auxdata = (a, b) => (d._sqlite3_get_auxdata = V.qc)(a, b);
    d._sqlite3_set_auxdata = (a, b, c, e) =>
      (d._sqlite3_set_auxdata = V.rc)(a, b, c, e);
    d._sqlite3_column_count = (a) => (d._sqlite3_column_count = V.sc)(a);
    d._sqlite3_data_count = (a) => (d._sqlite3_data_count = V.tc)(a);
    d._sqlite3_column_blob = (a, b) => (d._sqlite3_column_blob = V.uc)(a, b);
    d._sqlite3_column_bytes = (a, b) => (d._sqlite3_column_bytes = V.vc)(a, b);
    d._sqlite3_column_bytes16 = (a, b) =>
      (d._sqlite3_column_bytes16 = V.wc)(a, b);
    d._sqlite3_column_double = (a, b) =>
      (d._sqlite3_column_double = V.xc)(a, b);
    d._sqlite3_column_text = (a, b) => (d._sqlite3_column_text = V.yc)(a, b);
    d._sqlite3_column_value = (a, b) => (d._sqlite3_column_value = V.zc)(a, b);
    d._sqlite3_column_text16 = (a, b) =>
      (d._sqlite3_column_text16 = V.Ac)(a, b);
    d._sqlite3_column_type = (a, b) => (d._sqlite3_column_type = V.Bc)(a, b);
    d._sqlite3_column_name = (a, b) => (d._sqlite3_column_name = V.Cc)(a, b);
    d._sqlite3_column_name16 = (a, b) =>
      (d._sqlite3_column_name16 = V.Dc)(a, b);
    d._sqlite3_bind_blob = (a, b, c, e, f) =>
      (d._sqlite3_bind_blob = V.Ec)(a, b, c, e, f);
    d._sqlite3_bind_blob64 = (a, b, c, e, f, h) =>
      (d._sqlite3_bind_blob64 = V.Fc)(a, b, c, e, f, h);
    d._sqlite3_bind_double = (a, b, c) =>
      (d._sqlite3_bind_double = V.Gc)(a, b, c);
    d._sqlite3_bind_int = (a, b, c) => (d._sqlite3_bind_int = V.Hc)(a, b, c);
    d._sqlite3_bind_int64 = (a, b, c, e) =>
      (d._sqlite3_bind_int64 = V.Ic)(a, b, c, e);
    d._sqlite3_bind_null = (a, b) => (d._sqlite3_bind_null = V.Jc)(a, b);
    d._sqlite3_bind_pointer = (a, b, c, e, f) =>
      (d._sqlite3_bind_pointer = V.Kc)(a, b, c, e, f);
    d._sqlite3_bind_text = (a, b, c, e, f) =>
      (d._sqlite3_bind_text = V.Lc)(a, b, c, e, f);
    d._sqlite3_bind_text64 = (a, b, c, e, f, h, k) =>
      (d._sqlite3_bind_text64 = V.Mc)(a, b, c, e, f, h, k);
    d._sqlite3_bind_text16 = (a, b, c, e, f) =>
      (d._sqlite3_bind_text16 = V.Nc)(a, b, c, e, f);
    d._sqlite3_bind_value = (a, b, c) =>
      (d._sqlite3_bind_value = V.Oc)(a, b, c);
    d._sqlite3_bind_zeroblob = (a, b, c) =>
      (d._sqlite3_bind_zeroblob = V.Pc)(a, b, c);
    d._sqlite3_bind_zeroblob64 = (a, b, c, e) =>
      (d._sqlite3_bind_zeroblob64 = V.Qc)(a, b, c, e);
    d._sqlite3_bind_parameter_count = (a) =>
      (d._sqlite3_bind_parameter_count = V.Rc)(a);
    d._sqlite3_bind_parameter_name = (a, b) =>
      (d._sqlite3_bind_parameter_name = V.Sc)(a, b);
    d._sqlite3_bind_parameter_index = (a, b) =>
      (d._sqlite3_bind_parameter_index = V.Tc)(a, b);
    d._sqlite3_db_handle = (a) => (d._sqlite3_db_handle = V.Uc)(a);
    d._sqlite3_stmt_readonly = (a) => (d._sqlite3_stmt_readonly = V.Vc)(a);
    d._sqlite3_stmt_isexplain = (a) => (d._sqlite3_stmt_isexplain = V.Wc)(a);
    d._sqlite3_stmt_explain = (a, b) => (d._sqlite3_stmt_explain = V.Xc)(a, b);
    d._sqlite3_stmt_busy = (a) => (d._sqlite3_stmt_busy = V.Yc)(a);
    d._sqlite3_next_stmt = (a, b) => (d._sqlite3_next_stmt = V.Zc)(a, b);
    d._sqlite3_stmt_status = (a, b, c) =>
      (d._sqlite3_stmt_status = V._c)(a, b, c);
    d._sqlite3_sql = (a) => (d._sqlite3_sql = V.$c)(a);
    d._sqlite3_expanded_sql = (a) => (d._sqlite3_expanded_sql = V.ad)(a);
    d._sqlite3_value_numeric_type = (a) =>
      (d._sqlite3_value_numeric_type = V.bd)(a);
    d._sqlite3_blob_open = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_blob_open = V.cd)(a, b, c, e, f, h, k, n);
    d._sqlite3_blob_close = (a) => (d._sqlite3_blob_close = V.dd)(a);
    d._sqlite3_blob_read = (a, b, c, e) =>
      (d._sqlite3_blob_read = V.ed)(a, b, c, e);
    d._sqlite3_blob_write = (a, b, c, e) =>
      (d._sqlite3_blob_write = V.fd)(a, b, c, e);
    d._sqlite3_blob_bytes = (a) => (d._sqlite3_blob_bytes = V.gd)(a);
    d._sqlite3_blob_reopen = (a, b, c) =>
      (d._sqlite3_blob_reopen = V.hd)(a, b, c);
    d._sqlite3_set_authorizer = (a, b, c) =>
      (d._sqlite3_set_authorizer = V.id)(a, b, c);
    d._sqlite3_strglob = (a, b) => (d._sqlite3_strglob = V.jd)(a, b);
    d._sqlite3_strlike = (a, b, c) => (d._sqlite3_strlike = V.kd)(a, b, c);
    d._sqlite3_errmsg = (a) => (d._sqlite3_errmsg = V.ld)(a);
    d._sqlite3_auto_extension = (a) => (d._sqlite3_auto_extension = V.md)(a);
    d._sqlite3_cancel_auto_extension = (a) =>
      (d._sqlite3_cancel_auto_extension = V.nd)(a);
    d._sqlite3_reset_auto_extension = () =>
      (d._sqlite3_reset_auto_extension = V.od)();
    d._sqlite3_prepare = (a, b, c, e, f) =>
      (d._sqlite3_prepare = V.pd)(a, b, c, e, f);
    d._sqlite3_prepare_v3 = (a, b, c, e, f, h) =>
      (d._sqlite3_prepare_v3 = V.qd)(a, b, c, e, f, h);
    d._sqlite3_prepare16 = (a, b, c, e, f) =>
      (d._sqlite3_prepare16 = V.rd)(a, b, c, e, f);
    d._sqlite3_prepare16_v2 = (a, b, c, e, f) =>
      (d._sqlite3_prepare16_v2 = V.sd)(a, b, c, e, f);
    d._sqlite3_prepare16_v3 = (a, b, c, e, f, h) =>
      (d._sqlite3_prepare16_v3 = V.td)(a, b, c, e, f, h);
    d._sqlite3_get_table = (a, b, c, e, f, h) =>
      (d._sqlite3_get_table = V.ud)(a, b, c, e, f, h);
    d._sqlite3_free_table = (a) => (d._sqlite3_free_table = V.vd)(a);
    d._sqlite3_create_module = (a, b, c, e) =>
      (d._sqlite3_create_module = V.wd)(a, b, c, e);
    d._sqlite3_create_module_v2 = (a, b, c, e, f) =>
      (d._sqlite3_create_module_v2 = V.xd)(a, b, c, e, f);
    d._sqlite3_drop_modules = (a, b) => (d._sqlite3_drop_modules = V.yd)(a, b);
    d._sqlite3_declare_vtab = (a, b) => (d._sqlite3_declare_vtab = V.zd)(a, b);
    d._sqlite3_vtab_on_conflict = (a) =>
      (d._sqlite3_vtab_on_conflict = V.Ad)(a);
    d._sqlite3_vtab_config = (a, b, c) =>
      (d._sqlite3_vtab_config = V.Bd)(a, b, c);
    d._sqlite3_vtab_collation = (a, b) =>
      (d._sqlite3_vtab_collation = V.Cd)(a, b);
    d._sqlite3_vtab_in = (a, b, c) => (d._sqlite3_vtab_in = V.Dd)(a, b, c);
    d._sqlite3_vtab_rhs_value = (a, b, c) =>
      (d._sqlite3_vtab_rhs_value = V.Ed)(a, b, c);
    d._sqlite3_vtab_distinct = (a) => (d._sqlite3_vtab_distinct = V.Fd)(a);
    d._sqlite3_keyword_name = (a, b, c) =>
      (d._sqlite3_keyword_name = V.Gd)(a, b, c);
    d._sqlite3_keyword_count = () => (d._sqlite3_keyword_count = V.Hd)();
    d._sqlite3_keyword_check = (a, b) =>
      (d._sqlite3_keyword_check = V.Id)(a, b);
    d._sqlite3_complete = (a) => (d._sqlite3_complete = V.Jd)(a);
    d._sqlite3_complete16 = (a) => (d._sqlite3_complete16 = V.Kd)(a);
    d._sqlite3_libversion = () => (d._sqlite3_libversion = V.Ld)();
    d._sqlite3_libversion_number = () =>
      (d._sqlite3_libversion_number = V.Md)();
    d._sqlite3_threadsafe = () => (d._sqlite3_threadsafe = V.Nd)();
    d._sqlite3_initialize = () => (d._sqlite3_initialize = V.Od)();
    d._sqlite3_shutdown = () => (d._sqlite3_shutdown = V.Pd)();
    d._sqlite3_config = (a, b) => (d._sqlite3_config = V.Qd)(a, b);
    d._sqlite3_db_mutex = (a) => (d._sqlite3_db_mutex = V.Rd)(a);
    d._sqlite3_db_release_memory = (a) =>
      (d._sqlite3_db_release_memory = V.Sd)(a);
    d._sqlite3_db_cacheflush = (a) => (d._sqlite3_db_cacheflush = V.Td)(a);
    d._sqlite3_db_config = (a, b, c) => (d._sqlite3_db_config = V.Ud)(a, b, c);
    d._sqlite3_last_insert_rowid = (a) =>
      (d._sqlite3_last_insert_rowid = V.Vd)(a);
    d._sqlite3_set_last_insert_rowid = (a, b, c) =>
      (d._sqlite3_set_last_insert_rowid = V.Wd)(a, b, c);
    d._sqlite3_changes64 = (a) => (d._sqlite3_changes64 = V.Xd)(a);
    d._sqlite3_changes = (a) => (d._sqlite3_changes = V.Yd)(a);
    d._sqlite3_total_changes64 = (a) => (d._sqlite3_total_changes64 = V.Zd)(a);
    d._sqlite3_total_changes = (a) => (d._sqlite3_total_changes = V._d)(a);
    d._sqlite3_txn_state = (a, b) => (d._sqlite3_txn_state = V.$d)(a, b);
    d._sqlite3_close = (a) => (d._sqlite3_close = V.ae)(a);
    d._sqlite3_close_v2 = (a) => (d._sqlite3_close_v2 = V.be)(a);
    d._sqlite3_busy_handler = (a, b, c) =>
      (d._sqlite3_busy_handler = V.ce)(a, b, c);
    d._sqlite3_progress_handler = (a, b, c, e) =>
      (d._sqlite3_progress_handler = V.de)(a, b, c, e);
    d._sqlite3_busy_timeout = (a, b) => (d._sqlite3_busy_timeout = V.ee)(a, b);
    d._sqlite3_interrupt = (a) => (d._sqlite3_interrupt = V.fe)(a);
    d._sqlite3_is_interrupted = (a) => (d._sqlite3_is_interrupted = V.ge)(a);
    d._sqlite3_create_function = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_create_function = V.he)(a, b, c, e, f, h, k, n);
    d._sqlite3_create_function_v2 = (a, b, c, e, f, h, k, n, l) =>
      (d._sqlite3_create_function_v2 = V.ie)(a, b, c, e, f, h, k, n, l);
    d._sqlite3_create_window_function = (a, b, c, e, f, h, k, n, l, m) =>
      (d._sqlite3_create_window_function = V.je)(a, b, c, e, f, h, k, n, l, m);
    d._sqlite3_create_function16 = (a, b, c, e, f, h, k, n) =>
      (d._sqlite3_create_function16 = V.ke)(a, b, c, e, f, h, k, n);
    d._sqlite3_overload_function = (a, b, c) =>
      (d._sqlite3_overload_function = V.le)(a, b, c);
    d._sqlite3_trace_v2 = (a, b, c, e) =>
      (d._sqlite3_trace_v2 = V.me)(a, b, c, e);
    d._sqlite3_commit_hook = (a, b, c) =>
      (d._sqlite3_commit_hook = V.ne)(a, b, c);
    d._sqlite3_update_hook = (a, b, c) =>
      (d._sqlite3_update_hook = V.oe)(a, b, c);
    d._sqlite3_rollback_hook = (a, b, c) =>
      (d._sqlite3_rollback_hook = V.pe)(a, b, c);
    d._sqlite3_autovacuum_pages = (a, b, c, e) =>
      (d._sqlite3_autovacuum_pages = V.qe)(a, b, c, e);
    d._sqlite3_wal_autocheckpoint = (a, b) =>
      (d._sqlite3_wal_autocheckpoint = V.re)(a, b);
    d._sqlite3_wal_hook = (a, b, c) => (d._sqlite3_wal_hook = V.se)(a, b, c);
    d._sqlite3_wal_checkpoint_v2 = (a, b, c, e, f) =>
      (d._sqlite3_wal_checkpoint_v2 = V.te)(a, b, c, e, f);
    d._sqlite3_wal_checkpoint = (a, b) =>
      (d._sqlite3_wal_checkpoint = V.ue)(a, b);
    d._sqlite3_error_offset = (a) => (d._sqlite3_error_offset = V.ve)(a);
    d._sqlite3_errmsg16 = (a) => (d._sqlite3_errmsg16 = V.we)(a);
    d._sqlite3_errcode = (a) => (d._sqlite3_errcode = V.xe)(a);
    d._sqlite3_extended_errcode = (a) =>
      (d._sqlite3_extended_errcode = V.ye)(a);
    d._sqlite3_system_errno = (a) => (d._sqlite3_system_errno = V.ze)(a);
    d._sqlite3_errstr = (a) => (d._sqlite3_errstr = V.Ae)(a);
    d._sqlite3_limit = (a, b, c) => (d._sqlite3_limit = V.Be)(a, b, c);
    d._sqlite3_open = (a, b) => (d._sqlite3_open = V.Ce)(a, b);
    d._sqlite3_open_v2 = (a, b, c, e) =>
      (d._sqlite3_open_v2 = V.De)(a, b, c, e);
    d._sqlite3_open16 = (a, b) => (d._sqlite3_open16 = V.Ee)(a, b);
    d._sqlite3_create_collation = (a, b, c, e, f) =>
      (d._sqlite3_create_collation = V.Fe)(a, b, c, e, f);
    d._sqlite3_create_collation_v2 = (a, b, c, e, f, h) =>
      (d._sqlite3_create_collation_v2 = V.Ge)(a, b, c, e, f, h);
    d._sqlite3_create_collation16 = (a, b, c, e, f) =>
      (d._sqlite3_create_collation16 = V.He)(a, b, c, e, f);
    d._sqlite3_collation_needed = (a, b, c) =>
      (d._sqlite3_collation_needed = V.Ie)(a, b, c);
    d._sqlite3_collation_needed16 = (a, b, c) =>
      (d._sqlite3_collation_needed16 = V.Je)(a, b, c);
    d._sqlite3_get_clientdata = (a, b) =>
      (d._sqlite3_get_clientdata = V.Ke)(a, b);
    d._sqlite3_set_clientdata = (a, b, c, e) =>
      (d._sqlite3_set_clientdata = V.Le)(a, b, c, e);
    d._sqlite3_get_autocommit = (a) => (d._sqlite3_get_autocommit = V.Me)(a);
    d._sqlite3_table_column_metadata = (a, b, c, e, f, h, k, n, l) =>
      (d._sqlite3_table_column_metadata = V.Ne)(a, b, c, e, f, h, k, n, l);
    d._sqlite3_sleep = (a) => (d._sqlite3_sleep = V.Oe)(a);
    d._sqlite3_extended_result_codes = (a, b) =>
      (d._sqlite3_extended_result_codes = V.Pe)(a, b);
    d._sqlite3_file_control = (a, b, c, e) =>
      (d._sqlite3_file_control = V.Qe)(a, b, c, e);
    d._sqlite3_test_control = (a, b) => (d._sqlite3_test_control = V.Re)(a, b);
    d._sqlite3_create_filename = (a, b, c, e, f) =>
      (d._sqlite3_create_filename = V.Se)(a, b, c, e, f);
    d._sqlite3_free_filename = (a) => (d._sqlite3_free_filename = V.Te)(a);
    d._sqlite3_uri_parameter = (a, b) =>
      (d._sqlite3_uri_parameter = V.Ue)(a, b);
    d._sqlite3_uri_key = (a, b) => (d._sqlite3_uri_key = V.Ve)(a, b);
    d._sqlite3_uri_boolean = (a, b, c) =>
      (d._sqlite3_uri_boolean = V.We)(a, b, c);
    d._sqlite3_uri_int64 = (a, b, c, e) =>
      (d._sqlite3_uri_int64 = V.Xe)(a, b, c, e);
    d._sqlite3_filename_database = (a) =>
      (d._sqlite3_filename_database = V.Ye)(a);
    d._sqlite3_filename_journal = (a) =>
      (d._sqlite3_filename_journal = V.Ze)(a);
    d._sqlite3_filename_wal = (a) => (d._sqlite3_filename_wal = V._e)(a);
    d._sqlite3_db_name = (a, b) => (d._sqlite3_db_name = V.$e)(a, b);
    d._sqlite3_db_filename = (a, b) => (d._sqlite3_db_filename = V.af)(a, b);
    d._sqlite3_db_readonly = (a, b) => (d._sqlite3_db_readonly = V.bf)(a, b);
    d._sqlite3_compileoption_used = (a) =>
      (d._sqlite3_compileoption_used = V.cf)(a);
    d._sqlite3_compileoption_get = (a) =>
      (d._sqlite3_compileoption_get = V.df)(a);
    d._sqlite3_sourceid = () => (d._sqlite3_sourceid = V.ef)();
    d._sqlite3mc_config = (a, b, c) => (d._sqlite3mc_config = V.ff)(a, b, c);
    d._sqlite3mc_cipher_count = () => (d._sqlite3mc_cipher_count = V.gf)();
    d._sqlite3mc_cipher_index = (a) => (d._sqlite3mc_cipher_index = V.hf)(a);
    d._sqlite3mc_cipher_name = (a) => (d._sqlite3mc_cipher_name = V.jf)(a);
    d._sqlite3mc_config_cipher = (a, b, c, e) =>
      (d._sqlite3mc_config_cipher = V.kf)(a, b, c, e);
    d._sqlite3mc_codec_data = (a, b, c) =>
      (d._sqlite3mc_codec_data = V.lf)(a, b, c);
    d._sqlite3_key = (a, b, c) => (d._sqlite3_key = V.mf)(a, b, c);
    d._sqlite3_key_v2 = (a, b, c, e) => (d._sqlite3_key_v2 = V.nf)(a, b, c, e);
    d._sqlite3_rekey_v2 = (a, b, c, e) =>
      (d._sqlite3_rekey_v2 = V.of)(a, b, c, e);
    d._sqlite3_rekey = (a, b, c) => (d._sqlite3_rekey = V.pf)(a, b, c);
    d._sqlite3mc_register_cipher = (a, b, c) =>
      (d._sqlite3mc_register_cipher = V.qf)(a, b, c);
    var Zc = (d._malloc = (a) => (Zc = d._malloc = V.rf)(a)),
      dd = (d._free = (a) => (dd = d._free = V.sf)(a));
    d._RegisterExtensionFunctions = (a) =>
      (d._RegisterExtensionFunctions = V.tf)(a);
    d._sqlite3Fts5BetterTrigramInit = (a) =>
      (d._sqlite3Fts5BetterTrigramInit = V.uf)(a);
    d._set_authorizer = (a) => (d._set_authorizer = V.vf)(a);
    d._create_function = (a, b, c, e, f, h) =>
      (d._create_function = V.wf)(a, b, c, e, f, h);
    d._create_module = (a, b, c, e) => (d._create_module = V.xf)(a, b, c, e);
    d._progress_handler = (a, b) => (d._progress_handler = V.yf)(a, b);
    d._register_vfs = (a, b, c, e) => (d._register_vfs = V.zf)(a, b, c, e);
    d._getSqliteFree = () => (d._getSqliteFree = V.Af)();
    var qd = (d._main = (a, b) => (qd = d._main = V.Bf)(a, b)),
      gb = (a, b) => (gb = V.Df)(a, b),
      od = (a, b) => (od = V.Ef)(a, b),
      rd = () => (rd = V.Ff)(),
      kd = (a) => (kd = V.Gf)(a),
      ld = (a) => (ld = V.Hf)(a),
      md = () => (md = V.If)(),
      bd = (a) => (bd = V.Jf)(a),
      Qc = () => (Qc = V.Kf)(),
      ad = (a) => (ad = V.Lf)(a),
      cd = () => (cd = V.Mf)();
    d._sqlite3_version = 5472;
    d.getTempRet0 = () => rd();
    d.ccall = Z;
    d.cwrap = (a, b, c, e) => {
      var f = !c || c.every((h) => "number" === h || "boolean" === h);
      return "string" !== b && f && !e
        ? d["_" + a]
        : (...h) => Z(a, b, c, h, e);
    };
    d.addFunction = (a, b) => {
      if (!hd) {
        hd = new WeakMap();
        var c = gd.length;
        if (hd)
          for (var e = 0; e < 0 + c; e++) {
            var f = gd.get(e);
            f && hd.set(f, e);
          }
      }
      if ((c = hd.get(a) || 0)) return c;
      if (jd.length) c = jd.pop();
      else {
        try {
          gd.grow(1);
        } catch (n) {
          if (!(n instanceof RangeError)) throw n;
          throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
        }
        c = gd.length - 1;
      }
      try {
        gd.set(c, a);
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
        gd.set(c, b);
      }
      hd.set(a, c);
      return c;
    };
    d.setValue = H;
    d.getValue = F;
    d.UTF8ToString = (a, b) => (a ? I(v, a, b) : "");
    d.stringToUTF8 = (a, b, c) => J(a, v, b, c);
    d.lengthBytesUTF8 = Ua;
    d.intArrayFromString = Va;
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
      if (32 < c - a && nd) return nd.decode(v.subarray(a, c));
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
    var sd;
    Ba = function td() {
      sd || ud();
      sd || (Ba = td);
    };
    function ud() {
      function a() {
        if (!sd && ((sd = !0), (d.calledRun = !0), !oa)) {
          if (!d.noFSInit && !mb) {
            var b, c;
            mb = !0;
            e ??= d.stdin;
            b ??= d.stdout;
            c ??= d.stderr;
            e ? T("stdin", e) : Eb("/dev/tty", "/dev/stdin");
            b ? T("stdout", null, b) : Eb("/dev/tty", "/dev/stdout");
            c ? T("stderr", null, c) : Eb("/dev/tty1", "/dev/stderr");
            Kb("/dev/stdin", 0);
            Kb("/dev/stdout", 1);
            Kb("/dev/stderr", 1);
          }
          nb = !1;
          Ja(va);
          Ja(wa);
          aa(d);
          d.onRuntimeInitialized?.();
          if (vd) {
            var e = qd;
            try {
              var f = e(0, 0);
              pa = f;
              Wb(f);
            } catch (h) {
              Vb(h);
            }
          }
          if (d.postRun)
            for (
              "function" == typeof d.postRun && (d.postRun = [d.postRun]);
              d.postRun.length;

            )
              (f = d.postRun.shift()), xa.unshift(f);
          Ja(xa);
        }
      }
      if (!(0 < za)) {
        if (d.preRun)
          for (
            "function" == typeof d.preRun && (d.preRun = [d.preRun]);
            d.preRun.length;

          )
            ya();
        Ja(ua);
        0 < za ||
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
    var vd = !0;
    d.noInitialRun && (vd = !1);
    ud();
    moduleRtn = ca;

    return moduleRtn;
  };
})();
export default Module;
