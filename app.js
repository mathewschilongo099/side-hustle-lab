(function () {
  function formatDate(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function card(a) {
    return (
      '<article class="card">' +
      '<span class="badge">' + a.topicLabel + '</span> ' +
      '<span class="meta">' + a.readMinutes + ' min</span>' +
      '<h3><a href="/guide.html?slug=' + encodeURIComponent(a.slug) + '">' + a.title + '</a></h3>' +
      '<p>' + a.excerpt + '</p>' +
      '<p class="meta">' + formatDate(a.published) + '</p>' +
      '</article>'
    );
  }

  var articles = window.SHL_ARTICLES || [];

  var featured = document.getElementById("featured");
  if (featured) {
    featured.innerHTML = articles.filter(function (a) { return a.featured; }).map(card).join("");
  }

  var all = document.getElementById("all-guides");
  if (all) {
    all.innerHTML = articles.map(card).join("");
  }

  var form = document.getElementById("newsletter-form");
  var done = document.getElementById("newsletter-done");
  if (form && done) {
    if (localStorage.getItem("shl-newsletter") === "1") {
      form.classList.add("hidden");
      done.classList.remove("hidden");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      localStorage.setItem("shl-newsletter", "1");
      form.classList.add("hidden");
      done.classList.remove("hidden");
    });
  }

  // Guide page
  var articleRoot = document.getElementById("article-root");
  if (articleRoot) {
    var params = new URLSearchParams(location.search);
    var slug = params.get("slug");
    var article = articles.find(function (a) { return a.slug === slug; }) || articles[0];
    if (article) {
      document.title = article.title + " — Side Hustle Lab";
      var html = '<p class="kicker">' + article.kicker + '</p>' +
        '<h1>' + article.title + '</h1>' +
        '<p class="meta"><span class="badge">' + article.topicLabel + '</span> ' +
        formatDate(article.published) + ' · ' + article.readMinutes + ' min read</p>' +
        '<p class="lead">' + article.excerpt + '</p>';
      article.body.forEach(function (b) {
        if (b.type === "p") html += '<p>' + b.text + '</p>';
        if (b.type === "h2") html += '<h2>' + b.text + '</h2>';
        if (b.type === "ul") {
          html += '<ul>' + b.items.map(function (i) { return '<li>' + i + '</li>'; }).join("") + '</ul>';
        }
        if (b.type === "callout") {
          html += '<aside class="callout"><strong>' + b.title + '</strong>' + b.text + '</aside>';
        }
      });
      html += '<p class="meta">Educational only — not financial, tax, or legal advice. See the <a href="/disclosure.html">affiliate disclosure</a>.</p>';
      articleRoot.innerHTML = html;
    }
  }

  // Debt snowball
  var debtForm = document.getElementById("debt-form");
  if (debtForm) {
    function simulate() {
      var b1 = Number(document.getElementById("d1b").value) || 0;
      var m1 = Number(document.getElementById("d1m").value) || 0;
      var b2 = Number(document.getElementById("d2b").value) || 0;
      var m2 = Number(document.getElementById("d2m").value) || 0;
      var b3 = Number(document.getElementById("d3b").value) || 0;
      var m3 = Number(document.getElementById("d3m").value) || 0;
      var extra = Number(document.getElementById("extra").value) || 0;
      var list = [
        { name: document.getElementById("d1n").value || "Debt 1", balance: b1, min: m1 },
        { name: document.getElementById("d2n").value || "Debt 2", balance: b2, min: m2 },
        { name: document.getElementById("d3n").value || "Debt 3", balance: b3, min: m3 }
      ].filter(function (d) { return d.balance > 0; })
       .sort(function (a, b) { return a.balance - b.balance; });

      var months = 0, paid = 0, order = list.map(function (d) { return d.name; });
      while (list.some(function (d) { return d.balance > 0; }) && months < 240) {
        months++;
        list.forEach(function (d) {
          if (d.balance <= 0) return;
          var pay = Math.min(d.balance, d.min);
          d.balance -= pay;
          paid += pay;
        });
        var target = list.find(function (d) { return d.balance > 0; });
        if (target && extra > 0) {
          var add = Math.min(target.balance, extra);
          target.balance -= add;
          paid += add;
        }
      }
      document.getElementById("debt-months").textContent = String(months);
      document.getElementById("debt-paid").textContent = "$" + Math.round(paid).toLocaleString();
      document.getElementById("debt-order").innerHTML = order.map(function (n, i) {
        return "<li>" + (i + 1) + ". " + n + "</li>";
      }).join("");
    }
    debtForm.addEventListener("input", simulate);
    simulate();
  }

  // Hustle math
  var hustleForm = document.getElementById("hustle-form");
  if (hustleForm) {
    function hustle() {
      var hours = Number(document.getElementById("hours").value) || 0;
      var rate = Number(document.getElementById("rate").value) || 0;
      var expenses = Number(document.getElementById("expenses").value) || 0;
      var taxPct = Number(document.getElementById("taxPct").value) || 0;
      var weeks = Number(document.getElementById("weeks").value) || 0;
      var gross = hours * rate * weeks;
      var netBeforeTax = Math.max(0, gross - expenses);
      var tax = netBeforeTax * (taxPct / 100);
      var keep = netBeforeTax - tax;
      var hourly = hours * weeks > 0 ? keep / (hours * weeks) : 0;
      document.getElementById("gross").textContent = "$" + Math.round(gross).toLocaleString();
      document.getElementById("tax").textContent = "$" + Math.round(tax).toLocaleString();
      document.getElementById("keep").textContent = "$" + Math.round(keep).toLocaleString();
      document.getElementById("hourly").textContent = "$" + Math.round(hourly).toLocaleString();
    }
    hustleForm.addEventListener("input", hustle);
    hustle();
  }
})();
