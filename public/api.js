/* Ozone API client — shared across pages.
   Loaded as a plain <script src="/api.js"></script> (no module). */
(function (global) {
  var API_BASE = "https://ozone-api.zhilingtech.com/api/v1";
  var TOKEN_KEY = "ozone_token";
  var USER_KEY = "ozone_user";
  var SESSION_KEY = "ozone_session";

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }
  function setToken(t) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }
  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setUser(u) {
    try {
      if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        // Keep legacy session shape so existing auth-guards keep working.
        var name = u.name || u.fullName || u.email || "User";
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ name: name, loggedIn: true })
        );
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {}
  }
  function clearSession() {
    setToken(null);
    setUser(null);
  }

  // Strip a common envelope { code, msg, data } if present, otherwise return as-is.
  function unwrap(json) {
    if (json && typeof json === "object" && "data" in json &&
        ("code" in json || "msg" in json || "message" in json)) {
      return json.data;
    }
    return json;
  }

  function pickToken(payload) {
    if (!payload || typeof payload !== "object") return "";
    return (
      payload.token ||
      payload.accessToken ||
      payload.access_token ||
      (payload.data && (payload.data.token || payload.data.accessToken)) ||
      ""
    );
  }

  function pickUser(payload) {
    if (!payload || typeof payload !== "object") return null;
    if (payload.user) return payload.user;
    if (payload.data && payload.data.user) return payload.data.user;
    // If payload itself looks like a user (has email or name), use it.
    if (payload.email || payload.name) return payload;
    return null;
  }

  async function request(path, opts) {
    opts = opts || {};
    var headers = Object.assign(
      { "Content-Type": "application/json", Accept: "application/json" },
      opts.headers || {}
    );
    if (opts.auth) {
      var t = getToken();
      if (t) headers.Authorization = "Bearer " + t;
    }
    var res;
    try {
      res = await fetch(API_BASE + path, {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) {
      throw new Error("Network error. Please check your connection.");
    }
    var text = await res.text();
    var json = null;
    if (text) {
      try { json = JSON.parse(text); } catch (e) { json = null; }
    }
    if (!res.ok) {
      var msg =
        (json && (json.message || json.msg || json.error)) ||
        (typeof json === "string" ? json : "") ||
        ("Request failed (" + res.status + ")");
      var err = new Error(msg);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return unwrap(json);
  }

  async function login(email, password) {
    var data = await request("/auth/login", {
      method: "POST",
      body: { email: email, password: password },
    });
    var token = pickToken(data);
    if (token) setToken(token);
    var user = pickUser(data);
    if (!user && token) {
      try { user = await me(); } catch (e) { user = null; }
    }
    if (user) setUser(user);
    return { token: token, user: user };
  }

  async function apply(payload) {
    return request("/auth/apply", { method: "POST", body: payload });
  }

  async function joinUs(payload) {
    return request("/join-us", { method: "POST", body: payload });
  }

  async function me() {
    var data = await request("/user/me", { auth: true });
    var user = pickUser(data) || data;
    if (user) setUser(user);
    return user;
  }

  function logout() {
    clearSession();
  }

  global.OzoneAPI = {
    BASE: API_BASE,
    login: login,
    apply: apply,
    joinUs: joinUs,
    me: me,
    logout: logout,
    getToken: getToken,
    getUser: getUser,
    clearSession: clearSession,
    isLoggedIn: function () { return !!getToken(); },
  };
})(window);
