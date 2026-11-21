(function () {
  document.documentElement.classList.add("js");

  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const year = document.querySelector("#year");
  const board = document.querySelector("#menu-board");
  const filters = document.querySelectorAll(".filter");
  const form = document.querySelector("#booking-form");
  const success = document.querySelector("#booking-success");
  const dateInput = document.querySelector("#date");

  if (year) year.textContent = String(new Date().getFullYear());

  if (dateInput) {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.min = today.getFullYear() + "-" + month + "-" + day;
  }

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".sr-only").textContent = "Открыть меню";
  }

  toggle.addEventListener("click", function () {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    toggle.querySelector(".sr-only").textContent = open ? "Открыть меню" : "Закрыть меню";
    nav.classList.toggle("is-open", !open);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) closeNav();
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    reveals.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    reveals.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      const selected = button.dataset.filter;
      filters.forEach(function (item) {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });

      board.classList.add("is-fading");
      window.setTimeout(function () {
        document.querySelectorAll(".menu-group").forEach(function (group) {
          const showGroup = selected === "all" || group.dataset.group === selected;
          group.hidden = !showGroup;
        });
        board.classList.remove("is-fading");
      }, 180);
    });
  });

  function setError(id, message) {
    const field = document.querySelector("#" + id);
    const error = document.querySelector("#" + id + "-error");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
    return !message;
  }

  function phoneOk(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || (digits.length === 11 && (digits[0] === "7" || digits[0] === "8"));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const date = form.date.value;
    const time = form.time.value;
    const guests = form.guests.value;
    const wish = form.wish.value.trim();

    const nameOk = setError("name", name.length >= 2 ? "" : "Напишите имя");
    const phoneValid = setError("phone", phoneOk(phone) ? "" : "Нужен телефон из 10 или 11 цифр");
    let dateMessage = "";
    if (!date) dateMessage = "Выберите дату";
    else if (dateInput.min && date < dateInput.min) dateMessage = "Дата уже прошла";
    const dateOk = setError("date", dateMessage);
    const timeOk = setError("time", time ? "" : "Выберите время");
    const guestsOk = setError("guests", guests ? "" : "Сколько будет гостей");

    if (!(nameOk && phoneValid && dateOk && timeOk && guestsOk)) {
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const when = new Date(date + "T00:00:00");
    const prettyDate = when.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long"
    });
    const guestWords = {
      1: "одного",
      2: "двоих",
      3: "троих",
      4: "четверых",
      5: "пятерых",
      6: "шестерых"
    };
    let text =
      name +
      ", стол на " +
      (guestWords[guests] || guests) +
      " — " +
      prettyDate +
      " в " +
      time +
      ". Покажите это сообщение на кассе, стол держим 15 минут.";
    if (wish) text += " Пожелание: " + wish + ".";

    document.querySelector("#success-title").textContent = "Ждём вас, " + name;
    document.querySelector("#success-text").textContent = text;
    form.hidden = true;
    success.hidden = false;
    success.querySelector("h3").focus();
  });

  document.querySelector("#book-again").addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".error").forEach(function (error) {
      error.textContent = "";
    });
    form.name.focus();
  });
})();
