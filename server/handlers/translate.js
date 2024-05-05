const { translate } = require("@vitalets/google-translate-api");

async function translateToEnglish(textToTranslate) {
    let result = await translate(textToTranslate, {to: 'en'});

    return result.text;
}

module.exports = {translateToEnglish};