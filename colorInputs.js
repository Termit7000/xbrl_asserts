/**
 * Список переменных CSS в :root
 */
const arrVars = (function () {
  const varsCSS = '--main-color: #D9B88F; --text-color: #324759; --tooltip-background-color: #F27C38; --tooltip-operand-color: #F27C38; --tooltip-operand-text-color:  #193c40; --tooltip-text-color: #193C40; --secondary-color: #D99F59; --detailed-data-color: #D9CEBA;';
  //const varsCSS = Array.from(document.styleSheets[0].cssRules).filter(sheet => sheet.href === '../blocks/root/root.css')[0].styleSheet.cssRules[0].cssText;
  return varsCSS.replace(':root ', '').replace('{', '').replace('}', '')
    .split(';')
    .reduce((acc, item) => {

      let [name, value] = item.split(':');

      if (!value) return acc;

      acc.push({ name: name.trim(), value: value.trim() });

      return acc;

    }, []);
  ;
})();


/**
 * Создает input для цыета
 */
class InputColor {

  static arrInputs = new Map();

  static colorTempl = document.querySelector('template#color-inputs').content;
  static root = document.querySelector(':root');

  static setColor(id, colorValue) {

    id = id.trim();
    colorValue = colorValue.trim();
    const currentInput = InputColor.arrInputs.get(id);
    if (!currentInput) return;

    currentInput.value = colorValue;
    InputColor.root.style.setProperty(id, colorValue);

  }

  constructor(nameVar, colorValue) {

    nameVar = nameVar.trim();
    colorValue = colorValue.trim();

    const labelColorElement = InputColor.colorTempl.querySelector('.color-input__label').cloneNode(true);
    labelColorElement.for = nameVar;
    labelColorElement.textContent = nameVar;

    const inputColorElement = InputColor.colorTempl.querySelector('.color-input__item').cloneNode(true);
    inputColorElement.id = nameVar;
    inputColorElement.name = nameVar;
    inputColorElement.value = colorValue;

    inputColorElement.addEventListener('change', ev => {
      const colorTarget = ev.currentTarget.value.trim();
      const idElem = ev.currentTarget.id.trim();
      InputColor.root.style.setProperty(idElem, colorTarget);
    });

    InputColor.arrInputs.set(nameVar, inputColorElement);
    labelColorElement.append(inputColorElement);
    this.inputElemt = labelColorElement;
  };
}


/**
 * Сохранение настроек
 */
document.querySelector('.color-input__button_type_save').addEventListener('click', () => {

  const arrInputs = document.querySelectorAll('.color-input__item');

  const settings = [];

  arrInputs.forEach(item => {
    let { id, value } = item;
    settings.push({ id: id, value: value });
  }, []);

  const saveAs = (dataurl, filename) => {
    const link = document.createElement("a");
    link.href = dataurl;
    link.download = filename;
    link.click();
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
  saveAs(dataStr, "color_scheme.txt");
});


/**
 * Выбор файла для загрузки настроек
 */
const inputSaveSettings = document.createElement("input");
inputSaveSettings.type = 'file';

inputSaveSettings.addEventListener('change', (ev) => {

  if (ev.currentTarget?.files[0]) {

    const file = ev.currentTarget.files[0];
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
      const settingsObj = JSON.parse(reader.result);

      if (!Array.isArray(settingsObj)) return;

      settingsObj.forEach(item => InputColor.setColor(item.id, item.value));
    };

    inputSaveSettings.value = null;
  }
});

document.querySelector('.color-input__button_type_load').addEventListener('click', () => {
  inputSaveSettings.click();
});

const insertPlace = document.querySelector('.color-input');
arrVars.forEach(cssVar => insertPlace.append(new InputColor(cssVar.name, cssVar.value).inputElemt));

