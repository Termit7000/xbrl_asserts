
/**
 * Генерирует исключение с переданным текстом
 * @param {String} textError
 */
function throwError(textError) {
  throw new Error(textError);
}

/**
 * Возвращает значение по переданному ключу, или генерирует исключение, если ключа нет
 * @param {JSON} jsData
 * @param {String} key
 * @returns
 */
function getJsonProperty(jsData, key) {
  return jsData.hasOwnProperty(key) && jsData[key] || throwError(`Не найден ключ ${key}`);
}

/**
 * Вызывает переданную функцию через попытку, с обработкой ошибок
 * @param {Function} func
 * @param {Element} elem
 */
function fillSafety(func, source, elem) {

  try {
    func(source);
  }
  catch (er) {
    const textError = er + "\n" + JSON.stringify(source);
    renderError(elem, textError);
  }
}

/**
 * Размещает ошибку в элементе
 * @param {Element} element
 * @param {String} textError
 */
function renderError(element, textError) {
  console.log(textError);
  element.textContent = textError;
  element.classList.add('error');
}

/**
 * Превращает переданный текст формулы в html с подсказками
 */
class Tooltip {

  static templ = document.querySelector('#template_tooltip').content;

  /**
   *
   * @param {String} formulaDescription
   * @param {Array} arrayLabels
   */
  constructor(formulaDescription, arrayLabels, {operandName='operand', tooltipName='label', swap=false}={}) {

    this.formulaDescription = formulaDescription;

    if (Array.isArray(arrayLabels) && arrayLabels.length > 0) {

      if (!arrayLabels[0].hasOwnProperty(tooltipName)) return;

      this.labels = arrayLabels.map(i => {

        const tooltip = Tooltip.templ.querySelector('.tooltip').cloneNode(true); //текст операнда
        tooltip.textContent = (swap) ? i[tooltipName] : i[operandName];

        const tooltipItem = Tooltip.templ.querySelector('.tooltip__item').cloneNode(true);
        tooltipItem.textContent =  (swap) ? i[operandName] : i[tooltipName];

        tooltip.append(tooltipItem);

        return { name: `$${i[operandName]}`, tooltip: tooltip }

      });
    }
  }

  getFormulaHTML() {

    if (!this.labels) return this.formulaDescription;

    const result = this.labels.reduce(
      (acc, item) => acc.replaceAll(item.name, item.tooltip.outerHTML), this.formulaDescription);

    return result;
  }
}

class Assert {

  static templ = document.querySelector('#template_assert').content;

  assert = Assert.templ.querySelector('.assert').cloneNode(true); //Карточка проверки
  title = this.assert.querySelector('.assert__title');
  description = this.assert.querySelector('.assert__description');

  formulaWraper = this.assert.querySelector('.assert__formula-wraper');
  formulaDescription = this.assert.querySelector('.assert__formula-description');

  constructor(jsObj) {
    fillSafety(this.fill.bind(this), jsObj, this.assert);
  }

  fill(jsAssert) {

    this.title.textContent = getJsonProperty(jsAssert, 'assertCode');
    this.description.textContent = getJsonProperty(jsAssert, 'assertDescription');

    //Подсказки к формуле
    const operands = getJsonProperty(jsAssert, 'operands');
    this.formulaDescription.innerHTML = new Tooltip(getJsonProperty(jsAssert, 'formulaDescription'), operands).getFormulaHTML();

    if (jsAssert.hasOwnProperty('formulaPrecondition')) {

      const titlePrecondition = Assert.templ.querySelector('.assert__formula-title').cloneNode(true);
      titlePrecondition.textContent = 'Условие проверки:';

      const formulaPrecondition = Assert.templ.querySelector('.assert__formula-description').cloneNode(true);
      formulaPrecondition.innerHTML = new Tooltip(jsAssert.formulaPrecondition, operands).getFormulaHTML();

      this.formulaWraper.prepend(formulaPrecondition);
      this.formulaWraper.prepend(titlePrecondition);
    }

    //Вставка сегментов
    this.assert.append(new Segments(jsAssert.segments, jsAssert.formulaDescription).getElement());
  }

  getElement() { return this.assert };
}

class Segments {

