// This code maybe reusable

function gotodir(url) {
  window.location.href = url;
}

class DB {
  constructor(key, engine = 'l') {
    this._key = key;
    if (engine == 's') this.engine = sessionStorage;
    else this.engine = localStorage;
  }
  get(condition = null) {
    const data = JSON.parse(this.engine.getItem(this._key));
    if (condition == null) {
      return data;
    } else {
      if (typeof condition === 'object') {
        const map = data.filter(r => {
          let flag = true;
          for (let c in condition) {
            flag = r[c] === condition[c];
            if (!flag) break;
          }
          if (flag) return r;
        });
        return map;
      }
      return null;
    }
  }
  set(value, replace = true) {
    if (replace) {
      if (typeof value === 'object') value = JSON.stringify(value);
      else if (typeof value !== 'string') value = String(value);

      this.engine.setItem(this._key, value);
    } else {
      let j = this.get();
      if (j == null) this.set(value, true);
      else {
        if (j.length) {
          if (value.length) {
            value.forEach(_ => j.push(_));
          }
          else j.push(value);
        } else {
          for (let k in value) {
            j[k] = value[k];
          }
        }
        this.set(j, true);
      }
    }
  }
  update(condition, value) {
    condition = condition || {};
    const data = this.get(condition);
    if (data != null && data.length) {
      if (typeof value === 'object') {
        const nupdates = [];
        data.forEach(upd => {
          for (let c in value) {
            upd[c] = value[c];
          }
          nupdates.push(upd);
        });
        this.remove(condition);
        this.set(nupdates, false);
      }
    }
  }
  remove(condition = null) {
    if (condition == null) {
      this.engine.removeItem(this._key);
    } else {
      const rdocs = this.get();
      const ndocs = [];
      rdocs.forEach(doc => {
        let flag = true;
        for (let c in condition) {
          flag = doc[c] === condition[c];
          if (!flag) break;
        }
        if (!flag) ndocs.push(doc);
      });
      this.set(ndocs, true);
    }
  }
  sort(object, order = 1, condition = null) {
    const data = this.get(condition);
    const rd = data.sort((a, b) => {
      if (typeof object === 'object') {
        const key = Object.keys(object)[0];
        const ValueClass = object[key];

        if (order > 0) return new ValueClass(a[key]) - new ValueClass(b[key]);
        if (order < 0) return new ValueClass(b[key]) - new ValueClass(a[key]);
      } else {
        if (order > 0) return a[object] - b[object];
        if (order < 0) return b[object] - a[object];
      }
    });
    return rd;
  }
}

class _Get {
  constructor(element) {
    this.el = document.querySelector(element);
  }
  val(value = null) {
    if (value == null) return this.el != null ? this.el.value : null;
    else {
      if (this.el != null) {
        this.el.value = value;
      }
      return undefined;
    }
  }
  html(template) {
    if (this.el) {
      this.el.innerHTML = template;
    }
  }
  node() {
    return this.el != null ? this.el : null;
  }
  attr(attr, value = null) {
    if (this.el) {
      if (value == null) {
        return this.el[attr];
      } else {
        this.el[attr] = value;
      }
    }
  }
  on(ev, callback) {
    if (this.el) {
      this.el.addEventListener(ev, callback);
    }
  }
  addClass(name) {
    if (this.el) {
      this.el.classList.add(name);
    }
  }
  removeClass(name) {
    if (this.el) {
      this.el.classList.remove(name);
    }
  }
}

var Get = (el) => new _Get(el);