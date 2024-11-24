//@ts-check
/* Alkalmazásmodell */

/**
 * @description
 * Ez a technika bevett módszer deklaratív
 * webfejlesztésnél, szimplán meghív minden feliratkozott callbacket az új tárolt értékkel. Egyszerűsítik a módosítások kezelését, könnyítik a hibakeresést, segítenek az alkalmazásrétegek összekötésében.
 *
 * A megvalósítás az enyém, de maga az ötlet _nem_.
 *
 * Például [Svelte (Store)](https://github.com/sveltejs/svelte) és [React (State)](https://github.com/facebook/react) is előszeretettel használja,
 * itt éppenséggel kézi csatoláson alapul.
 * @template T
 */
class Box {
  /** @param {T} value */
  constructor(value) {
    /** @type {((n: T) => void)[]} */
    this.listeners = [];

    /** @type {T} */
    this.value = value;
  }

  /** @returns {T} */
  get() {
    return this.value;
  }

  /** @param {T} value  */
  set(value) {
    this.value = value;
    this.listeners.forEach((x) => {
      x(this.value);
    });
  }

  /** @param {(n: T) => void} listener */
  addlistener(listener) {
    this.listeners.push(listener);
  }

  /** @param {(n: T) => void} listener */
  addlistenercalled(listener) {
    listener(this.value);
    this.addlistener(listener);
  }
}
/*
Állapotosztályok az "aloldalak" állapottárolására
 -hívható függvények biztosítása komplex módosításhoz
 -Box methodok delegálása módosításra reagáló újrarajzoláshoz

(Igen, lehetett volna readable/writeable Store-okra lebontani,
vagy egyéb módon interfészt szűkíteni, hogy ne kelljenek
delegáló fn-ek, de már így is elég framework szaga van,
nem feszítem tovább a húrt)
*/

/**
 * Sztringuniók az állapot könnyebb kezelésére
 * @typedef {"Menu" | "Help" | "Game"} Page
 * @typedef {"Easy" | "Hard"} Difficulty
 */

class MenuState {
  /** @param {RootState} rootstate */
  constructor(rootstate) {
    /** @type {RootState} @readonly @private */
    this._rootstate = rootstate;

    /**
     * Kissé szakmaiatlan megoldás, nem akartam derived/computed tárolókat is behozni
     * @readonly
     * @private
     * @type {Box<boolean>}
     */
    this.canStartGame = new Box(false);

    /** @type {Box<string>} @readonly @private */
    this.playerName = new Box("");
    this.playerName.addlistener((s) => {
      this.canStartGame.set(s.trim().length != 0);
    });

    /** @type {Box<Difficulty>} @readonly @private */ //@ts-ignore
    this.selectedDifficulty = new Box("Easy");
  }

  toHelp() {
    if (this._rootstate.getPage() != "Menu") return;
    this._rootstate.toHelp();
  }

  toGame() {
    if (!this.canStartGame || this._rootstate.getPage() != "Menu") return;
    this._rootstate.toGame();
  }

  /** @returns {Difficulty} */
  getDiff() {
    return this.selectedDifficulty.get();
  }

  /** @param {Difficulty} diff  */
  setDiff(diff) {
    this.selectedDifficulty.set(diff);
  }

  /** @param {string} name  */
  setName(name) {
    this.playerName.set(name);
  }

  /** @returns {string} */
  getName() {
    return this.playerName.get();
  }

  /** @param {(n: String)=>void} fn */
  subName(fn) {
    this.playerName.addlistener(fn);
  }
  /** @param {(n: String)=>void} fn */
  subNameLate(fn) {
    this.playerName.addlistenercalled(fn);
  }

  /** @param {(n: boolean)=>void} fn */
  subStart(fn) {
    this.canStartGame.addlistener(fn);
  }

  /** @param {(n: Difficulty)=>void} fn */
  subDiff(fn) {
    this.selectedDifficulty.addlistener(fn);
  }
}

class HelpState {
  /** @param {RootState} rootstate */
  constructor(rootstate) {
    /** @type {RootState} @readonly @private */
    this._rootstate = rootstate;
  }

