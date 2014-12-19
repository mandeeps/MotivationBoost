(function() {

var imgList = [];
var quoteList = [];
var preloaded = false;
var quotesPreloaded = false;
var ALBUM_COUNT = 5;
var key = "JLYiQcoOOH5SeGb8vsPavRFmUj4V6oz4ITawDoJ3FvfQw8Hizf"

function loadImages() {
  
  function preLoad(count) {
    var preImg = [];
    var loaded = 0;
    for (var i = 0; i < count; i++) {
      preImg[i] = new Image();
      var selected = preImg[i];
      selected.src = imgList[i];
      selected.onload = function() {
        loaded++;
        if (loaded === count) {
          localforage.setItem('imgList', imgList, function(err, res) {
          });
          console.log('done preloading images');
          preloaded = true;
        }
      };
    }
  }

  var albumsLoaded = 0;
  var postsPerAlbum = 20;
  var iterator = 0;
  for (var i = 0; i < ALBUM_COUNT; i++) {
    $.ajax({
      dataType: 'jsonp',
      mimeType: 'textPlain',
      type: 'GET',
      crossDomain: true,
      url: 'http://api.tumblr.com/v2/blog/to-motivate-you.tumblr.com/posts/photo?api_key=' +key+ '&offset=' + iterator,

      success: function(images) {
        for (var y = 0; y < images.response.posts.length; y++) {
          imgList.push(images.response.posts[y].photos[0].original_size.url);
        }
        albumsLoaded++;

        if (albumsLoaded === ALBUM_COUNT) {
          //preLoad(imgList.length);
          //localforage.setItem('imgList', imgList, function(err, res) {
          //});
          preloaded = true;
        }
      },

      error: function(err) {
        console.log(err);
      }
    });
    iterator += postsPerAlbum;
  }
}

function showImage() {
  $('#quote').hide();
  $('#image').hide();
  $('#image').attr({'src' : ''});
  var randomNum = Math.floor(Math.random()*imgList.length);
  var curImg = imgList[randomNum];
  var height = $(window).height() - 50;
  $('#image').attr({'src' : curImg, 'height': height});
  $('#image').show();
}

function loadQuotes() {
  var postsPerAlbum = 20;
  var ALBUMS = 10;
  var iterator = 0;
  var loaded = 0;
  for (var i = 0; i < ALBUMS; i++) {
    $.ajax({
      dataType: "jsonp",
      mimeType: "textPlain",
      type: "GET",
      crossDomain: true,
      url: "http://api.tumblr.com/v2/blog/positiveinspiration.tumblr.com/posts/quote?api_key=" +key+ "&offset=" + iterator,

      success: function(quotes) {
        loaded++;
        for (var y = 0; y < quotes.response.posts.length; y++) {
          var source = quotes.response.posts[y].source;
          var temp = document.createElement('div');
          temp.innerHTML = source;
          var sourceEdit = temp.textContent;
          var sourceFinal = sourceEdit.split("(via");
          quoteList.push([quotes.response.posts[y].text, sourceFinal[0]]);
        }

        if (loaded === ALBUMS) {
          console.log('done loading quotes');
          quotesPreloaded = true;
          localforage.setItem('quoteList', quoteList, function(err, res) {
          });
        }

      },

      error: function(err) {
        console.log(err);
      }
    });
    iterator += postsPerAlbum;
  }
}

function showQuote() {
  $('#image').hide();
  var randomNum = Math.floor(Math.random()*quoteList.length);
  var curQuote = quoteList[randomNum];
  $('#quote').html(curQuote[0] + "<br>" + curQuote[1]);
  $('#quote').show();
}

function quoteFromLocal() {
  $.getJSON('quotes.json', function(result) {
    var randomNum = Math.floor(Math.random()*result.quotes.length);
    $('#image').hide();
    $('#quote').text(result.quotes[randomNum]);
    $('#quote').show();
  });
}

function loadContent() {
  if (!preloaded) {
    if (quotesPreloaded) {
      showQuote();
    } else {
      console.log('load local quote');
      quoteFromLocal();
    }
  } else {
    var randomNum = Math.floor(Math.random()*2) + 1;
    if (randomNum == 1) {
      showQuote();
    } else {
      showImage();
    }
  } 
}

$(document).ready(function() {
  FastClick.attach(document.body);
  localforage.getItem('quoteList').then(function(quoteStore, err) {
    if (quoteStore == null) {
      //console.log(err)
      console.log('quotes not preloaded, loading now...')
      loadQuotes();      
    } else {
      quotesPreloaded = true;
      quoteList = quoteStore;
    }
  });

/*  localforage.getItem('imgList').then(function(imgStore, err) {
    if (imgStore == null) {
      //console.log(err);
      console.log('images not preloaded, loading now...')
      loadImages();
    } else {
      preloaded = true;
      imgList = imgStore;
    }
  });*/
  if (!preloaded) {loadImages();}

  $('#next').on('click', function() {
    loadContent();
  });

});

}());