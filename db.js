//@ts-check
/** @type {{easy: ConstraintEntry[][], hard: ConstraintEntry[][]}} */
const LEVELDATA = {
  easy: [
    [
      { pos: { x: 1, y: 0 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 4, y: 0 }, constr: { $: "oasis" } },
      { pos: { x: 3, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 4, y: 1 }, constr: { $: "oasis" } },
      { pos: { x: 0, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 2 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 3, y: 3 }, constr: { $: "oasis" } },
      { pos: { x: 2, y: 4 }, constr: { $: "corner", way: "NE" } },
    ],
    [
      { pos: { x: 2, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 1, y: 1 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 4, y: 1 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 0, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 2 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 0, y: 0 }, constr: { $: "oasis" } },
      { pos: { x: 1, y: 2 }, constr: { $: "oasis" } },
      { pos: { x: 3, y: 3 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 2, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 4, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 1, y: 2 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 2, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 1, y: 4 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 4, y: 4 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 1, y: 3 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 3, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 0, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 2 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 4, y: 2 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 3, y: 4 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 2, y: 4 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 2, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 1, y: 1 }, constr: { $: "corner", way: "SE" } },
      { pos: { x: 0, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 3, y: 2 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 2, y: 3 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 1, y: 4 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 3, y: 3 }, constr: { $: "oasis" } },
    ],
  ],
  hard: [
    [
      { pos: { x: 1, y: 0 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 5, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 0, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 3, y: 3 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 0, y: 4 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 2, y: 4 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 4, y: 4 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 3, y: 6 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 2, y: 0 }, constr: { $: "oasis" } },
      { pos: { x: 3, y: 0 }, constr: { $: "oasis" } },
      { pos: { x: 6, y: 4 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 0, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 1 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 5, y: 1 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 2, y: 2 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 6, y: 2 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 0, y: 3 }, constr: { $: "corner", way: "SE" } },
      { pos: { x: 3, y: 4 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 1, y: 5 }, constr: { $: "corner", way: "SE" } },
      { pos: { x: 2, y: 0 }, constr: { $: "oasis" } },
      { pos: { x: 1, y: 4 }, constr: { $: "oasis" } },
      { pos: { x: 2, y: 6 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 2, y: 0 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 6, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 2, y: 2 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 2, y: 4 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 4, y: 4 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 0, y: 5 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 5, y: 5 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 3, y: 6 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 0, y: 2 }, constr: { $: "oasis" } },
      { pos: { x: 1, y: 4 }, constr: { $: "oasis" } },
      { pos: { x: 2, y: 6 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 3, y: 1 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 5, y: 1 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 2, y: 2 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 1, y: 3 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 5, y: 3 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 2, y: 4 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 4, y: 4 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 0, y: 5 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 5, y: 5 }, constr: { $: "corner", way: "NE" } },
      { pos: { x: 3, y: 3 }, constr: { $: "oasis" } },
    ],
    [
      { pos: { x: 5, y: 1 }, constr: { $: "corner", way: "SE" } },
      { pos: { x: 1, y: 2 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 2, y: 2 }, constr: { $: "straight", way: "H" } },
      { pos: { x: 4, y: 2 }, constr: { $: "corner", way: "SW" } },
      { pos: { x: 2, y: 4 }, constr: { $: "corner", way: "SE" } },
      { pos: { x: 1, y: 5 }, constr: { $: "corner", way: "NW" } },
      { pos: { x: 3, y: 5 }, constr: { $: "straight", way: "V" } },
      { pos: { x: 4, y: 4 }, constr: { $: "oasis" } },
    ],
  ],
};
