//@ts-check
/* Modell összekapcsolása a DOM-mal */

// Képfájlok

/** @param {string} img @returns {string} */
const tilePng = (img) => `url("./tiles/${img}.png")`;
const TILE_IMG = {
  E_NONE: tilePng("empty"),
  E_STR_NS: tilePng("straight_rail"),
  E_CURVE_SW: tilePng("curve_rail"),
  M_CURVE_NONE: tilePng("mountain"),
  M_CURVE_SW: tilePng("mountain_rail"),
  B_NONE_NS: tilePng("bridge"),
  B_STR_NS: tilePng("bridge_rail"),
  NOPASS: tilePng("oasis"),
};

// DOM queryk feloldása
/** @param {string} e */
const err = (e) => {
  throw `${e} query failed!`;
};

/// Gyökérelemek

/** @type {HTMLDivElement[]} */
const [ROOT_MENU, ROOT_HELP, ROOT_GAME] = [
  document.querySelector("div.menuroot") ?? err("Menu root"),
  document.querySelector("div.helproot") ?? err("Help root"),
  document.querySelector("div.gameroot") ?? err("Game root"),
];
const _ROOTS = [ROOT_MENU, ROOT_HELP, ROOT_GAME];

/// Menüelemek

/** @type {HTMLInputElement} */
const MENU_NAME_INPUT =
  ROOT_MENU.querySelector("input[type='text'].player-name") ??
  err("Player name input");
/** @type {HTMLButtonElement[]} */
const [
  MENU_EASY_BUTTON,
  MENU_HARD_BUTTON,
  MENU_HELP_BUTTON,
  MENU_START_BUTTON,
] = [
  ROOT_MENU.querySelector("button.easy") ?? err("Easy button"),
  ROOT_MENU.querySelector("button.hard") ?? err("Hard button"),
  ROOT_MENU.querySelector("button.help") ?? err("Help button"),
  ROOT_MENU.querySelector("button.start") ?? err("Start button"),
];

/// Leírás

/** @type {HTMLButtonElement} */
const HELP_BACK = ROOT_HELP.querySelector("button.back") ?? err("Back button");

/// Játéktér elemek

/** @type {HTMLSpanElement[]} */
const [GAME_PLAYER_SPAN, GAME_TIME_SPAN, GAME_HI_LV_IDX, GAME_HI_LV_DIFF] = [
  ROOT_GAME.querySelector("span.player-name") ?? err("Playername span"),
  ROOT_GAME.querySelector("span.time") ?? err("Time second span"),
  ROOT_GAME.querySelector("span.lv-idx") ?? err("Hiscore level span"),
  ROOT_GAME.querySelector("span.lv-diff") ?? err("Hiscore diff span"),
];
/** @type {HTMLElement} */ //@ts-ignore
const GAME_TBODY =
  ROOT_GAME.querySelector("table.board > tbody") ?? err("Game board table");
/** @type {HTMLDivElement[]} */
const [GAME_TWRAP, GAME_HISCORE_DIV] = [
  ROOT_GAME.querySelector("div.board-wrapper") ?? err("Game board wrap div"),
  ROOT_GAME.querySelector("div.highscores") ?? err("Hiscore panel div"),
];
/** @type {HTMLOListElement} */
const GAME_HISCORE_OL =
  ROOT_GAME.querySelector("ol.hiscore-list") ?? err("Hiscore ol");

/** @type {HTMLButtonElement} */
const GAME_MAINMENU_BUTTON =
  ROOT_GAME.querySelector("button.back-to-menu") ??
  err("Game main menu button");

// Összekapcsolás

const appState = new AppState();

/// Gyökérelemek
{
  const hidden = "hidden";
  appState.rootState.subPage((x) => {
    _ROOTS.forEach((x) => x.setAttribute(hidden, ""));
    switch (x) {
      case "Menu":
        ROOT_MENU.removeAttribute(hidden);
        break;
      case "Help":
        ROOT_HELP.removeAttribute(hidden);
        break;
      case "Game":
        ROOT_GAME.removeAttribute(hidden);
        break;
    }
  });
}

