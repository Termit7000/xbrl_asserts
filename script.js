
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
 * @param {JSON} jsObj
 * @param {Element} elem
 */
function fillSafety(func, jsObj, elem) {

  try {
    func(jsObj);
  }
  catch (er) {
    const textError = er + "\n" + JSON.stringify(jsObj);
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

class Assert {

  constructor(jsObj) {
    this.templ = document.querySelector('#template_assert').content;
    this.assert = this.templ.querySelector('.assert').cloneNode(true); //Карточка проверки

    this.title = this.assert.querySelector('.assert__title');
    this.description = this.assert.querySelector('.assert__description');
    this.formulaDescription = this.assert.querySelector('.assert__formula-description');

    fillSafety(this.fill.bind(this), jsObj, this.assert);

  }

  fill(jsAssert) {
    this.title.textContent = getJsonProperty(jsAssert, 'assertCode');
    this.description.textContent = getJsonProperty(jsAssert, 'assertDescription');

    //Подсказки к формуле
    let formulaDescription = getJsonProperty(jsAssert, 'formulaDescription');

    jsAssert.operands.map(i => {

      const operand = this.templ.querySelector('.assert__operand').cloneNode(true);
      operand.textContent = i.name;

      const tooltip = this.templ.querySelector('.assert__tooltip').cloneNode(true);
      i.labels.forEach(label => {

        const tooltipItem = this.templ.querySelector('.assert__tooltip-item').cloneNode(true);
        tooltipItem.textContent = label;
        tooltip.append(tooltipItem);

      });

      operand.append(tooltip);
      return { name: `$${i.name}`, tooltip: operand };

    }).forEach(operand => {
      formulaDescription = formulaDescription.replaceAll(operand.name, operand.tooltip.outerHTML);
    });

    this.formulaDescription.innerHTML = formulaDescription;

    //Вставка сегментов
    this.assert.append(new Segments(jsAssert.segments).getElement());
  }

  getElement() { return this.assert };
}

class Segments {
  constructor(jsObj) {
    this.templ = document.querySelector('#template_segment').content;
    this.segments = this.templ.querySelector('.segment').cloneNode(true); //Карточка сегмента

    fillSafety(this.fill.bind(this), jsObj, this.segments);
  }

  fill(segments) {

    if (!Array.isArray(segments)) {
      renderError(this.segments, `Переданный объект не является массивом: ${JSON.stringify(segments)}`);
      return;
    }

    segments.forEach(segment => {
      const elementSegment = this.templ.querySelector('.segment__item').cloneNode(true);
      const description = elementSegment.querySelector('.segment__description');

      if (segment.hasOwnProperty('customDescription')) {
        description.textContent = segment.customDescription;
      } else {
        elementSegment.remove(description);
      }

      elementSegment.querySelector('.segment__value').textContent = getJsonProperty(segment, 'values');

      //ОПЕРАНДЫ
      elementSegment.append(new Operands(segment.operands).getElement());

      this.segments.append(elementSegment);
    });
  }

  getElement() { return this.segments};

}

/**
 * Карточка операнда
 */
class Operands {
    constructor(jsObj) {

      this.templ = document.querySelector('#template_operand').content;
      this.operands = this.templ.querySelector('.operands').cloneNode(true); //Карточки операндов

      fillSafety(this.fill.bind(this), jsObj, this.operands);
    }

    fill(operandsJSON) {
      if (!Array.isArray(operandsJSON)) {
        renderError(this.operands, `Переданный объект не является массивом: ${JSON.stringify(operandsJSON)}`);
        return;
      }

      operandsJSON.forEach(operand=>{
        const operandElement = this.templ.querySelector('.operand').cloneNode(true);
        operandElement.querySelector('.operand__title').textContent = getJsonProperty(operand, 'name');

        //ФАКТЫ
        operandElement.append(new Facts(operand.facts).getElement());

        this.operands.append(operandElement);
      });
    }

    getElement(){return this.operands};

}

/**
 * Карточка факта
 */
class Facts{
  constructor(jsObj){

    this.templ = document.querySelector('#template_facts').content;
    this.facts = this.templ.querySelector('.facts').cloneNode(true); //Карточки фактов

    fillSafety(this.fill.bind(this), jsObj, this.facts);
  }

  fill(factsJSON) {
    if (!Array.isArray(factsJSON)) {
      renderError(this.facts, `Переданный объект не является массивом: ${JSON.stringify(factsJSON)}`);
      return;
    }

    factsJSON.forEach(fact=>{
      const factElement = this.templ.querySelector('.facts__item').cloneNode(true);
      factElement.querySelector('.facts__concept').textContent = fact.conceptLabel;

      const decimals = (fact.decimals) ? `точность ${fact.decimals}` : '';
      const curency = (fact.currency) ? fact.currency : '';

      factElement.querySelector('.facts__value').textContent = `${fact.value} ${decimals} ${curency}`;

      //КОНТЕКС
      factElement.append(new Context(fact.context).getElement());

      this.facts.append(factElement);

    });
  }

  getElement(){return this.facts};

}

class Context{
  constructor(jsObj){

    this.templ = document.querySelector('#template_context').content;
    this.context = this.templ.querySelector('.context').cloneNode(true); //Карточки контекста

    fillSafety(this.fill.bind(this), jsObj, this.context);
  }


  fill(contextJSON) {
    if (!Array.isArray(contextJSON)) {
      renderError(this.context, `Переданный объект не является массивом: ${JSON.stringify(contextJSON)}`);
      return;
    }

    contextJSON.forEach(item=>{

      const aspect = this.templ.querySelector('.context__aspect').cloneNode(true);
      aspect.textContent = item.aspect;
      this.context.append(aspect);

      const value = this.templ.querySelector('.context__value').cloneNode(true);
      value.textContent = item.value;
      this.context.append(value);
    });

  }

  getElement(){return this.context};
}


const jsnAssert = {
  "assertCode": "valueAssertion_0420011_1_1",
  "assertDescription": "0420011 Сведения об отчитывающейся организации. Значение по показателю «Идентификационный номер налогоплательщика (ИНН)» должно быть равно 10 цифрам.",
  "formulaDescription": "matches(  $INN_NFO  /text(),'^[0-9]{10}$') ",
  "status": {
    "type": "warning",
    "value": 1
  },
  "operands": [
    {
      "name": "INN_NFO",
      "labels": [
        "Идентификационный номер налогоплательщика (ИНН)"
      ]
    }
  ],
  "segments": [
    {
      "customDescription": "0420011 Сведения об отчитывающейся организации. Значение по показателю «Идентификационный номер налогоплательщика (ИНН)» должно быть равно 10 цифрам.",
      "values": "matches(  324324234  /text(),'^[0-9]{10}$') ",
      "operands": [
        {
          "name": "INN_NFO",
          "facts": [
            {
              "conceptLabel": "Идентификационный номер налогоплательщика (ИНН)",
              "value": "324324234",
              "currency": null,
              "decimals": null,
              "context": [
                {
                  "aspect": "Контекст ID",
                  "value": "A23"
                },
                {
                  "aspect": "Организация",
                  "value": "111111111111111"
                },
                {
                  "aspect": "Период",
                  "value": "2021-10-31"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}


/*
const assert = new Assert(jsnAssert);
document.querySelector('body').append(assert.getElement());
*/


