(function () {
  'use strict';

  angular
    .module('fo')
    .controller('AllocineController', AllocineController)
    .controller('AllocineAssociateController', AllocineAssociateController);


  /* @ngInject */
  function AllocineController(movie, allocine, $mdDialog, Toast) {
    var vm = this;
    vm.image = allocine && allocine.poster && allocine.poster.href;
    vm.image64 = allocine && allocine.poster64;
    vm.synopsis = allocine && allocine.synopsis;
    vm.title = allocine && allocine.title;
    vm.unlink = unlink;

    function unlink() {
      if (confirm('Confirmer la suppression du lien allocine ?')) {
        var old_id_allocine = movie.id_allocine;
        var old_filedata = movie.filedata;
        var old_summary = movie.summary;
        movie.id_allocine = null;
        movie.filedata = null;
        movie.summary = null;
        movie.save().then(function () {
          Toast.success('Suppression du lien avec allocine');
          $mdDialog.hide();
        }, function (error) {
          movie.id_allocine = old_id_allocine;
          movie.filedata = old_filedata;
          movie.summary = old_summary;
          Toast.error('Probleme lors de la suppression du lien avec allocine - ' + error.statusText);
        });
      }
    }

  }

  /* @ngInject */
  function AllocineAssociateController(movies, movie, Toast, $mdDialog, Upload) {
    var vm = this;
    vm.movies = movies;
    vm.associate = associate;
    vm.fakeMovie = {};
    vm.manuelAssociate = manuelAssociate;
    vm.title = title;
    vm.year = year;
    vm.formType = 'allocine';
    vm.save = save;

    function save() {
      Upload.upload({
        url: '/api/movies/' + movie._id + '/upload',
        data: {
          file: vm.file,
          summary: vm.summary
        }
      }).then(function (datas) {
        Toast.success('Association réalisée avec succès');
        movie.filedata = datas.data.filedata;
        movie.summary = datas.data.summary;
        $mdDialog.hide(movie);
      }, function (error) {
        movie.id_allocine = undefined;
        Toast.error('Probleme lors de l\' association - ' + error.statusText);
      });;
    }

    function title(movie) {
      return movie.title || movie.originalTitle; //fr or original title
    }

    function year(movie) {
      return movie.productionYear || //movie
        movie.yearStart + '-' + movie.yearEnd; //serie
    }

    function manuelAssociate() {
      movie.id_allocine = vm.fakeMovie.code;
      validate();
    }

    function associate(allocine) {
      movie.id_allocine = allocine.code;
      validate();
    }

    function validate() {
      movie.save().then(function () {
        Toast.success('Association réalisée avec succès');
        $mdDialog.hide(movie);
      }, function (error) {
        movie.id_allocine = undefined;
        Toast.error('Probleme lors de l\' association - ' + error.statusText);
      });
    }

  }
})();