  static templ = document.querySelector('#template_segment').content;
  segments = Segments.templ.querySelector('.segment').cloneNode(true); //Карточка сегмента

  constructor(jsObj, formulaDescription) {
    fillSafety(this.fill.bind(this, formulaDescription), jsObj, this.segments);
  }

  fill(formulaDescription, segments) {

    if (!Array.isArray(segments)) {
      renderError(this.segments, `Переданный объект не является массивом: ${JSON.stringify(segments)}`);
      return;
    }

    segments.forEach(segment => {
      const elementSegment = Segments.templ.querySelector('.segment__item').cloneNode(true);
      const description = elementSegment.querySelector('.segment__description');

      if (segment.hasOwnProperty('customDescription')) {
        description.textContent = segment.customDescription;
      } else {
        elementSegment.remove(description);
      }


      const segmentValue = elementSegment.querySelector('.segment__value');
      const values = getJsonProperty(segment, 'values');

      if (Array.isArray(values)) {
        segmentValue.innerHTML = new Tooltip(formulaDescription, values, {tooltipName: 'value', swap: true}).getFormulaHTML();
      } else {
        segmentValue.textContent = values;
      }


      //ОПЕРАНДЫ
      elementSegment.append(new Operands(segment.operands).getElement());

      this.segments.append(elementSegment);
    });
  }

  getElement() { return this.segments };

}

/**
 * Карточка операнда
 */
class Operands {

  static templ = document.querySelector('#template_operand').content;
  operands = Operands.templ.querySelector('.operands').cloneNode(true); //Карточки операндов

  constructor(jsObj) {
     fillSafety(this.fill.bind(this), jsObj, this.operands);
  }

  fill(operandsJSON) {
    if (!Array.isArray(operandsJSON)) {
      renderError(this.operands, `Переданный объект не является массивом: ${JSON.stringify(operandsJSON)}`);
      return;
    }

    operandsJSON.forEach(operand => {
      const operandElement = Operands.templ.querySelector('.operand').cloneNode(true);
      operandElement.querySelector('.operand__title').textContent = getJsonProperty(operand, 'name');

      //ФАКТЫ
      operandElement.append(new Facts(operand.facts).getElement());

      this.operands.append(operandElement);
    });
  }

  getElement() { return this.operands };

}

/**
 * Карточка факта
 */
class Facts {

  static templ = document.querySelector('#template_facts').content;
  facts = Facts.templ.querySelector('.facts').cloneNode(true); //Карточки фактов

  constructor(jsObj) {
    fillSafety(this.fill.bind(this), jsObj, this.facts);
  }

  fill(factsJSON) {
    if (!Array.isArray(factsJSON)) {
      renderError(this.facts, `Переданный объект не является массивом: ${JSON.stringify(factsJSON)}`);
      return;
    }

    factsJSON.forEach(fact => {
      const factElement = Facts.templ.querySelector('.facts__item').cloneNode(true);
      factElement.querySelector('.facts__concept').textContent = fact.conceptLabel;

      const decimals = (fact.decimals) ? `точность ${fact.decimals}` : '';
      const currency = fact.currency ?? '';

      factElement.querySelector('.facts__value').textContent = `${fact.value} ${decimals} ${currency}`;

      //КОНТЕКС
      factElement.append(new Context(fact.context).getElement());

      this.facts.append(factElement);

    });
  }

  getElement() { return this.facts };

}

class Context {

  static templ = document.querySelector('#template_context').content;
  context = Context.templ.querySelector('.context').cloneNode(true); //Карточки контекста

  constructor(jsObj) {
    fillSafety(this.fill.bind(this), jsObj, this.context);
  }


  fill(contextJSON) {
    if (!Array.isArray(contextJSON)) {
      renderError(this.context, `Переданный объект не является массивом: ${JSON.stringify(contextJSON)}`);
      return;
    }

    contextJSON.forEach(item => {

      const aspect = Context.templ.querySelector('.context__aspect').cloneNode(true);
      aspect.textContent = item.aspect;
      this.context.append(aspect);

      const value = Context.templ.querySelector('.context__value').cloneNode(true);
      value.textContent = item.value;
      this.context.append(value);
    });

  }

  getElement() { return this.context };
}