  toMenu() {
    if (this._rootstate.getPage() != "Help") return;
    this._rootstate.toMenu();
  }
}
/**
 * @typedef {{$:"none"}} None
 * @typedef {"SE" | "SW" | "NW" | "NE"} CornerWay
 * @typedef {{$:"corner", way: CornerWay}} Corner
 * @typedef {{$:"straight", way: "H" | "V"}} Straight
 * @typedef {{$:"oasis"}} Oasis
 * @typedef {None | Straight | Corner} Rail Sín mint lerakott elem
 * @typedef {Straight | Corner | Oasis} Constraint Megkötés mint az előre definiált pálya elemei
 * @typedef {{x:number, y:number}} Position Vektor a mátrix indexeihez
 * @typedef {{pos: Position, rail: Rail}} Placement Sín módosítási üzenet modellen belülre
 * @typedef {{marker: "start"|"end", upd: {pos: Position, dir: Direction | null}|null}} MarkerUpdate Jelölő állapotfrissítése a rajzolás egyértelművé tételéhez
 * @typedef {{pos: Position, constr: Constraint}} ConstraintEntry Megkötésbejegyzés a pálya tárolásához
 * @typedef {{pos: Position, cell: Cell}} CellUpdate Frissítési üzenet rajzoláshoz
 * @typedef {{constraint: Constraint | null, placed: Rail}} Cell Tárolt cella (nem kell neki koordináta)
 * @typedef {"up"|"draw"|"erase"} MouseState
 * @typedef {{pos: Position, state: MouseState}} MouseAction Egér művelete, húzott nyomvonalhoz el kell tárolni
 * @typedef {"N"|"W"|"S"|"E"} Direction
 *
 * @typedef {"init"|"play"|"finish"} Stage
 * @typedef {{name: string, totalsec: number}} ScoreEntry
 */

class GameState {
  /** @param {RootState} rootState @param {()=>Difficulty} getDiff @param {()=>string} getName  */
  constructor(rootState, getDiff, getName) {
    /** @type {()=>Difficulty} @readonly @private */
    this._getdiff = getDiff;
    /** @type {()=>string} @readonly @private */
    this._getName = getName;
    /** @type {RootState} @readonly @private */
    this._rootstate = rootState;

    // |vvv| Itt jön az abszolút pingpongjátszma a két réteg közt |vvv|

    // Amikor megváltozik az aktív oldal...
    rootState.subPage((page) => {
      // És az éppen a játék akkor...
      if (page !== "Game") return;
      // Modell átírja magát initre, ennek hatására DOM megcsinálja a táblázatot...
      this.gameStage.set("init");
      // Visszajön a control flow ide miután Box végighívott mindenkit
      // Modell már küldhet cellaadatot a DOMnak, mert már kész a táblázat...
      this.#reset(this._getdiff());
    });

    /** @type {Box<CellUpdate>} @readonly @private */
    this.boardChange = new Box({
      pos: { x: 0, y: 0 },
      cell: GameUtils.emptycell(),
    });

    /** @type {Box<MarkerUpdate>} */ //@ts-ignore
    this.markerUpdate = new Box({ marker: "start", upd: null });

    /** @type {Box<Stage>} @readonly @private */ //@ts-ignore
    this.gameStage = new Box("init");

    /** @type {Box<MouseAction|null>} @readonly @private */ //@ts-ignore
    this.lastAction = new Box(null);
    /** @type {Box<MouseAction|null>} @readonly @private */ //@ts-ignore
    this.currentAction = new Box(null);

    /** @type {Box<number>} @readonly @private */
    this.totalSeconds = new Box(0);

    /** @type {Cell[][]} @private */
    this.board = [];

    /** @type {number | null} @private */
    this.intervalKey = null;

    /** @type {MouseState} @private */
    this.mouseState = "up";

    /** @type {number} @private */
    this.boardSize = 5;

    /** @type {number} @private */
    this.selectedLevel = 0;
  }

  /** @returns {number} */
  getLvIdx() {
    return this.selectedLevel;
  }

