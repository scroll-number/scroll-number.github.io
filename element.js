customElements.define(
  "count-up",
  class extends HTMLElement {
    Value(n) {
      return (
        this.getAttribute(n) ||
        getComputedStyle(this)
          .getPropertyValue("--count-up-" + n)
          .trim()
      );
    }
    connectedCallback() {
      let backgroundColor = getComputedStyle(this).color;
      let r = backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      let contrastColor =
        r[1] * 299 + r[2] * 587 + r[3] * 114 >= 128000 ? "black" : "white";

      this.attachShadow({
        mode: "open",
      }).innerHTML =
        /*html*/ `<style>` +
        `div{` +
        `display:flex;` +
        `flex-direction:column;` +
        `justify-content:top;` +
        `align-items:center;` +
        `height:100%;` +
        `flex-grow:1;` +
        `font:Arial,sans-serif;` +
        `background:var(--count-up-color,${backgroundColor});` +
        `color:var(--color-background, ${contrastColor});` +
        `border-radius:var(--count-up-border-radius,2ch)` +
        `}` +
        `[part="count"]{padding:1ch 1ch 0 1ch;font-size:var(--count-up-font-size,4ch);display:flex;font-weight:bold}` +
        `[part="caption"]{text-align:center}` +
        `</style>` +
        (this.Value("box") && !this.hasAttribute("nobox")
          ? `<div part="div"><span part="count">`
          : ``) +
        `<span part="prefix"></span><span part="number"></span><span part="suffix"></span>` +
        (this.Value("box") && !this.hasAttribute("nobox")
          ? `</span><p part="caption"><slot></slot></p></div>`
          : ``);
      this.shadowRoot.querySelector(`[part="prefix"]`).innerHTML =
        this.Value("prefix");
      this.shadowRoot.querySelector(`[part="suffix"]`).innerHTML =
        this.Value("suffix");
      new IntersectionObserver(
        (entries) =>
          entries.map(
            (entry) =>
              entry.isIntersecting &&
              this.to(
                parseFloat((this.Value("to") || "1000").replace(/,/g, ""))
              )
          ),
        {
          //   root:null,
          //   rootMargin:"0px 0px",
          threshold: 0,
        }
      ).observe(this);
    }
    to(
      to,
      from = ~~this.Value("from"),
      start = 0,
      Frame = (
        time,
        progress = Math.min(
          1 -
            Math.pow(
              1 -
                (time - (start = start || time)) /
                  ~~(this.Value("duration") || 2500),
              3
            ),
          1
        ),
        FractionDigits = Math.floor(to) == to ? 0 : to.toString().split(".")[1]
      ) => {
        this.shadowRoot.querySelector(`[part="number"]`).innerHTML = Math.abs(
          progress * (to - from) + from
        ).toLocaleString(this.Value("locale") || "us", {
          minimumFractionDigits: FractionDigits,
          maximumFractionDigits: FractionDigits,
          useGrouping: false,
          ...(this.Value("currency")
            ? {
                style: "currency",
                currency: this.Value("currency") || "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            : {}),
        });
        if (progress < 1) requestAnimationFrame(Frame);
        else
          document.body.dispatchEvent(
            new CustomEvent("count-up", {
              bubbles: true,
              composed: true,
              detail: this,
            })
          );
      }
    ) {
      console.log(this.Value("currency") || 666);
      requestAnimationFrame(Frame);
    }
  }
);
