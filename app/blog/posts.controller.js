'use strict';

app.controller("PostsCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, $q, $injector, Posts, Tags) {

    $scope.posts = Posts();
    $scope.tags = Tags();

    // THIS IS NOT WORKING EITHER... DEFERRED PROMISE
    // TypeError: Cannot read property 'data' of undefined
    $scope.getTags = function() {
      var tagsArray = ['test']; //simply a test value
      var tagsRef = new Firebase(FIREBASE_URL + 'tags');
      console.log('Query Once Starting');
      return tagsRef.once('value').then(function(snapshot) {
          // The Promise was "fulfilled" (it succeeded).
          console.log('Query Start ForEach');

          // handle data
          angular.forEach (snapshot.val(), function(tag) {
            tagsArray.push(tag.name);
          });
          console.log('Promise was fulfilled');
          console.log(tagsArray);
          return tagsArray
        }, function(error) {
          // The Promise was rejected.
          console.log('Promise was rejected');
          console.error(error);
          return $q.reject(); // Error Callback must return a rejected promise
      });
      //return tagsArray;  //<-- This Works, but doesn't include
    };

    $scope.tagsArrayToString = function(tagsArray) {
      var output = [];
      var tags = tagsArray.map(function(tag) {
        return output.push(tag['text']);
      });
      return output.toString();
      //var values = tagsArray;
      //console.log(tagsArray.toString());

    };

    $scope.createTag = function(newTag) {
      var tag;
      tag.name = newTag.text;
      tag.createdAt = new Date().toString();
      $scope.tags.$add(tag).then(function() {
        console.log('[ TagsCtrl ] --> Tag Created');

        // redirect to /tags path after create
        //$state.go('tags');

      }).catch(function(error) {
        console.log(error);
      });
    };



    // THIS IS NOT WORKING EITHER... DEFERRED PROMISE
    // TypeError: Cannot read property 'data' of undefined
    $scope.deferredTags = function(){
      var tagsArray = [];
      function getTags(){
        var tagsArray = [];
        angular.forEach ($scope.tags, function(tag) {
          tagsArray.push(tag.name);
        });
        return tagsArray;
      }
      ;
      var q = $injector.get('$q');
      var deferred = q.defer();
      //deferred.resolve(['Tag9','Tag10']);
      deferred.resolve(getTags());

      return deferred.promise;
    };





    // $scope.asyncLoadTags = function(tags){
    //   return $q(function(resolve, reject) {
    //     if (tags) {
    //       deffered.resolve()
    //     } else {
    //       deffered.reject()
    //     }
    //   });
    // };


    $scope.loadTags = function() {
      var tagsArray = ["test"];

      $scope.tags.$loaded(function(data) {


        if(data) {
          console.log('We have Data');
          //console.log($scope.tags);
          angular.forEach ($scope.tags, function(tag) {
            tagsArray.push(tag.name);
          });
          console.log(tagsArray);
          console.log('Tags are Loaded... return tagsArray');
          return tagsArray;

        } else {

          console.log('Tag Data Is Not Loaded');
          return tagsArray;
        }

      });
      //console.log('Tags are not Loaded... return tagsArray');
      return tagsArray;

    };

    //   // Simple Test... tags must be returned in an array to work in UI autocomplete
    //   //var tags = ['firebase','javascript','node','bower','grunt','angular'];
    //   //return tags;
    //
    //var tagsArray = ['firebase','javascript','node','bower','grunt','angular'];
    //   // var ref = new Firebase(FIREBASE_URL + 'tags');
    //   // ref.once("value", function(snapshot) {
    //   // // The callback function will get called for each tag
    //   //   snapshot.forEach(function(childSnapshot) {
    //   //     // key will be "fred" the first time and "barney" the second time
    //   //     tagsArray.push(childSnapshot.key());
    //   //   });
    //return tagsArray;
    //
    //   // )};

    //
    //   console.log('This is a true statement');
    //   var tags = Tags();
    //   angular.forEach (tags, function(tag) {
    //       tagsArray.push(tag.name);
    //   });
    //
    //   console.log('ForEach Loop Done');
    //   return tagsArray;
    //   console.log(tagsArray.toString());
    // }




    // CORE CRUD FUNCTIONALITY
    // - CREATE ($add firebaseObject to synchronized firebaseArray)
    // - READ (get firebaseObject using stateParams and Firebase Reference)
    // - UPDATE ($save firebaseObject)
    // - DELETE ($remove firebaseObject)

    // CREATE - ADD A NEW POST TO FIREBASE
    $scope.create = function(post) {
      post.createdAt = new Date().toString();
      $scope.posts.$add(post).then(function() {
        console.log('[ PostsCtrl ] --> Blog Post Created');

        //$location.path('/posts');
        $state.go('blog-posts');

      }).catch(function(error) {
        console.log(error);
      });
    };

    // READ - GET A POST FROM FIREBASE ON PAGE INIT FOR /posts/edit/:id route
    $scope.getPost = function() {
      var ref = new Firebase(FIREBASE_URL + 'posts');
      $scope.post = $firebaseObject(ref.child($stateParams.postId));
    };

    // UPDATE - EDIT A POST AND SAVE IT TO FIREBASE
    $scope.update = function() {
      // save firebaseObject
      $scope.post.$save().then(function(){
        console.log('[ PostsCtrl ] --> Blog Post Updated');

        // redirect to /posts path after update
        $state.go('blog-posts');
      }).catch(function(error){
        console.log(error);
      });
    };

    // DELETE - REMOVE A POST FROM FIREBASE
    $scope.delete = function(post) {
        $scope.posts.$remove(post).then(function(){
            console.log('[ PostsCtrl ] --> Post Deleted');

            // redirect to /posts path after delete
            $state.go('blog-posts');
        }).catch(function(error){
            console.log(error);
        });
    };

    // LOAD TAGS
    // $scope.loadTags = function() {
    //   return Tags();
    // };

    // DATA TABLE SYNCHRONIZATION USING NG-TABLE

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.posts.$loaded().then(function(posts) {
      console.log(posts.length); // data is loaded here
      var data = posts;

      $scope.tablePosts = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: { title: 'asc' }  // initial sorting
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ? $filter('filter')(data, params.filter()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    // Listening for list updates to Posts to update DataTable
    var ref = new Firebase(FIREBASE_URL + 'posts');
    var list = $firebaseArray(ref);
    list.$watch(function(event) {
      console.log(event);
      $scope.posts.$loaded().then(function(){
        $scope.tablePosts.reload();
      });
    });

});

console.log('[ PostsController ] --> starterlog/app/blog/posts.controller.js loaded');
