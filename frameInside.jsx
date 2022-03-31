/**
 * FrameInside.jsx
 *
 * See before/after screenshots here:
 * https://github.com/Inventsable/Frame-Inside#readme
 *
 * Collects any pageItems contained within selected rectangles and groups them with
 * their container, with groups inheriting container / frame / rectangle name.
 *
 * This is a very basic version and does not do proper hitbox detection -- it can work
 * with a circle container but technically uses the bounding box (the rectangle you'd see
 * while having that circle selected) instead of properly parsing out whether coordinates
 * fit into a given surface area.
 */

Number.prototype.isBetween = function (min, max) {
  return arguments.length < 2 ? false : this >= min && this <= max;
};
Array.prototype.filter = function (callback) {
  var filtered = [];
  for (var i = 0; i < this.length; i++)
    if (callback(this[i], i, this)) filtered.push(this[i]);
  return filtered;
};
Array.prototype.forEach = function (callback) {
  for (var i = 0; i < this.length; i++) callback(this[i], i, this);
};
function get(type, parent) {
  if (arguments.length == 1 || !parent) parent = app.activeDocument;
  var result = [];
  if (!parent[type]) return [];
  for (var i = 0; i < parent[type].length; i++) result.push(parent[type][i]);
  return result;
}

function main() {
  if (!app.selection.length)
    return alert("Must select at least one frame to group art inside");
  get("selection").forEach(function (item) {
    function compareBounds(parent, child) {
      var pB = parent.geometricBounds,
        cB = child.geometricBounds;
      return (
        cB[0].isBetween(pB[0], pB[2]) &&
        cB[2].isBetween(pB[0], pB[2]) &&
        cB[1].isBetween(pB[3], pB[1]) &&
        cB[3].isBetween(pB[3], pB[1])
      );
    }
    var list = get("pageItems").filter(function (i) {
      return (
        !i.selected &&
        !/group/i.test(i.parent.typename) &&
        compareBounds(item, i)
      );
    });
    if (list.length) {
      var group = app.activeDocument.groupItems.add();
      group.name = item.name;
      list
        .filter(function (i) {
          // Filter out compoundPath children otherwise outlined text can distort
          return !/compound/i.test(i.parent.typename);
        })
        .forEach(function (i) {
          i.move(group, ElementPlacement.INSIDE);
        });
      item.move(group, ElementPlacement.INSIDE);
    }
  });
}
main();
