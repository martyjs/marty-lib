'use strict';

var _$ = require('jquery');
var MOCK_SERVER_PORT = 8956;
var format = require('util').format;

function getHtml(url) {
  return new Promise(function (resolve, reject) {
    _$.ajax({
      url: 'http://localhost:' + MOCK_SERVER_PORT + '/' + url,
      type: 'GET',
      accept: 'application/html',
      success: function success(data, textStatus, jqXHR) {
        var $div = _$('<div />', {
          id: 'server-html' + uuid()
        }).append(_$.parseHTML(data));

        _$('body').append($div);

        resolve({
          $: function $(selector) {
            return _$(selector, $div);
          },
          statusCode: jqXHR.status
        });
      },
      error: function error(jqXHR) {
        if (jqXHR.status === 404) {
          resolve({
            statusCode: 404
          });
        } else {
          reject(jqXHR);
        }
      }
    });
  });
}

function uuid() {
  return format('%s%s-%s-%s-%s-%s%s%s', s4(), s4(), s4(), s4(), s4(), s4(), s4(), s4());
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

module.exports = getHtml;