  /**
   * @param {Difficulty} diff
   * @param {number} idx
   * @returns {ScoreEntry[]} */
  getHiScores(diff, idx) {
    const hiscorestr = localStorage.getItem(GameUtils.hiscoreKey(diff, idx));
    if (hiscorestr === null) return [];
    /** @type {ScoreEntry[]} */
    const hiscorelist = JSON.parse(hiscorestr);
    return hiscorelist;
  }

  /**
   * @param {ScoreEntry} entry
   * @param {Difficulty} diff
   * @param {number} idx
   * */
  #addScore(entry, diff, idx) {
    const hiscores = this.getHiScores(diff, idx);
    hiscores.push(entry);
    hiscores.sort((a, b) => a.totalsec - b.totalsec);
    localStorage.setItem(
      GameUtils.hiscoreKey(diff, idx),
      JSON.stringify(hiscores)
    );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {Constraint | null}
   */
  getConstraint(x, y) {
    const row = this.board[y];
    if (row === undefined) return null;
    const cell = row[x];
    if (cell === undefined) return null;
    return cell.constraint;
  }

  toMenu() {
    if (this._rootstate.getPage() != "Game") return;
    this._rootstate.toMenu();
  }

  /** @param {number} key  */
  installIntervalKey(key) {
    if (this.intervalKey !== null) {
      return;
    }
    this.intervalKey = key;
  }

  /** @returns {number|null} */
  popIntervalKey() {
    const key = this.intervalKey;
    this.intervalKey = null;
    return key;
  }

  secondPassed() {
    this.totalSeconds.set(this.totalSeconds.get() + 1);
  }

  /** @param {(n: number)=>void} fn */
  subTotalSeconds(fn) {
    this.totalSeconds.addlistener(fn);
  }

  /** @param {(n: CellUpdate)=>void} fn */
  subBoardChange(fn) {
    this.boardChange.addlistener(fn);
  }

  /** @param {(n: MarkerUpdate)=>void} fn */
  subMarkerUpdate(fn) {
    this.markerUpdate.addlistener(fn);
  }

  /** @param {(n: Stage)=>void} fn */
  subStageChange(fn) {
    this.gameStage.addlistener(fn);
  }

  /** @param {Difficulty} diff */
  #reset(diff) {
    this.gameStage.set("init");
    this.totalSeconds.set(0);
    // Random
    const boardsize = diff === "Easy" ? 5 : 7;
    this.boardSize = boardsize;
    const board = new Array(boardsize)
      .fill(0)
      .map(() => new Array(boardsize).fill(0).map(() => GameUtils.emptycell()));
    this.board = board;

    const rolledLevel = Math.round(Math.random() * 4);
    this.selectedLevel = rolledLevel;
    const ovr =
      diff === "Easy"
        ? LEVELDATA.easy[rolledLevel]
        : LEVELDATA.hard[rolledLevel];

    ovr.forEach((m) => {
      board[m.pos.y][m.pos.x].constraint = m.constr;
    });

