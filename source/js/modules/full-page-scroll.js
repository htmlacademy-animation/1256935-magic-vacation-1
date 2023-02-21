import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 1000;
    this.scrollFlag = true;
    this.timeout = null;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);

    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);

    this.addAnimationScreen();
  }

  init() {
    document.addEventListener(
      `wheel`,
      throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, { trailing: true }),
    );

    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    window.addEventListener(`load`, this.contentLoadedHandler);

    this.onUrlHashChanged();
  }

  onScroll(evt) {
    if (this.scrollFlag) {
      this.reCalculateActiveScreenPosition(evt.deltaY);
      const currentPosition = this.activeScreen;
      if (currentPosition !== this.activeScreen) {
        this.changePageDisplay();
      }
    }
    this.scrollFlag = false;
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.scrollFlag = true;
    }, this.THROTTLE_TIMEOUT);
  }

  createChildSpanWithAnomationText(letter, duration, delay) {
    return `<span style="transition-duration: ${duration}ms; transition-delay: ${delay}ms;">${letter}</span>`;
  }

  addAnimationScreen() {
    // const stringsArray = text.split(` `);
    const animatedText = document.querySelectorAll(`.animated_text`);
    const timeDelay = [210, 140, 70];
    const timeDuration = 500;
    animatedText.forEach((node) => {
      node.innerHTML = node.innerHTML
        .split(` `)
        .map((item) => {
          let currentTimeDelayPosition = 0;
          return `<span>
        ${item
          .split(``)
          .map((letter) => {
            if (currentTimeDelayPosition > timeDelay.length - 1) {
              currentTimeDelayPosition = 0;
            }
            const mapLetter = this.createChildSpanWithAnomationText(
              letter,
              timeDuration,
              timeDelay[currentTimeDelayPosition],
            );

            currentTimeDelayPosition++;

            return mapLetter;
          })
          .join(``)}
        </span>`;
        })
        .join(``);
    });
  }
  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex(
      (screen) => location.hash.slice(1) === screen.id,
    );
    this.activeScreen = newIndex < 0 ? 0 : newIndex;
    this.changePageDisplay();
  }

  contentLoadedHandler() {
    document.body.classList.add(`dom_loaded`);
  }

  changePageDisplay() {
    this.changeVisibilityDisplay();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay() {
    this.screenElements.forEach((screen) => {
      if (this.activeScreen === 2) {
        setTimeout(() => {
          screen.classList.add(`screen--hidden`);
        }, 500);
        screen.classList.remove(`active`);
      } else {
        screen.classList.add(`screen--hidden`);
        screen.classList.remove(`active`);
      }
    });
    if (this.activeScreen === 2) {
      this.screenElements[this.activeScreen].classList.add(`active`);
      setTimeout(() => {
        this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
      }, 500);
    } else {
      this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
      setTimeout(() => {
        this.screenElements[this.activeScreen].classList.add(`active`);
      }, 100);
    }
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find(
      (item) => item.dataset.href === this.screenElements[this.activeScreen].id,
    );
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        screenId: this.activeScreen,
        screenName: this.screenElements[this.activeScreen].id,
        screenElement: this.screenElements[this.activeScreen],
      },
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }
}
