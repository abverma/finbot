module.exports = class AppMetadata {
  static #instance = new AppMetadata()
  #ignoredExpenses = null

  static get instance() {
    return this.#instance
  }

  set ignoredExpenses(ignoredExpenses) {
    this.#ignoredExpenses = ignoredExpenses.map((x) => new RegExp(x.desc))
  }

  get ignoredExpenses() {
    return this.#ignoredExpenses
  }
}