    for (let y = 0; y < boardsize; y++) {
      for (let x = 0; x < boardsize; x++) {
        const c = this.board[y][x].constraint;
        this.boardChange.set({
          pos: { x, y },
          cell: {
            constraint: c,
            placed: GameUtils.none(),
          },
        });
      }
    }
    this.gameStage.set("play");
  }

  liftMouse() {
    const curr = this.currentAction.get();
    if (curr === null) return;
    this.lastAction.set(curr);
    this.currentAction.set(null);
    this.mouseState = "up";
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  putMouse(x, y) {
    if (this.gameStage.get() !== "play") return;
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return;
    this.mouseState = "draw";
    //const oldest = this.lastAction.get();
    const previous = this.currentAction.get();
    /** @type {MouseAction} */
    const current = { pos: { x, y }, state: "draw" };
    this.lastAction.set(previous);
    this.currentAction.set(current);
    //this.boardChange.set(current);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  eraseMouse(x, y) {
    if (this.gameStage.get() !== "play") return;
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return;
    this.mouseState = "erase";
    //const oldest = this.lastAction.get();
    const previous = this.currentAction.get();
    /** @type {MouseAction} */
    const currentPlace = { pos: { x, y }, state: "erase" };
    this.lastAction.set(previous);
    this.currentAction.set(currentPlace);
    const upd = this.#overlayTile({
      pos: currentPlace.pos,
      rail: GameUtils.none(),
    });
    if (upd !== null) {
      this.boardChange.set(upd);
    }
  }

  /**
   * @param {Placement} placement
   */
  #postPlacement(placement) {
    const upd = this.#overlayTile(placement);
    if (upd === null) return;
    this.board[upd.pos.y][upd.pos.x].placed = upd.cell.placed;
    this.boardChange.set(upd);
    if (!this.#walkRail()) return;
    this.#addScore(
      { name: this._getName(), totalsec: this.totalSeconds.get() },
      this._getdiff(),
      this.getLvIdx()
    );
    this.gameStage.set("finish");
  }

  /**
   * @returns {boolean}
   */
  #walkRail() {
    // Keresünk egy alkalmas belépési pontot, például az első sorban az első nem oázis cellát, ha ott nincs sín, nem lehet teljes
    const homeCell = this.board[0].find(
      (x) =>
        x.constraint === null ||
        (x.constraint !== null && x.constraint.$ !== "oasis")
    );
    if (homeCell === undefined) return false;
    /** @type {Position} */
    const startPos = { x: this.board[0].findIndex((x) => x == homeCell), y: 0 };
    // Nem fordulhat elő, de így korrekt
    if (startPos.x === -1) return false;

    // Tudni kell, hogy hány cellát kell meglátogatni
    const OASES = (
      this._getdiff() === "Easy" ? LEVELDATA.easy : LEVELDATA.hard
    )[this.getLvIdx()].filter((x) => x.constr.$ === "oasis").length;

    const TARGET_VISITS = this.boardSize * this.boardSize - OASES;
    let visits = 0;

    // Elindulás
    /** @type {Direction | null} */
    const initialInverse = GameUtils.railToHeading(homeCell.placed);
    if (initialInverse === null) return false;
    const initialHeading = GameUtils.oppose(initialInverse);

    const bsize = this.boardSize;
    /** @type {Direction | Null} */
    let currentDirection = GameUtils.oppose(initialHeading);
    let currentRail = homeCell.placed;
    const currentPos = { x: startPos.x, y: startPos.y };
    // Séta amíg vissza nem érünk
    while (
      currentRail.$ !== "none" &&
      currentDirection !== null &&
      (visits === 0 ||
        !(currentPos.x === startPos.x && currentPos.y === startPos.y))
    ) {
      const moveTowards = GameUtils.traverseRail(currentDirection, currentRail);
      if (moveTowards === null) {
        break;
      }
      const neighbEntry = GameUtils.oppose(moveTowards);
      if (!GameUtils.offsetTowards(currentPos, moveTowards, bsize)) {
        break;
      }
      const neighbourRail = this.board[currentPos.y][currentPos.x].placed;
      if (!GameUtils.isOpenTowards(neighbourRail, neighbEntry)) {
        break;
      }
      currentDirection = neighbEntry;
      currentRail = neighbourRail;
      visits++;
    }
    if (visits !== TARGET_VISITS) {
      return false;
    }
    return true;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  overMouse(x, y) {
    if (this.gameStage.get() !== "play") return;
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return;
    if (this.mouseState === "up") return;

    const oldest = this.lastAction.get();
    const previous = this.currentAction.get();
    const current = { pos: { x, y }, state: this.mouseState };

    if (this.mouseState === "draw") {
      if (oldest !== null && previous !== null) {
        const piece = GameUtils.pieceFromPos(
          oldest.pos,
          previous.pos,
          current.pos
        );
        if (piece !== null) {
          this.#postPlacement({ pos: previous.pos, rail: piece });
        }
      }
    } else {
      this.#postPlacement({ pos: current.pos, rail: GameUtils.none() });
    }
    this.lastAction.set(previous);
    this.currentAction.set(current);
    // oldest -> previous -> current trióval megmondható minden
  }

  /**
   * Megpróbálja illeszteni a táblára a sínt (vagy az üres elemet) és visszaadja a
   * keletkező frissítést amennyiben ez lehetséges
   * @param {Placement} placment
   * @returns {CellUpdate | null}
   */
  #overlayTile(placment) {
    if (
      placment.pos.x < 0 ||
      placment.pos.x >= this.boardSize ||
      placment.pos.y < 0 ||
      placment.pos.y >= this.boardSize
    )
      return null;
    const r = this.board[placment.pos.y];
    if (r === undefined) return null;
    const d = r[placment.pos.x];
    if (d === undefined) return null;

    if (
      // Ha nem törölni akarunk
      placment.rail.$ !== "none" &&
      // és van ott megkötés, de
      d.constraint !== null &&
      // a kettő nem egyenlő, VAGY
      (placment.rail.$ !== d.constraint.$ ||
        // Egyenlőek a megkötések
        (placment.rail.$ === d.constraint.$ &&
          // De az irányok nem egyeznek
          placment.rail.way !== d.constraint.way))
    ) {
      // Akkor nem illeszthető
      return null;
    }
    // (TS nem veszi észre magától)
    if (d.constraint !== null && d.constraint.$ === "oasis") {
      return null;
    }
    // Különben illeszkednek, innen már oázis fix nem lehet
    const dconst = d.constraint;

    // Ha törlünk
    if (placment.rail.$ === "none") {
      // Visszaadjuk a megkötést (amit app.js üresen fog kirajzolni)
      return {
        pos: placment.pos,
        cell: {
          constraint: d.constraint,
          placed: GameUtils.none(),
        },
      };
    } else {
      // Egyébként visszaadjuk a megkötés szerint lerakott sínt
      return {
        pos: placment.pos,
        cell: {
          constraint: d.constraint,
          placed: placment.rail,
        },
      };
    }
  }
}

