'use strict';
const fs = require('fs');
const path = require('path');

const locales = {
  bn: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/bn.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.json'), 'utf8'))
};

/**
 * Language detection priority:
 *  1. ?lang=xx in the URL (persists into the session)
 *  2. saved in session
 *  3. default: 'bn'
 *
 * Exposes to every EJS view:
 *  - t(key, vars)   -> translated string, supports {placeholder} substitution
 *  - currentLang    -> 'bn' | 'en'
 */
module.exports = function i18nMiddleware(req, res, next) {
  let lang = req.query.lang || req.session?.lang || 'bn';
  if (lang !== 'bn' && lang !== 'en') lang = 'bn';

  if (req.query.lang && req.session) {
    req.session.lang = lang;
  }

  req.lang = lang;
  res.locals.currentLang = lang;

  res.locals.t = function (key, vars) {
    let str = (locales[lang] && locales[lang][key]) || locales.bn[key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      });
    }
    return str;
  };

  next();
};