/// Főmenüelemek
{
  const ms = appState.menuState;
  const sel = "selected";
  MENU_NAME_INPUT.addEventListener("input", function () {
    ms.setName(this.value);
  });
  ms.setName(MENU_NAME_INPUT.value);

  ms.subStart((start) => {
    MENU_START_BUTTON.disabled = !start;
  });

  ms.subDiff((diff) => {
    MENU_EASY_BUTTON.classList.remove(sel);
    MENU_HARD_BUTTON.classList.remove(sel);
    if (diff === "Easy") {
      MENU_EASY_BUTTON.classList.add(sel);
    } else {
      MENU_HARD_BUTTON.classList.add(sel);
    }
  });

  MENU_EASY_BUTTON.addEventListener("click", () => {
    ms.setDiff("Easy");
  });

  MENU_HARD_BUTTON.addEventListener("click", () => {
    ms.setDiff("Hard");
  });

  MENU_HELP_BUTTON.addEventListener("click", () => {
    ms.toHelp();
  });
  MENU_START_BUTTON.addEventListener("click", () => {
    ms.toGame();
  });
}

/// Leíráselem
HELP_BACK.addEventListener("click", () => {
  appState.helpState.toMenu();
});

/// Játéktér elemek
{
  const gs = appState.gameState;
  const ms = appState.menuState;

  /**
   * Kicsit módosított változata a gyakorlatokon bemutatott delegate függvénynek
   * @param {HTMLElement} root
   * @param {string} ev
   * @param {string} selector
   * @param {(ev: Event, el: HTMLElement) => void} lambda
   */
  function delegate(root, ev, selector, lambda) {
    root.addEventListener(ev, (x) => {
      /** @type {HTMLElement | undefined} */ //@ts-ignore
      const target = x.target;
      if (target === undefined || !target.matches(selector)) return;
      lambda(x, target);
    });
  }

  // A modell tiszta elválasztása végett itt kapja meg, vagy törli az intervalt
  // Az időzítő nem 100% pontos, de éppen nem baj
  appState.gameState.subStageChange((stage) => {
    switch (stage) {
      case "init":
        GAME_MAINMENU_BUTTON.setAttribute("hidden", "");
        GAME_HISCORE_DIV.setAttribute("hidden", "");
        GAME_TIME_SPAN.style.removeProperty("color");
        const prevKey = gs.popIntervalKey();
        if (prevKey !== null) clearInterval(prevKey);
        const boardsize = ms.getDiff() === "Easy" ? 5 : 7;
        GAME_TBODY.innerHTML = "";
        for (let i = 0; i < boardsize; i++) {
          let row = document.createElement("tr");
          for (let j = 0; j < boardsize; j++) {
            const td = document.createElement("td");
            const innerDiv = document.createElement("div");
            innerDiv.classList.add("cell");
            //@ts-ignore
            innerDiv.dataset["x"] = j;
            //@ts-ignore
            innerDiv.dataset["y"] = i;
            td.appendChild(innerDiv);
            row.appendChild(td);
          }
          GAME_TBODY.appendChild(row);
        }

        const newKey = setInterval(() => {
          gs.secondPassed();
        }, 1000);

        gs.installIntervalKey(newKey);
        return;
      case "play":
        // Nem igazán történik semmi ennek hatására
        // max töltőképernyőt kéne eltűntetni, már ha volna
        return;
      case "finish":
        const oldKey = appState.gameState.popIntervalKey();
        if (oldKey === null) return;
        clearInterval(oldKey);
        GAME_MAINMENU_BUTTON.removeAttribute("hidden");
        GAME_HISCORE_DIV.removeAttribute("hidden");
        GAME_TIME_SPAN.style.setProperty("color", "green");
        GAME_HI_LV_IDX.textContent = (gs.getLvIdx() + 1).toString();
        GAME_HI_LV_DIFF.textContent =
          ms.getDiff() === "Easy" ? "könnyű" : "nehéz";
        GAME_HISCORE_OL.innerHTML = "";
        const highscores = gs.getHiScores(ms.getDiff(), gs.getLvIdx());
        highscores.forEach((x) => {
          const li = document.createElement("li");
          const m = Math.floor(x.totalsec / 60);
          const s = x.totalsec % 60;
          li.innerText = `${x.name} - ${twoWide(m)}:${twoWide(s)}`;
          GAME_HISCORE_OL.appendChild(li);
        });
        return;
    }
  });
  // !!! Késői bind miatt másik metódus !!!
  ms.subNameLate((n) => {
    GAME_PLAYER_SPAN.innerText = n;
  });
  /** @param {number} n  */
  const twoWide = (n) => n.toString().padStart(2, "0");
  gs.subTotalSeconds((totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    GAME_TIME_SPAN.innerText = `${twoWide(m)}:${twoWide(s)}`;
  });
  GAME_MAINMENU_BUTTON.addEventListener("click", (_ev) => {
    appState.rootState.toMenu();
  });

  /**
   * @param {HTMLElement} div
   * @returns {{x: number, y: number}|null}
   */
  function coordsOfCell(div) {
    if (
      !("x" in div.dataset) ||
      div.dataset.x === undefined ||
      !("y" in div.dataset) ||
      div.dataset.y === undefined
    )
      return null;
    return { x: +div.dataset.x, y: +div.dataset.y };
  }

  /// Húzós rajzolás eseménykezelői

  //// Húzás letiltása
  delegate(GAME_TWRAP, "dragstart", "*", (v, _l) => {
    v.preventDefault();
  });

  //// Jobbklikk letiltása és érzékelése
  delegate(GAME_TWRAP, "contextmenu", "div.cell", (v, l) => {
    v.preventDefault();
    const coord = coordsOfCell(l);
    if (coord === null) return;
    gs.eraseMouse(coord.x, coord.y);
  });

  delegate(GAME_TWRAP, "mousedown", "div.cell", (v, l) => {
    const coord = coordsOfCell(l);
    if (("buttons" in v && v.buttons !== 1) || coord === null) return;
    gs.putMouse(coord.x, coord.y);
  });

  delegate(GAME_TWRAP, "mouseover", "div.cell", (_v, l) => {
    const coord = coordsOfCell(l);
    if (coord === null) return;
    gs.overMouse(coord.x, coord.y);
  });

  delegate(document.body, "mouseup", "*", (_v, _l) => {
    gs.liftMouse();
  });

  delegate(GAME_TWRAP, "mouseleave", "*", (_v, _l) => {
    gs.liftMouse();
  });

  /**
   * @param {CornerWay} way
   * @returns {number}
   */
  function cwayToDeg(way) {
    switch (way) {
      case "SE":
        return 0;
      case "SW":
        return 90;
      case "NW":
        return 180;
      case "NE":
        return 270;
    }
  }

  /**
   * @param {CellUpdate} upd
   * @returns {{path: string, degrees: number}}
   */
  function updateToGraphics(upd) {
    if (upd.cell.placed.$ === "none") {
      return constrToGraphics(upd.cell.constraint);
    }
    return railToGraphics(upd.cell.placed, upd.cell.constraint !== null);
  }

  /**
   * @param {Rail} rail
   * @param {boolean} isConstr
   * @returns {{path: string, degrees: number}}
   */
  function railToGraphics(rail, isConstr) {
    switch (rail.$) {
      case "none":
        return { path: TILE_IMG.E_NONE, degrees: 0 };
      case "straight":
        return {
          path: isConstr ? TILE_IMG.B_STR_NS : TILE_IMG.E_STR_NS,
          degrees: rail.way === "V" ? 0 : 90,
        };
      case "corner":
        return {
          path: isConstr ? TILE_IMG.M_CURVE_SW : TILE_IMG.E_CURVE_SW,
          degrees: cwayToDeg(rail.way),
        };
    }
  }

  /**
   * @param {Constraint|null} constr
   * @returns {{path: string, degrees: number}}
   */
  function constrToGraphics(constr) {
    if (constr === null) return { path: TILE_IMG.E_NONE, degrees: 0 };
    switch (constr.$) {
      case "straight":
        return {
          path: TILE_IMG.B_NONE_NS,
          degrees: constr.way === "V" ? 0 : 90,
        };
      case "corner":
        return {
          path: TILE_IMG.M_CURVE_NONE,
          degrees: cwayToDeg(constr.way),
        };
      case "oasis":
        return { path: TILE_IMG.NOPASS, degrees: 0 };
    }
  }

  /// Modell által kiszámolt táblamódosítás alkalmazása
  gs.subBoardChange((change) => {
    const row = GAME_TBODY.children.item(change.pos.y);
    if (row === null) return; // index oob
    const td = row.children.item(change.pos.x);
    if (td === null) return; // index oob
    const div = td.children.item(0);
    if (div === null) return; // divnélküli cella
    const gr = updateToGraphics(change);
    //@ts-ignore
    div.style.setProperty("background-image", gr.path);
    //@ts-ignore
    div.style.setProperty("transform", `rotate(${gr.degrees}deg)`);
  });
}
