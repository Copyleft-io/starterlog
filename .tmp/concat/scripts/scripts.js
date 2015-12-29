'use strict';

var app = angular.module('starterlog', ['firebase','angular-md5','ui.bootstrap','ui.router', 'ngTable', 'textAngular'])
  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
      $stateProvider
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: ["$state", "Auth", function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('welcome');
            }, function(error){
              return;
            });
          }]
        }
      })
      .state('register', {
        url: '/register',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/register.html',
        resolve: {
          requireNoAuth: ["$state", "Auth", function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('welcome');
            }, function(error){
              return;
            });
          }]
        }
      })
      .state('profile', {
        url: '/profile',
        controller: 'ProfileCtrl as profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
          auth: ["$state", "Users", "Auth", function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('welcome');
            });
          }],
          profile: ["Users", "Auth", function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }]
        }
      })
      .state('about', {
        url: '/pages/about',
        templateUrl: 'pages/about.html'
      })
      .state('blog-home', {
        url: '/pages/blog-home',
        templateUrl: 'pages/blog-home.html'
      })
      .state('blog-post', {
        url: '/pages/blog-post',
        templateUrl: 'pages/blog-post.html'
      })
      .state('1-column-portfolio', {
        url: '/pages/1-column-portfolio',
        templateUrl: 'pages/1-column-portfolio.html'
      })
      .state('2-column-portfolio', {
        url: '/pages/2-column-portfolio',
        templateUrl: 'pages/2-column-portfolio.html'
      })
      .state('3-column-portfolio', {
        url: '/pages/3-column-portfolio',
        templateUrl: 'pages/3-column-portfolio.html'
      })
      .state('4-column-portfolio', {
        url: '/pages/4-column-portfolio',
        templateUrl: 'pages/4-column-portfolio.html'
      })
      .state('landing', {
        url: '/pages/landing',
        templateUrl: 'pages/landing.html'
      })
      .state('portfolio-item', {
        url: '/pages/portfolio-item',
        templateUrl: 'pages/portfolio-item.html'
      })
      .state('product', {
        url: '/pages/product',
        templateUrl: 'pages/product.html'
      })
      .state('thumbnail-gallery', {
        url: '/pages/thumbnail-gallery',
        templateUrl: 'pages/thumbnail-gallery.html'
      })
      .state('welcome', {
        url: '/',
        templateUrl: 'pages/welcome.html'
      });
    // $stateProvider
    //   .state('home', {
    //     url: '/home',
    //     templateUrl: 'pages/home.html',
    //     resolve: {
    //       requireNoAuth: function($state, Auth){
    //         return Auth.$requireAuth().then(function(auth){
    //           $state.go('home');
    //         }, function(error){
    //           return;
    //         });
    //       }
    //     }
    //   });
    $urlRouterProvider.otherwise('/');
  }])
.constant('FIREBASE_URL', 'https://starterlog-org.firebaseio.com/');
console.log('--> starterlog/app/app.js loaded');

'use strict';
app.factory('Auth', ["$firebaseAuth", "FIREBASE_URL", function($firebaseAuth, FIREBASE_URL){
    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);

    return auth;
  }]);
console.log('--> starterlog/app/auth/auth.service.js loaded');  

'use strict';
app.controller('AuthCtrl', ["Auth", "$state", function(Auth, $state){
    var authCtrl = this;

    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function (){
      Auth.$authWithPassword(authCtrl.user).then(function (auth){
        $state.go('home');
      }, function (error){
        authCtrl.error = error;
      });
    };

    authCtrl.register = function (){
      Auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      });
    };

  }]);
  console.log('--> starterlog/app/auth/auth.controller.js loaded');

'use strict';
app.factory('Users', ["$firebaseArray", "$firebaseObject", "FIREBASE_URL", function($firebaseArray, $firebaseObject, FIREBASE_URL){
    var usersRef = new Firebase(FIREBASE_URL+'users');
    var connectedRef = new Firebase(FIREBASE_URL+'.info/connected');
    var users = $firebaseArray(usersRef);
    var Users = {
      getProfile: function(uid){
        return $firebaseObject(usersRef.child(uid));
      },
      getDisplayName: function(uid){
        return users.$getRecord(uid).displayName;
      },
      getGravatar: function(uid){
        return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
      },
      setOnline: function(uid){
        var connected = $firebaseObject(connectedRef);
        var online = $firebaseArray(usersRef.child(uid+'/online'));

        connected.$watch(function (){
          if(connected.$value === true){
            online.$add(true).then(function(connectedRef){
              connectedRef.onDisconnect().remove();
            });
          }
        });
      },
      all: users
    };

    return Users;
  }]);
  console.log('--> starterlog/app/users/users.service.js loaded');

'use strict';
app.controller('ProfileCtrl', ["$state", "Auth", "md5", "auth", "profile", function($state, Auth, md5, auth, profile){
    var profileCtrl = this;
    profileCtrl.profile = profile;
    profileCtrl.updateProfile = function(){
      profileCtrl.profile.email = auth.password.email;
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('profile');
      });
    };
    profileCtrl.logout = function(){
      profileCtrl.profile.online = null;
      profileCtrl.profile.$save().then(function(){
        Auth.$unauth();
        $state.go('home');
      });
    };
  }]);

console.log('--> starterlog/app/users.profile.js loaded');
