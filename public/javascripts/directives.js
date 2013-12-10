(function() {
  var module = angular.module('app.directives', []);

  var API = 'http://latex.codecogs.com/';
  var EQN = '(\\exists e) \\, \\text{renders}(latex) \\implies e = webtex';

  var TexEditor = function($timeout) {
    var controller = function($scope, $element, $attrs) {
      $scope.equation = EQN; // initialize equation

      $scope.resolutions = [50, 80, 100, 110, 120, 150, 200, 300];

      $scope.colors = {
        'transparent': '',
        'black': '\\bg_black',
        'white': '\\bg_white'
      };

      $scope.sizes = [
        { label: 'tiny',        value: '\\tiny' },
        { label: 'small',       value: '\\small' },
        { label: 'normal',      value: '\\normal' },
        { label: 'large',       value: '\\large' },
        { label: 'extra large', value: '\\LARGE' },
        { label: 'huge',        value: '\\huge' }
      ];

      // configure defaults
      $scope.format = 'png';
      $scope.color  = $scope.colors['transparent'];
      $scope.size   = $scope.sizes[2].value;
      $scope.dpi    = $scope.resolutions[3];

      // throttling
      var deferred = null;
      var delay = 100;

      // updates the equation rendering
      $scope.update = function() {
        if (deferred) {
          $timeout.cancel(deferred);
        }

        deferred = $timeout(function() {
          var url = '' + API + $scope.format + '.latex';

          var eqn = [
            '' + $scope.color,
            '' + $scope.size,
            '\\dpi{' + $scope.dpi + '}',
            $scope.equation
          ].join(' ');

          $scope.src = url + '?' + encodeURIComponent(eqn);
        }, delay);
      };

      // set up watchers
      $scope.$watch('equation', $scope.update);
      $scope.$watch('color', $scope.update);
      $scope.$watch('size', $scope.update);
      $scope.$watch('dpi', $scope.update);
    };

    var link = function($scope, $element, $attrs) {
      if (typeof ace === 'undefined') {
        return;
      }

      // ace editor is available, switch to 'ace' mode
      $scope.mode = 'ace';

      // initialize the ace editor
      var aceEdit = ace.edit('ace-editor');
      var session = aceEdit.getSession();

      aceEdit.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true
      });

      session.setMode("ace/mode/latex");

      aceEdit.renderer.setShowPrintMargin(false);
      aceEdit.setValue(EQN);
      aceEdit.focus();

      // propagates changes from ace editor to the textarea
      var sync = function() {
        var val = aceEdit.getSession().getValue();
        $scope.equation = val;
      };

      aceEdit.getSession().on('change', function() {
        $scope.$apply(sync);
      });
    };

    var editor = {
      scope: true,
      controller: controller,
      link: link
    };

    return editor;
  };

  TexEditor.$inject = ['$timeout'];

  module.directive('texEditor', TexEditor);
})();