class RootState {
  constructor() {
    /** @type {Box<Page>} @readonly @private */ //@ts-ignore
    this.currentPage = new Box("Menu");
  }
  /** @param {Page} p  */
  #to(p) {
    if (this.currentPage.get() === p) return;
    this.currentPage.set(p);
  }

  toGame() {
    this.#to("Game");
  }

  toMenu() {
    this.#to("Menu");
  }

  toHelp() {
    this.#to("Help");
  }

  getPage() {
    return this.currentPage.get();
  }

  /** @param {(n: Page)=>void} fn */
  subPage(fn) {
    this.currentPage.addlistener(fn);
  }
}

class AppState {
  constructor() {
    /** @readonly */
    this.rootState = new RootState();

    /** @readonly */
    this.menuState = new MenuState(this.rootState);

    /** @readonly */
    this.helpState = new HelpState(this.rootState);

    /** @readonly */
    this.gameState = new GameState(
      this.rootState,
      () => this.menuState.getDiff(),
      () => this.menuState.getName()
    );
  }
}

// Statikus metódusok kiemelve a játékállapotból
class GameUtils {
  /** @param {Direction} dir */
  static oppose(dir) {
    switch (dir) {
      case "N":
        return "S";
      case "W":
        return "E";
      case "S":
        return "N";
      case "E":
        return "W";
    }
  }
  /**
   * @param {Rail} rail
   * @returns {Direction | null}
   */
  static railToHeading(rail) {
    switch (rail.$) {
      case "straight":
        return rail.way === "H" ? "E" : "N";
      case "corner":
        return rail.way === "NE" || rail.way === "NW" ? "N" : "S";
      case "none":
        return null;
    }
  }
  /** @type {{[key: string]: Direction} } */
  static LEFT_ROT = { N: "E", W: "N", S: "W", E: "S" };
  /**
   * @param {Direction} entry
   * @param {Rail} rail
   * @returns {Direction | null}
   */
  static traverseRail(entry, rail) {
    if (rail.$ === "none") return null;
    if (!this.isOpenTowards(rail, entry)) return null;
    if (rail.$ === "straight") return this.oppose(entry);
    switch (rail.way) {
      case "SE":
        return entry === "E" ? "S" : "E";
      case "SW":
        return entry === "W" ? "S" : "W";
      case "NW":
        return entry === "W" ? "N" : "W";
      case "NE":
        return entry === "E" ? "N" : "E";
    }
  }
  /**
   * @param {Position} pos
   * @param {Direction} dir
   * @param {number} bsize
   * @return {boolean}
   */
  static offsetTowards(pos, dir, bsize) {
    switch (dir) {
      case "N":
        if (pos.y <= 0) return false;
        pos.y -= 1;
        break;
      case "W":
        if (pos.x <= 0) return false;
        pos.x -= 1;
        break;
      case "S":
        if (pos.y >= bsize - 1) return false;
        pos.y += 1;
        break;
      case "E":
        if (pos.x >= bsize - 1) return false;
        pos.x += 1;
        break;
    }
    return true;
  }
  /**
   * @param {Rail} rail
   * @param {Direction} dir
   * @returns {boolean}
   */
  static isOpenTowards(rail, dir) {
    if (rail.$ === "none") return false;
    if (rail.$ === "corner") {
      return rail.way.includes(dir);
    }
    return (rail.way === "V" && "NS".includes(dir)) || "EW".includes(dir);
  }
  /**
   * @param {Difficulty} diff
   * @param {number} idx
   * @returns {string}
   */
  static hiscoreKey(diff, idx) {
    return `highscore-${diff === "Easy" ? "e" : "h"}-${Math.round(idx)}`;
  }

