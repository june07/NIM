/**
 * MIT License
 *
 *    Copyright (c) 2016-2022 June07
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in all
 *    copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *    SOFTWARE.
*/
var ngApp = angular.module('NimOptionsApp', []);
ngApp
    .controller('nimOptionsController', ['$scope', '$window', function($scope, $window) {
        $scope.bg = $window.chrome.extension.getBackgroundPage().angular.element('#nim').scope();
        $scope.bg.localize($window, function() {});
        $scope.autoIncrementOptions = [
            {id: 'both', name: 'Both'},
            {id: 'host', name: 'Host'},
            {id: 'port', name: 'Port'},
            {id: 'false', name: 'False'},
        ];
        $scope.window = $window;
        $scope.apikey = '************************************';

        var $ = $window.$,
            chrome = $window.chrome;

        $($window.document).ready(function() {
            $('.modal').modal();
            $('#modal3').modal({
                dismissible: false
            });
            $('.dropdown-trigger').dropdown();
            $scope.hideScaledOut({ delay: 0 });
            $scope.updateDevToolsOptions();
            $scope.$apply();
        });
        $($window).blur(function() {
            $scope.bg.$emit('options-window-focusChanged');
        });
        // BEGIN SLIDER
        var slider = $window.document.getElementById('checkInterval');
        $window.noUiSlider.create(slider, {
            start: [$scope.bg.settings.checkInterval],
            step: 500,
            range: {
                'min': [500],
                'max': [30000]
            },
            format: wNumb( { decimals: 2, encoder: function(value) { return value * .001 } }),
            tooltips: false
        });
        var rangeSliderValueElement = $window.document.getElementById('checkInterval-value');
        slider.noUiSlider.on('update', function(values, handle) {
            rangeSliderValueElement.innerHTML = values[handle];
            $scope.bg.settings.checkInterval = values[handle] * 1000;
        });
        slider.noUiSlider.on('set', function(values, handle) {
            $window._gaq.push(['_trackEvent', 'User Event', 'checkInterval-value', values[handle], undefined, true]);
        });
        // END SLIDER
        // BEGIN SLIDER
        var sliderDebugVerbosity = $window.document.getElementById('debugVerbosity');
        $window.noUiSlider.create(sliderDebugVerbosity, {
            start: [$scope.bg.settings.debugVerbosity],
            step: 1,
            range: {
                'min': [0],
                'max': [10]
            },
            tooltips: false
        });
        var rangeSliderValueElementDebugVerbosity = $window.document.getElementById('debugVerbosityBadge');
        sliderDebugVerbosity.noUiSlider.on('update', function(values, handle) {
            rangeSliderValueElementDebugVerbosity.innerHTML = values[handle];
            $scope.bg.settings.debugVerbosity = values[handle];
        });
        sliderDebugVerbosity.noUiSlider.on('set', function(values, handle) {
            $window._gaq.push(['_trackEvent', 'User Event', 'debugVerbosityBadge', values[handle], undefined, true]);
        });
        // END SLIDER
        // BEGIN SLIDER
        let sliderNodeReportMaxMessages = $window.document.getElementById('nodeReportMaxMessages');
        $window.noUiSlider.create(sliderNodeReportMaxMessages, {
            start: [$scope.bg.settings.diagnosticReports.maxMessages],
            step: 1,
            range: {
                'min': [1],
                'max': [10]
            },
            tooltips: false
        });
        let rangeSliderValueElementNodeReportMaxMessages = $window.document.getElementById('nodeReportMaxMessages-value');
        sliderNodeReportMaxMessages.noUiSlider.on('update', function(values, handle) {
            rangeSliderValueElementNodeReportMaxMessages.innerHTML = values[handle];
            $scope.bg.settings.diagnosticReports.maxMessages = values[handle];
        });
        sliderNodeReportMaxMessages.noUiSlider.on('set', function(values, handle) {
            $window._gaq.push(['_trackEvent', 'User Event', 'nodeReportMaxMessages-value', values[handle], undefined, true]);
        });
        // END SLIDER
        $scope.saveButtonHandler = function() {
            $window._gaq.push(['_trackEvent', 'save button', 'clicked']);
            chrome.tabs.query({url: chrome.runtime.getURL('options.html')}, (tabs)=>{
                chrome.tabs.remove(tabs[0].id, () => {
                    $scope.bg.$emit('options-window-closed');
                });
            });
        };
        $scope.saveCustomDevToolsButtonHandler = function() {
            $window._gaq.push(['_trackEvent', 'save-button-custom-devtools', 'clicked']);
            $scope.bg.validateCustomDevToolsURL();
            $('#modal3').modal('close');
        }
        $scope.setDevToolsOption = function(optionIndex) {
            $scope.bg.setDevToolsOption(optionIndex);
            $scope.updateDevToolsOptions();
        };
        $scope.resetDevToolsOption = function() {
            $scope.bg.settings.localDevTools = !$scope.bg.settings.localDevTools;
            if (!$scope.bg.settings.localDevTools) $scope.setDevToolsOption(0);
            $scope.updateDevToolsOptions();
        }
        function trackInputClick(e) {
            $window._gaq.push(['_trackEvent', e.target.id, 'clicked']);
        }
        var userInputs = $window.document.getElementsByClassName('ga-track');

        function trackInputClickListener(event) {
            trackInputClick(event);
        }
        for (var i = 0; i < userInputs.length; i++) {
            userInputs[i].addEventListener('click', trackInputClickListener);
        }
        $scope.maskKey = function(mask) {
            if (mask) {
                $scope.apikey = '************************************';
            } else {
                $scope.bg.Auth.getAPIKey()
                .then(key => {
                    $scope.apikey = key ? key : chrome.i18n.getMessage('brakeCODELoginRequired');
                    $scope.$apply();
                })
            }
        }
        $scope.hideScaledOut = function(options) {
            let { delay = 500 } = options;
            setTimeout(() => {
                Array.from(document.querySelectorAll('.scale-transition')).forEach(el => {
                    if (el.classList.contains('scale-out')) el.style.display = 'none';
                    else el.style.display = 'inherit';
                });
            }, delay);
        }
        $scope.updateDevToolsOptions = function() {
            $scope.devToolsOptionsName = $scope.bg.getDevToolsOption().name;
            $scope.devToolsOptionsUrl = $scope.bg.getDevToolsOption().url;
        }
    }]);