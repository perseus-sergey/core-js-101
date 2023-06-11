/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
const getJSON = (obj) => JSON.stringify(obj);

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
const fromJSON = (proto, json) => Object.setPrototypeOf(JSON.parse(json), proto);

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  arr: [],
  comb: [],
  isCombo: false,
  elCount: 0,
  idCount: 0,
  psCount: 0,
  errDoubleElem: 'Element, id and pseudo-element should not occur more then one time inside the selector',
  errWrongElemOrder: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',

  element(value) {
    const lastEl = this.arr[this.arr.length - 1];
    if (lastEl && !lastEl.match(/^[.#:[ ]/)) this.errorHandler(this.errDoubleElem);
    if (lastEl && !this.elCount && lastEl.match(/^[#[:]/)) this.errorHandler(this.errWrongElemOrder);
    if (this.arr[this.arr.length - 1]) {
      this.arr.push(null);
      this.arr.push(value);
      this.isCombo = true;
      this.counterReset();
    } else this.arr.push(value);
    this.elCount += 1;
    return this;
  },

  id(value) {
    if (this.idCount) this.errorHandler(this.errDoubleElem);
    const lastEl = this.arr[this.arr.length - 1];
    if (lastEl && lastEl.match(/^[.[:]/)) this.errorHandler(this.errWrongElemOrder);

    this.arr.push(`#${value}`);
    this.idCount += 1;
    return this;
  },

  class(value) {
    const lastEl = this.arr[this.arr.length - 1];
    if (lastEl && lastEl.match(/^[[:]/)) this.errorHandler(this.errWrongElemOrder);

    this.arr.push(`.${value}`);
    return this;
  },

  attr(value) {
    const lastEl = this.arr[this.arr.length - 1];
    if (lastEl && lastEl.match(/^[:]/)) this.errorHandler(this.errWrongElemOrder);

    this.arr.push(`[${value}]`);
    return this;
  },

  pseudoClass(value) {
    const lastEl = this.arr[this.arr.length - 1];
    if (lastEl && lastEl.match(/^::/)) this.errorHandler(this.errWrongElemOrder);

    this.arr.push(`:${value}`);
    return this;
  },

  pseudoElement(value) {
    if (this.psCount) this.errorHandler(this.errDoubleElem);
    this.arr.push(`::${value}`);
    this.psCount += 1;
    return this;
  },

  combine(selector1, combinator) {
    this.comb.push(` ${combinator} `);
    return this;
  },

  stringify() {
    if (this.isCombo) {
      if (this.comb.length === this.arr.filter((el) => el === null).length) {
        this.comb.reverse().forEach((el) => {
          this.arr[this.arr.indexOf(null)] = el;
        });
      } else throw new Error();
      this.isCombo = false;
    }
    const res = this.arr.join('');
    this.comb = [];
    this.arr = [];
    this.counterReset();
    return res;
  },

  counterReset() {
    this.elCount = 0;
    this.idCount = 0;
    this.psCount = 0;
  },

  arrsReset() {
    this.comb = [];
    this.arr = [];
  },

  errorHandler(str) {
    this.counterReset();
    this.arrsReset();
    throw new Error(str);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