  /** @type {None} */
  static #none = { $: "none" };
  /** @returns {None} */
  static none() {
    return GameUtils.#none;
  }

  /** @returns {Cell} */
  static emptycell() {
    return { constraint: null, placed: GameUtils.none() };
  }

  /**
   * @param {Direction} d1
   * @param {Direction} d2
   * @returns {Rail | null}
   */
  static pieceFromDir(d1, d2) {
    if (GameUtils.areCancelling(d1, d2)) return null;
    if (GameUtils.areStraight(d1, d2)) {
      return { $: "straight", way: d1 === "N" || d1 === "S" ? "V" : "H" };
    }
    const isLeft = GameUtils.isLeftOf(d1, d2);
    return { $: "corner", way: GameUtils.makeCorner(d1, isLeft) };
  }

  /**
   * @param {Position} p1
   * @param {Position} p2
   * @param {Position} p3
   * @returns {Rail | null}
   */
  static pieceFromPos(p1, p2, p3) {
    const d1 = GameUtils.calcDirection(p1, p2);
    const d2 = GameUtils.calcDirection(p2, p3);
    if (d1 === null || d2 === null) return null;
    return this.pieceFromDir(d1, d2);
  }

  /**
   * Közvetlen szomszédság esetén kiszámolja az eltolási irányt, pályaelem kiszámításához kell
   * @param {Position} from
   * @param {Position} towards
   * @returns {Direction|null}
   */
  static calcDirection(from, towards) {
    const dx = towards.x - from.x;
    const dy = towards.y - from.y;
    if ((dx != 0 && dy != 0) || (Math.abs(dx) != 1 && Math.abs(dy) != 1))
      return null;
    return dy === -1 ? "N" : dy === 1 ? "S" : dx === -1 ? "W" : "E";
  }
  /**
   * @param {Direction} one
   * @param {Direction} two
   * @returns {boolean}
   */
  static areCancelling(one, two) {
    return (
      (one === "N" && two === "S") ||
      (one === "S" && two === "N") ||
      (one === "W" && two === "E") ||
      (one === "E" && two === "W")
    );
  }
  /**
   *
   * @param {Direction} one
   * @param {Direction} two
   * @returns {boolean}
   */
  static areStraight(one, two) {
    return one === two;
  }

  /**
   * @param {Direction} origin
   * @param {boolean} isLeft
   * @returns {CornerWay}
   */
  static makeCorner(origin, isLeft) {
    switch (origin) {
      case "N":
        return isLeft ? "SE" : "SW";
      case "W":
        return isLeft ? "NE" : "SE";
      case "S":
        return isLeft ? "NW" : "NE";
      case "E":
        return isLeft ? "SW" : "NW";
    }
  }

  /**
   *
   * @param {Direction} one
   * @param {Direction} two
   * @returns {boolean}
   */
  static isLeftOf(one, two) {
    /** @type {{[key: string]: Direction}} */
    return this.LEFT_ROT[one] === two;
  }
}
